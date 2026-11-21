-- TemAuto only. Preserve rows and public listing reads; restrict mutation to owners.
begin;
alter table public.cars enable row level security;
drop policy if exists "Visiem atļauts viss" on public.cars;
create policy "Public reads listings" on public.cars for select to anon, authenticated using (true);
create policy "Authenticated owners create listings" on public.cars for insert to authenticated
 with check (user_id = (select auth.uid()) and (select auth.uid()) is not null);
create policy "Owners update listings" on public.cars for update to authenticated
 using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Owners delete listings" on public.cars for delete to authenticated
 using (user_id = (select auth.uid()));
revoke all on public.cars from public, anon, authenticated;
grant select on public.cars to anon, authenticated;
grant delete on public.cars to authenticated;
do $$ declare editable text; creatable text; begin
 select string_agg(quote_ident(column_name), ',') into editable from information_schema.columns
 where table_schema='public' and table_name='cars' and column_name not in ('id','user_id','created_at','views','status');
 creatable := editable || ',user_id,created_at';
 execute 'grant update (' || editable || ') on public.cars to authenticated';
 execute 'grant insert (' || creatable || ') on public.cars to authenticated';
end $$;
-- Existing clients send created_at. Ignore that client value rather than break submission.
create or replace function public.temauto_set_listing_creation_time() returns trigger
 language plpgsql security invoker set search_path = '' as $$
begin new.created_at := now(); return new; end;
$$;
revoke all on function public.temauto_set_listing_creation_time() from public,anon,authenticated;
create trigger temauto_set_listing_creation_time before insert on public.cars
 for each row execute function public.temauto_set_listing_creation_time();
-- Narrow, fixed increment is the only anonymous mutation permitted on cars.
-- SECURITY DEFINER is required because anonymous callers have no UPDATE privilege.
create or replace function public.increment_view(car_id bigint) returns bigint
 language sql security definer set search_path = '' as $$
 update public.cars set views = coalesce(views,0)+1 where id=car_id returning views;
$$;
revoke all on function public.increment_view(bigint) from public, anon, authenticated;
grant execute on function public.increment_view(bigint) to anon, authenticated;

-- Profiles contain private email and a role; neither is public or user-authorizable.
drop policy if exists "Lietotāji var atjaunināt savu profilu" on public.profiles;
drop policy if exists "Lietotājs var labot savu profilu" on public.profiles;
drop policy if exists "Profilus var lasīt ikviens" on public.profiles;
drop policy if exists "Profilus var skatīt visi autorizētie" on public.profiles;
create policy "Users read their own profile" on public.profiles for select to authenticated using(id=(select auth.uid()));
revoke all on public.profiles from public,anon,authenticated;
grant select on public.profiles to authenticated;
alter function public.handle_new_user() set search_path = '';
revoke all on function public.handle_new_user() from public,anon,authenticated;

-- Do not allow anonymous uploads, non-image uploads or large direct-API bypasses.
drop policy if exists "Visi var augšupielādēt bildes" on storage.objects;
create policy "Authenticated users upload their own listing photos" on storage.objects for insert to authenticated
 with check (bucket_id='car-images' and owner_id=(select auth.uid())::text);
update storage.buckets set file_size_limit=1048576,
 allowed_mime_types=array['image/jpeg','image/png','image/webp'] where id='car-images';
-- Referencing a foreign file in a listing must never confer deletion rights.
drop policy if exists "Owner removes queued unused listing photos" on storage.objects;
create policy "Owner removes queued unused listing photos" on storage.objects for delete to authenticated
 using (bucket_id='car-images' and owner_id=(select auth.uid())::text
 and exists(select 1 from public.temauto_car_file_cleanup q where q.media_path=name and q.owner_user_id=(select auth.uid()))
 and not public.temauto_car_photo_in_use(name));
revoke all on public.temauto_car_file_cleanup from public,anon,authenticated;
grant select,delete on public.temauto_car_file_cleanup to authenticated;
revoke all on public.temauto_ad_file_cleanup from public,anon,authenticated;
grant select,insert,delete on public.temauto_ad_file_cleanup to authenticated;
revoke all on function public.temauto_queue_old_ad_file() from public,anon,authenticated;
revoke all on public.listings,public.listing_images,public.payments,public.regions_pricing,public.site_visits from public,anon,authenticated;
revoke all on sequence public.cars_id_seq from public,anon,authenticated;
grant usage on sequence public.cars_id_seq to authenticated;
notify pgrst,'reload schema';
commit;
