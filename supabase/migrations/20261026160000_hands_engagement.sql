begin;

create table public.hands_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  hands_mean text not null check (char_length(btrim(hands_mean)) between 1 and 2000),
  hands_use text not null check (char_length(btrim(hands_use)) between 1 and 2000),
  piece_feel text not null check (char_length(btrim(piece_feel)) between 1 and 2000),
  display_name text not null default '' check (char_length(display_name) <= 80),
  name_display_consent boolean not null default false,
  name_display_consent_at timestamptz,
  name_display_status text not null default 'pending' check (name_display_status in ('pending', 'approved', 'rejected')),
  age_range text not null default '' check (age_range in ('', 'under-16', '16-17', '18-over', 'prefer-not')),
  is_school_or_group boolean not null default false,
  group_name text not null default '' check (char_length(group_name) <= 120),
  share_consent boolean not null,
  share_consent_at timestamptz,
  status text not null default 'pending' check (status in ('pending', 'approved', 'hidden')),
  client_hash text not null check (client_hash ~ '^[a-f0-9]{64}$'),
  check (name_display_status <> 'approved' or name_display_consent),
  check (share_consent)
);

create table public.hands_works (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null check (char_length(btrim(title)) between 1 and 160),
  credit text not null default '' check (char_length(credit) <= 120),
  writing text not null default '' check (char_length(writing) <= 8000),
  image_path text unique,
  display_name text not null default '' check (char_length(display_name) <= 80),
  name_display_consent boolean not null default false,
  name_display_consent_at timestamptz,
  name_display_status text not null default 'pending' check (name_display_status in ('pending', 'approved', 'rejected')),
  age_range text not null default '' check (age_range in ('', 'under-16', '16-17', '18-over', 'prefer-not')),
  is_school_or_group boolean not null default false,
  group_name text not null default '' check (char_length(group_name) <= 120),
  share_consent boolean not null,
  share_consent_at timestamptz,
  status text not null default 'pending' check (status in ('pending', 'approved', 'hidden')),
  client_hash text not null check (client_hash ~ '^[a-f0-9]{64}$'),
  check (name_display_status <> 'approved' or name_display_consent),
  check (share_consent),
  check (char_length(btrim(writing)) > 0 or image_path is not null)
);

create table public.hands_name_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  display_name text not null check (char_length(btrim(display_name)) between 1 and 80),
  place text not null default '' check (char_length(place) <= 120),
  took_part text not null default '' check (took_part in ('', 'yes', 'no', 'prefer-not')),
  name_display_consent boolean not null default false,
  name_display_consent_at timestamptz,
  name_display_status text not null default 'pending' check (name_display_status in ('pending', 'approved', 'rejected')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'hidden')),
  client_hash text not null check (client_hash ~ '^[a-f0-9]{64}$'),
  check (name_display_status <> 'approved' or name_display_consent)
);

create index hands_responses_created_idx on public.hands_responses (created_at desc);
create index hands_works_created_idx on public.hands_works (created_at desc);
create index hands_name_requests_created_idx on public.hands_name_requests (created_at desc);
create index hands_responses_hash_idx on public.hands_responses (client_hash, created_at desc);
create index hands_works_hash_idx on public.hands_works (client_hash, created_at desc);
create index hands_name_requests_hash_idx on public.hands_name_requests (client_hash, created_at desc);

alter table public.hands_responses enable row level security;
alter table public.hands_works enable row level security;
alter table public.hands_name_requests enable row level security;

revoke all on public.hands_responses, public.hands_works, public.hands_name_requests from anon, authenticated;
grant insert on public.hands_responses, public.hands_works, public.hands_name_requests to anon, authenticated;
grant select, update, delete on public.hands_responses, public.hands_works, public.hands_name_requests to authenticated;

create policy hands_responses_insert on public.hands_responses for insert to anon, authenticated
  with check (status = 'pending' and name_display_status = 'pending' and share_consent and (name_display_consent = false or name_display_consent_at is not null));
create policy hands_works_insert on public.hands_works for insert to anon, authenticated
  with check (status = 'pending' and name_display_status = 'pending' and share_consent and (name_display_consent = false or name_display_consent_at is not null));
create policy hands_name_requests_insert on public.hands_name_requests for insert to anon, authenticated
  with check (status = 'pending' and name_display_status = 'pending' and (name_display_consent = false or name_display_consent_at is not null));

create policy hands_responses_admin on public.hands_responses for select to authenticated using ((select private.is_admin()));
create policy hands_responses_admin_update on public.hands_responses for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy hands_responses_admin_delete on public.hands_responses for delete to authenticated using ((select private.is_admin()));
create policy hands_works_admin on public.hands_works for select to authenticated using ((select private.is_admin()));
create policy hands_works_admin_update on public.hands_works for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy hands_works_admin_delete on public.hands_works for delete to authenticated using ((select private.is_admin()));
create policy hands_name_requests_admin on public.hands_name_requests for select to authenticated using ((select private.is_admin()));
create policy hands_name_requests_admin_update on public.hands_name_requests for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy hands_name_requests_admin_delete on public.hands_name_requests for delete to authenticated using ((select private.is_admin()));

create function private.prepare_hands_submission()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  recent integer;
  burst integer;
begin
  if tg_op = 'INSERT' then
    new.status := 'pending';
    new.name_display_status := 'pending';
    new.created_at := now();
    if coalesce(new.name_display_consent, false) then
      new.name_display_consent := true;
      new.name_display_consent_at := now();
    else
      new.name_display_consent := false;
      new.name_display_consent_at := null;
    end if;
    if tg_table_name in ('hands_responses', 'hands_works') then
      if not coalesce(new.share_consent, false) then
        raise exception 'Consent is required' using errcode = '42501';
      end if;
      new.share_consent_at := now();
    end if;
    if new.client_hash !~ '^[a-f0-9]{64}$' then
      raise exception 'Unable to accept this submission' using errcode = '42501';
    end if;
    select
      (select count(*) from public.hands_responses where client_hash = new.client_hash and created_at > now() - interval '1 hour')
      + (select count(*) from public.hands_works where client_hash = new.client_hash and created_at > now() - interval '1 hour')
      + (select count(*) from public.hands_name_requests where client_hash = new.client_hash and created_at > now() - interval '1 hour')
    into recent;
    if recent >= 6 then
      raise exception 'Too many submissions' using errcode = '42501';
    end if;
    select
      (select count(*) from public.hands_responses where created_at > now() - interval '10 minutes')
      + (select count(*) from public.hands_works where created_at > now() - interval '10 minutes')
      + (select count(*) from public.hands_name_requests where created_at > now() - interval '10 minutes')
    into burst;
    if burst >= 40 then
      raise exception 'Too many submissions' using errcode = '42501';
    end if;
    return new;
  end if;
  if not private.is_admin() then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;
  if new.name_display_status = 'approved' and not coalesce(new.name_display_consent, false) then
    raise exception 'Name display requires consent' using errcode = '42501';
  end if;
  if char_length(btrim(coalesce(new.display_name, ''))) = 0 then
    new.name_display_status := 'pending';
  end if;
  return new;
end;
$$;

create trigger hands_responses_prepare before insert or update on public.hands_responses
  for each row execute function private.prepare_hands_submission();
create trigger hands_works_prepare before insert or update on public.hands_works
  for each row execute function private.prepare_hands_submission();
create trigger hands_name_requests_prepare before insert or update on public.hands_name_requests
  for each row execute function private.prepare_hands_submission();

create function public.approved_hands_names()
returns table (display_name text)
language sql
stable
security definer
set search_path = ''
as $$
  select distinct btrim(n.display_name) as display_name
  from (
    select display_name from public.hands_responses
      where name_display_consent and name_display_status = 'approved' and char_length(btrim(display_name)) > 0
    union all
    select display_name from public.hands_works
      where name_display_consent and name_display_status = 'approved' and char_length(btrim(display_name)) > 0
    union all
    select display_name from public.hands_name_requests
      where name_display_consent and name_display_status = 'approved' and char_length(btrim(display_name)) > 0
  ) n;
$$;

revoke all on function public.approved_hands_names() from public;
grant execute on function public.approved_hands_names() to anon, authenticated;

create function public.approved_hands_works()
returns table (
  id uuid,
  title text,
  writing text,
  image_path text,
  credit text,
  group_name text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    w.id,
    w.title,
    w.writing,
    w.image_path,
    case
      when w.name_display_consent and w.name_display_status = 'approved'
        then w.credit
      else ''
    end as credit,
    case when w.is_school_or_group then w.group_name else '' end as group_name
  from public.hands_works w
  where w.status = 'approved'
  order by w.created_at desc;
$$;

revoke all on function public.approved_hands_works() from public;
grant execute on function public.approved_hands_works() to anon, authenticated;

create function public.hands_work_image_is_public(p_path text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.hands_works
    where image_path = p_path
      and status = 'approved'
  );
$$;

revoke all on function public.hands_work_image_is_public(text) from public;
grant execute on function public.hands_work_image_is_public(text) to anon, authenticated;

create function public.discard_unlinked_hands_upload(p_path text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_path !~ '^[0-9a-f-]{36}\.webp$' then
    raise exception 'Invalid path';
  end if;
  if exists (select 1 from public.hands_works where image_path = p_path) then
    return;
  end if;
  delete from storage.objects where bucket_id = 'hands-works' and name = p_path;
end;
$$;

revoke all on function public.discard_unlinked_hands_upload(text) from public;
grant execute on function public.discard_unlinked_hands_upload(text) to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('hands-works', 'hands-works', false, 1572864, array['image/webp'])
on conflict (id) do nothing;

create policy hands_works_storage_insert on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'hands-works' and name ~ '^[0-9a-f-]{36}\.webp$');
create policy hands_works_storage_admin_read on storage.objects
  for select to authenticated
  using (bucket_id = 'hands-works' and (select private.is_admin()));
create policy hands_works_storage_public_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'hands-works' and public.hands_work_image_is_public(name));
create policy hands_works_storage_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'hands-works' and (select private.is_admin()));

commit;
