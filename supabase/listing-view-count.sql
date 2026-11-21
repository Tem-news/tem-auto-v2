-- Listing IDs are bigint, not UUID. Return the atomic updated count.
drop function if exists public.increment_view(uuid);
create or replace function public.increment_view(car_id bigint)
returns bigint language sql security invoker set search_path = '' as $$
  update public.cars set views = coalesce(views, 0) + 1
  where id = car_id returning views;
$$;
revoke all on function public.increment_view(bigint) from public;
grant execute on function public.increment_view(bigint) to anon, authenticated;
