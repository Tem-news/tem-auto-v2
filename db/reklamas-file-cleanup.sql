create table public.temauto_ad_file_cleanup (
 media_path text primary key check (media_path ~ '^[0-9a-f-]{36}\.(jpg|png|gif|webp|mp4|webm)$'),
 created_at timestamptz not null default now()
);
alter table public.temauto_ad_file_cleanup enable row level security;
grant select, insert, delete on public.temauto_ad_file_cleanup to authenticated;
create policy "Advertising owner manages pending file removal"
 on public.temauto_ad_file_cleanup for all to authenticated
 using (exists (select 1 from public.temauto_ad_admins where user_id = (select auth.uid())))
 with check (exists (select 1 from public.temauto_ad_admins where user_id = (select auth.uid())));
create function public.temauto_queue_old_ad_file() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
 if TG_OP = 'DELETE' or old.media_path is distinct from new.media_path then
  insert into public.temauto_ad_file_cleanup(media_path) values (old.media_path)
  on conflict (media_path) do nothing;
 end if;
 return null;
end;
$$;
revoke all on function public.temauto_queue_old_ad_file() from public;
grant execute on function public.temauto_queue_old_ad_file() to authenticated;
create trigger temauto_queue_old_ad_file
after update of media_path or delete on public.temauto_ads
for each row execute function public.temauto_queue_old_ad_file();
