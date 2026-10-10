-- Dedicated TemAuto advertising access; existing listing policies are unchanged.
create table public.temauto_ad_admins (user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.temauto_ad_admins enable row level security;
revoke all on public.temauto_ad_admins from anon, authenticated;
grant select on public.temauto_ad_admins to authenticated;
create policy ad_admin_self_read on public.temauto_ad_admins for select to authenticated using (user_id = (select auth.uid()));
insert into public.temauto_ad_admins(user_id) select id from auth.users where lower(email)='virtuve2000@inbox.lv' and email_confirmed_at is not null;
create table public.temauto_ads (
 id uuid primary key default gen_random_uuid(),
 title text not null check (char_length(title) between 1 and 120),
 slot text not null check (slot in ('desktop_1','desktop_2','desktop_form_1','desktop_form_2','desktop_login','desktop_form_left_1','desktop_form_left_2','mobile_menu','mobile_list','mobile_brands')),
 media_path text not null check (media_path ~ '^[a-f0-9-]{36}\.(jpg|png|gif|webp|mp4|webm)$'),
 media_type text not null check (media_type in ('image','video')),
 target_url text not null check (target_url ~ '^https://[^/@[:space:]]+([/?#][^[:space:]]*)?$'),
 active boolean not null default false,
 starts_at timestamptz,
 ends_at timestamptz,
 created_at timestamptz not null default now(),
 check (starts_at is null or ends_at is null or ends_at > starts_at)
);
alter table public.temauto_ads enable row level security;
revoke all on public.temauto_ads from anon, authenticated;
grant select on public.temauto_ads to anon, authenticated;
grant insert, update, delete on public.temauto_ads to authenticated;
create policy ads_public_read on public.temauto_ads for select to anon, authenticated using (active and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now()));
create policy ads_admin_all on public.temauto_ads for all to authenticated using (exists(select 1 from public.temauto_ad_admins where user_id=(select auth.uid()))) with check (exists(select 1 from public.temauto_ad_admins where user_id=(select auth.uid())));
create index temauto_ads_slot_idx on public.temauto_ads(slot) where active;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values ('temauto-ads','temauto-ads',true,20971520,array['image/jpeg','image/png','image/gif','image/webp','video/mp4','video/webm']);
create policy ads_files_admin_select on storage.objects for select to authenticated using (bucket_id='temauto-ads' and exists(select 1 from public.temauto_ad_admins where user_id=(select auth.uid())));
create policy ads_files_admin_insert on storage.objects for insert to authenticated with check (bucket_id='temauto-ads' and exists(select 1 from public.temauto_ad_admins where user_id=(select auth.uid())));
create policy ads_files_admin_update on storage.objects for update to authenticated using (bucket_id='temauto-ads' and exists(select 1 from public.temauto_ad_admins where user_id=(select auth.uid()))) with check (bucket_id='temauto-ads' and exists(select 1 from public.temauto_ad_admins where user_id=(select auth.uid())));
create policy ads_files_admin_delete on storage.objects for delete to authenticated using (bucket_id='temauto-ads' and exists(select 1 from public.temauto_ad_admins where user_id=(select auth.uid())));
