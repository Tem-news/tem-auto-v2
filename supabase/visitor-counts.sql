-- Anonymous browser visits; only aggregate statistics are public.
create schema if not exists temauto_analytics;
revoke all on schema temauto_analytics from public, anon, authenticated;
create table temauto_analytics.visitors (
  visitor_id uuid primary key,
  counted_at timestamptz not null default now(),
  country_code text check (country_code ~ '^[a-z]{2}$')
);
alter table temauto_analytics.visitors enable row level security;
create index visitors_counted_at_idx on temauto_analytics.visitors(counted_at);
create function public.temauto_visit_stats() returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('total', coalesce(sum(n), 0), 'countries',
    coalesce(jsonb_object_agg(country, n) filter (where country <> ''), '{}'::jsonb))
  from (select coalesce(country_code, '') country, count(*) n
    from temauto_analytics.visitors where counted_at > now() - interval '24 hours'
    group by country_code) counts;
$$;
create function public.temauto_record_visit(p_visitor_id uuid, p_country text default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  if p_visitor_id is null then raise exception 'Visitor required'; end if;
  insert into temauto_analytics.visitors as existing(visitor_id, country_code)
    values (p_visitor_id, case when p_country ~ '^[a-z]{2}$' then p_country else null end)
  on conflict (visitor_id) do update set counted_at = now(), country_code = excluded.country_code
    where existing.counted_at <= now() - interval '24 hours';
  return public.temauto_visit_stats();
end;
$$;
revoke all on function public.temauto_visit_stats() from public;
revoke all on function public.temauto_record_visit(uuid, text) from public;
grant execute on function public.temauto_visit_stats() to anon, authenticated;
grant execute on function public.temauto_record_visit(uuid, text) to anon, authenticated;
