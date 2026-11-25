-- Temporary: only the TemAuto owner may read visitor totals; recording remains public.
create or replace function public.temauto_visit_stats()
returns jsonb language plpgsql stable security definer set search_path = ''
as $function$
begin
  if auth.uid() is distinct from '6129ac66-bca4-49bf-8a55-b308c647e10c'::uuid then
    return '{}'::jsonb;
  end if;
  return (
    select jsonb_build_object('total', coalesce(sum(n),0), 'countries',
      coalesce(jsonb_object_agg(country,n) filter (where country<>''), '{}'::jsonb))
    from (
      select coalesce(country_code,'') country, count(*) n
      from temauto_analytics.visitors where counted_at > now()-interval '24 hours'
      group by country_code
    ) counts
  );
end;
$function$;
