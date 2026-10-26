begin;
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create table public.admin_users (
 user_id uuid primary key references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated;
create policy own_membership on public.admin_users for select to authenticated using (user_id = (select auth.uid()));

create function private.is_admin() returns boolean language sql stable security definer set search_path = '' as $$
 select (select auth.uid()) is not null
 and exists(select 1 from public.admin_users where user_id = (select auth.uid()))
 and exists(select 1 from auth.sessions where user_id = (select auth.uid()) and id::text = (select auth.jwt()->>'session_id'));
$$;
revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to anon, authenticated;


create table public.cms_entries (
 id uuid primary key default gen_random_uuid(),
 kind text not null check (kind in ('page','project','artwork')),
 slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 120),
 title text not null check (length(title) between 1 and 200),
 body jsonb not null default '{"fields":{},"images":[],"featured":false}',
 sort_order integer not null default 0 check (sort_order between 0 and 9999),
 revision integer not null default 0,
 updated_at timestamptz not null default now(),
 unique(kind, slug),
 check (kind <> 'page' or slug in ('home','about','contact')),
 check (jsonb_typeof(body->'fields') = 'object' and jsonb_typeof(body->'images') = 'array' and jsonb_array_length(body->'images') <= 30),
 check (octet_length(body::text) <= 300000)
);
create table public.cms_public (
 id uuid primary key references public.cms_entries(id) on delete cascade,
 kind text not null check (kind in ('page','project','artwork')),
 slug text not null,
 title text not null,
 body jsonb not null,
 sort_order integer not null default 0,
 published_at timestamptz not null default now(),
 unique(kind, slug)
);
create index cms_public_order_idx on public.cms_public(kind, sort_order, published_at);
create table public.cms_assets (
 id uuid primary key default gen_random_uuid(),
 entry_id uuid not null references public.cms_entries(id) on delete cascade,
 storage_path text not null unique,
 filename text not null,
 width integer not null check(width > 0),
 height integer not null check(height > 0),
 bytes integer not null check(bytes between 1 and 3145728),
 created_at timestamptz not null default now()
);
create index cms_assets_entry_idx on public.cms_assets(entry_id);

alter table public.cms_entries enable row level security;
alter table public.cms_public enable row level security;
alter table public.cms_assets enable row level security;
revoke all on public.cms_entries, public.cms_public, public.cms_assets from anon, authenticated;
grant select, insert, update, delete on public.cms_entries, public.cms_assets to authenticated;
grant select on public.cms_public, public.cms_assets to anon, authenticated;
grant insert, update, delete on public.cms_public to authenticated;
create policy admin_snapshots on public.cms_public for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy admin_entries on public.cms_entries for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy public_snapshots on public.cms_public for select to anon, authenticated using (true);
create policy admin_assets on public.cms_assets for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy published_assets on public.cms_assets for select to anon, authenticated using (
 exists(select 1 from public.cms_public p where p.id = entry_id and p.body->'images' @> jsonb_build_array(jsonb_build_object('id', cms_assets.id::text)))
);

create function private.entry_revision() returns trigger language plpgsql set search_path = '' as $$
begin
 if new.kind <> old.kind or (old.kind = 'page' and new.slug <> old.slug) then raise exception 'Content type and fixed page URL cannot change'; end if;
 new.revision := old.revision + 1;
 new.updated_at := now();
 return new;
end;
$$;
create trigger entry_revision before update on public.cms_entries for each row execute function private.entry_revision();

-- Explicitly authorised, atomic publication: no public role can write snapshots.
create function public.save_cms_entry(p_id uuid, p_revision integer, p_slug text, p_title text, p_body jsonb, p_sort_order integer, p_publish boolean default false)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare saved public.cms_entries;
begin
 if not private.is_admin() then raise exception 'Administrator access required' using errcode='42501'; end if;
 select * into saved from public.cms_entries where id = p_id for update;
 if not found then raise exception 'Content not found'; end if;
 if saved.revision <> p_revision then raise exception 'This content changed in another window. Reload before saving.'; end if;
 if jsonb_typeof(p_body->'fields') is distinct from 'object' or jsonb_typeof(p_body->'images') is distinct from 'array' then raise exception 'Invalid content'; end if;
 if exists(select 1 from jsonb_array_elements(p_body->'images') image where not exists (
   select 1 from public.cms_assets a where a.id::text = image->>'id' and a.entry_id = p_id
 ) or coalesce(length(btrim(image->>'alt')),0) = 0) then raise exception 'Each image must belong to this entry and have alternative text'; end if;
 update public.cms_entries set slug=p_slug, title=p_title, body=p_body, sort_order=p_sort_order where id=p_id returning * into saved;
 if p_publish then
   insert into public.cms_public(id,kind,slug,title,body,sort_order,published_at)
   values(saved.id,saved.kind,saved.slug,saved.title,saved.body,saved.sort_order,now())
   on conflict(id) do update set slug=excluded.slug,title=excluded.title,body=excluded.body,sort_order=excluded.sort_order,published_at=excluded.published_at;
 end if;
 return to_jsonb(saved);
end;
$$;
revoke all on function public.save_cms_entry(uuid,integer,text,text,jsonb,integer,boolean) from public, anon;
grant execute on function public.save_cms_entry(uuid,integer,text,text,jsonb,integer,boolean) to authenticated;

create function public.unpublish_cms_entry(p_id uuid, p_revision integer) returns void language plpgsql security invoker set search_path = '' as $$
declare current_revision integer;
begin
 if not private.is_admin() then raise exception 'Administrator access required' using errcode='42501'; end if;
 select revision into current_revision from public.cms_entries where id=p_id for update;
 if not found or current_revision <> p_revision then raise exception 'Content changed. Reload before unpublishing.'; end if;
 if exists(select 1 from public.cms_entries where id=p_id and kind='page') then raise exception 'Fixed pages cannot be unpublished'; end if;
 delete from public.cms_public where id=p_id;
 update public.cms_entries set updated_at=now() where id=p_id;
end;
$$;
revoke all on function public.unpublish_cms_entry(uuid,integer) from public, anon;
grant execute on function public.unpublish_cms_entry(uuid,integer) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('cms-images','cms-images',false,3145728,array['image/webp']);
create policy cms_admin_upload on storage.objects for insert to authenticated with check (bucket_id='cms-images' and (select private.is_admin()));
create policy cms_admin_read on storage.objects for select to authenticated using (bucket_id='cms-images' and (select private.is_admin()));
create policy cms_admin_delete on storage.objects for delete to authenticated using (bucket_id='cms-images' and (select private.is_admin()));
create policy cms_public_read on storage.objects for select to anon, authenticated using (
 bucket_id='cms-images' and exists(select 1 from public.cms_assets a where a.storage_path=name)
);
commit;
