create function public.cms_admin_access() returns boolean language sql stable security invoker set search_path = '' as $$ select private.is_admin(); $$;
revoke all on function public.cms_admin_access() from public, anon;
grant execute on function public.cms_admin_access() to authenticated;
