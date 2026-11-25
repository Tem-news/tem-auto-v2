create schema if not exists temauto_private;
revoke all on schema temauto_private from public, anon, authenticated;
grant usage on schema temauto_private to service_role;

create table public.temauto_messages (
 id uuid primary key,
 category text not null check(category in ('suggestions','advertising','legal','reports')),
 body text not null check(char_length(btrim(body)) between 3 and 10000),
 email text check(email is null or (char_length(email)<=254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$')),
 listing_url text check(listing_url is null or (char_length(listing_url)<=2048 and listing_url ~ '^https?://')),
 sender_user_id uuid references auth.users(id) on delete set null,
 language text not null default 'LV' check(char_length(language) between 2 and 8),
 country text check(char_length(country)<=160),
 created_at timestamptz not null default now(),
 read_at timestamptz,
 status text not null default 'new' check(status in ('new','processing','done'))
);
alter table public.temauto_messages enable row level security;
revoke all on public.temauto_messages from public, anon, authenticated;
grant select on public.temauto_messages to authenticated;
grant update(read_at,status) on public.temauto_messages to authenticated;
grant select,insert,update,delete on public.temauto_messages to service_role;
create policy "Only TemAuto owner reads letters" on public.temauto_messages
for select to authenticated using(exists(select 1 from public.temauto_ad_admins where user_id=(select auth.uid())));
create policy "Only TemAuto owner manages letters" on public.temauto_messages
for update to authenticated using(exists(select 1 from public.temauto_ad_admins where user_id=(select auth.uid())))
with check(exists(select 1 from public.temauto_ad_admins where user_id=(select auth.uid())));
create index temauto_messages_category_date on public.temauto_messages(category,created_at desc,id);
create index temauto_messages_unread on public.temauto_messages(category) where read_at is null;

create table temauto_private.message_rate_limits (
 fingerprint text primary key check(char_length(fingerprint)=64),
 window_start timestamptz not null,
 requests integer not null
);
alter table temauto_private.message_rate_limits enable row level security;
grant select,insert,update,delete on temauto_private.message_rate_limits to service_role;
create policy "Server manages message rate limits" on temauto_private.message_rate_limits
for all to service_role using(true) with check(true);

create function public.temauto_submit_message(
 p_id uuid,p_category text,p_body text,p_email text,p_listing_url text,
 p_sender_user_id uuid,p_language text,p_country text,p_fingerprint text
) returns boolean language plpgsql security invoker set search_path='' as $$
declare request_count integer;
begin
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_fingerprint,0));
 if exists(select 1 from public.temauto_messages where id=p_id) then return true; end if;
 delete from temauto_private.message_rate_limits where window_start < now()-interval '1 day';
 insert into temauto_private.message_rate_limits(fingerprint,window_start,requests)
 values(p_fingerprint,now(),1)
 on conflict(fingerprint) do update set
 requests=case when message_rate_limits.window_start<now()-interval '10 minutes' then 1 else message_rate_limits.requests+1 end,
 window_start=case when message_rate_limits.window_start<now()-interval '10 minutes' then now() else message_rate_limits.window_start end
 returning requests into request_count;
 if request_count>5 then return false; end if;
 insert into public.temauto_messages(id,category,body,email,listing_url,sender_user_id,language,country)
 values(p_id,p_category,btrim(p_body),nullif(btrim(p_email),''),nullif(btrim(p_listing_url),''),p_sender_user_id,p_language,p_country);
 return true;
end;
$$;
revoke all on function public.temauto_submit_message(uuid,text,text,text,text,uuid,text,text,text) from public, anon, authenticated;
grant execute on function public.temauto_submit_message(uuid,text,text,text,text,uuid,text,text,text) to service_role;
