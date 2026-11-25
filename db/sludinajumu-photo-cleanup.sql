create table public.temauto_car_file_cleanup (
 media_path text primary key,
 owner_user_id uuid not null,
 created_at timestamptz not null default now()
);
alter table public.temauto_car_file_cleanup enable row level security;
grant select, delete on public.temauto_car_file_cleanup to authenticated;
create policy "Listing owner reads and clears pending photos"
on public.temauto_car_file_cleanup for all to authenticated
using(owner_user_id = (select auth.uid()))
with check(false);

create function public.temauto_car_photo_path(photo_url text) returns text
language sql immutable security invoker set search_path = '' as $$
 select substring(photo_url from '^https://ukzuybqfuvhmygyivcnp[.]supabase[.]co/storage/v1/object/public/car-images/([A-Za-z0-9._/-]+)$')
$$;
revoke all on function public.temauto_car_photo_path(text) from public;
grant execute on function public.temauto_car_photo_path(text) to authenticated;

create function public.temauto_car_photo_in_use(file_path text) returns boolean
language sql stable security invoker set search_path = '' as $$
 select exists (
  select 1 from public.cars c,
  lateral unnest(coalesce(c.images, array[]::text[]) || array[c.image,c.image_url]) u(url)
  where public.temauto_car_photo_path(u.url) = file_path
 )
$$;
revoke all on function public.temauto_car_photo_in_use(text) from public;
grant execute on function public.temauto_car_photo_in_use(text) to authenticated;

create function public.temauto_queue_removed_car_photos() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
 old_urls text[];
 new_urls text[];
 photo_url text;
 photo_path text;
begin
 -- Queue only changes made by the listing owner. Never give a caller
 -- permission to delete another user's storage files.
 if old.user_id is null or old.user_id is distinct from auth.uid() then return null; end if;
 old_urls := coalesce(old.images,array[]::text[]) || array[old.image,old.image_url];
 new_urls := array[]::text[];
 if TG_OP = 'UPDATE' then
  new_urls := coalesce(new.images,array[]::text[]) || array[new.image,new.image_url];
 end if;
 foreach photo_url in array old_urls loop
  photo_path := public.temauto_car_photo_path(photo_url);
  if photo_path is not null and not exists(
   select 1 from unnest(new_urls) u(url) where public.temauto_car_photo_path(u.url)=photo_path
  ) then
   insert into public.temauto_car_file_cleanup(media_path,owner_user_id)
   values(photo_path,old.user_id) on conflict(media_path) do nothing;
  end if;
 end loop;
 return null;
end;
$$;
revoke all on function public.temauto_queue_removed_car_photos() from public, anon, authenticated;
create trigger temauto_queue_removed_car_photos
after update of images,image,image_url or delete on public.cars
for each row execute function public.temauto_queue_removed_car_photos();

create policy "Owner removes queued unused listing photos"
on storage.objects for delete to authenticated
using (
 bucket_id='car-images'
 and exists(select 1 from public.temauto_car_file_cleanup q
  where q.media_path=name and q.owner_user_id=(select auth.uid()))
 and not public.temauto_car_photo_in_use(name)
);
