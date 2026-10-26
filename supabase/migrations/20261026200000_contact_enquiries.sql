-- Contact form enquiries. Apply once to the Jessica Mary Monk project only.
-- Follows the Hands submission pattern: anon can insert a pending row, and only an admin can read or update it.

begin;

create table public.contact_enquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  email text not null check (
    char_length(btrim(email)) between 3 and 254
    and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  topic text not null default '' check (topic in (
    '',
    'public-art',
    'exhibition',
    'community',
    'painting',
    'illustration',
    'general'
  )),
  message text not null check (char_length(btrim(message)) between 1 and 5000),
  privacy_consent boolean not null,
  privacy_consent_at timestamptz,
  status text not null default 'pending' check (status in ('pending', 'handled')),
  client_hash text not null check (client_hash ~ '^[a-f0-9]{64}$'),
  check (privacy_consent)
);

create index contact_enquiries_created_idx on public.contact_enquiries (created_at desc);
create index contact_enquiries_hash_idx on public.contact_enquiries (client_hash, created_at desc);

alter table public.contact_enquiries enable row level security;

revoke all on public.contact_enquiries from anon, authenticated;
grant insert on public.contact_enquiries to anon, authenticated;
grant select, update, delete on public.contact_enquiries to authenticated;

create policy contact_enquiries_insert on public.contact_enquiries
  for insert to anon, authenticated
  with check (
    status = 'pending'
    and privacy_consent
    and privacy_consent_at is not null
  );

create policy contact_enquiries_admin on public.contact_enquiries
  for select to authenticated
  using ((select private.is_admin()));
create policy contact_enquiries_admin_update on public.contact_enquiries
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));
create policy contact_enquiries_admin_delete on public.contact_enquiries
  for delete to authenticated
  using ((select private.is_admin()));

create function private.prepare_contact_enquiry()
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
    new.created_at := now();
    if not coalesce(new.privacy_consent, false) then
      raise exception 'Consent is required' using errcode = '42501';
    end if;
    new.privacy_consent := true;
    new.privacy_consent_at := now();
    if new.client_hash !~ '^[a-f0-9]{64}$' then
      raise exception 'Unable to accept this submission' using errcode = '42501';
    end if;
    select count(*) into recent
    from public.contact_enquiries
    where client_hash = new.client_hash
      and created_at > now() - interval '1 hour';
    if recent >= 6 then
      raise exception 'Too many submissions' using errcode = '42501';
    end if;
    select count(*) into burst
    from public.contact_enquiries
    where created_at > now() - interval '10 minutes';
    if burst >= 40 then
      raise exception 'Too many submissions' using errcode = '42501';
    end if;
    return new;
  end if;
  if not private.is_admin() then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;
  if new.status not in ('pending', 'handled') then
    raise exception 'Unable to accept this submission' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger contact_enquiries_prepare
  before insert or update on public.contact_enquiries
  for each row execute function private.prepare_contact_enquiry();

commit;
