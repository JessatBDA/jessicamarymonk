begin;
drop policy admin_snapshots on public.cms_public;
create policy admin_snapshot_insert on public.cms_public for insert to authenticated with check ((select private.is_admin()));
create policy admin_snapshot_update on public.cms_public for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy admin_snapshot_delete on public.cms_public for delete to authenticated using ((select private.is_admin()));
drop policy admin_assets on public.cms_assets;
drop policy published_assets on public.cms_assets;
create policy admin_asset_insert on public.cms_assets for insert to authenticated with check ((select private.is_admin()));
create policy admin_asset_update on public.cms_assets for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy admin_asset_delete on public.cms_assets for delete to authenticated using ((select private.is_admin()));
create policy public_asset_read on public.cms_assets for select to anon using (
 exists(select 1 from public.cms_public p where p.id=entry_id and p.body->'images' @> jsonb_build_array(jsonb_build_object('id',cms_assets.id::text)))
);
create policy authenticated_asset_read on public.cms_assets for select to authenticated using (
 (select private.is_admin()) or exists(select 1 from public.cms_public p where p.id=entry_id and p.body->'images' @> jsonb_build_array(jsonb_build_object('id',cms_assets.id::text)))
);
commit;
