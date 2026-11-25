-- Run in a transaction: no listings, messages or files are persisted by this test.
begin;
do $$
declare own_id bigint; n integer; checks integer:=0;
 actor uuid:='337b17da-c545-4855-acd8-f4727b783549';
 other_user uuid:='6129ac66-bca4-49bf-8a55-b308c647e10c';
begin
 insert into public.cars(id,user_id,make,model,year) overriding system value values(-910000001,actor,'SECURITY_TEST','ROLLBACK',2020);
 perform set_config('request.jwt.claims','{"role":"anon"}',true);
 set local role anon;
 select count(*) into n from public.cars; if n<1 then raise exception 'public catalogue broken'; end if; checks:=checks+1;
 begin update public.cars set price=1 where id=-910000001; raise exception 'anonymous update allowed'; exception when insufficient_privilege then checks:=checks+1; end;
 begin delete from public.cars where id=-910000001; raise exception 'anonymous delete allowed'; exception when insufficient_privilege then checks:=checks+1; end;
 begin insert into public.cars(make) values('BAD'); raise exception 'anonymous insert allowed'; exception when insufficient_privilege then checks:=checks+1; end;
 begin perform id from public.profiles limit 1; raise exception 'anonymous profiles exposed'; exception when insufficient_privilege then checks:=checks+1; end;
 select public.increment_view(-910000001) into n; if n<>1 then raise exception 'anonymous increment broken'; end if; checks:=checks+1;
 begin insert into storage.objects(bucket_id,name) values('car-images','__security_audit_anon.jpg'); raise exception 'anonymous upload allowed'; exception when insufficient_privilege then checks:=checks+1; end;
 reset role;
 perform set_config('request.jwt.claims',jsonb_build_object('role','authenticated','sub',other_user)::text,true);
 set local role authenticated;
 update public.cars set price=1 where id=-910000001; get diagnostics n=row_count; if n<>0 then raise exception 'foreign edit allowed'; end if; checks:=checks+1;
 delete from public.cars where id=-910000001; get diagnostics n=row_count; if n<>0 then raise exception 'foreign deletion allowed'; end if; checks:=checks+1;
 select count(*) into n from public.profiles where id<>other_user; if n<>0 then raise exception 'foreign profiles exposed'; end if; checks:=checks+1;
 select count(*) into n from public.temauto_ads; -- owner can still read ad management
 checks:=checks+1;
 reset role;
 perform set_config('request.jwt.claims',jsonb_build_object('role','authenticated','sub',actor)::text,true);
 set local role authenticated;
 update public.cars set price=2 where id=-910000001; get diagnostics n=row_count; if n<>1 then raise exception 'own edit broken'; end if; checks:=checks+1;
 begin update public.cars set user_id=other_user where id=-910000001; raise exception 'owner reassignment allowed'; exception when insufficient_privilege then checks:=checks+1; end;
 begin update public.cars set views=999 where id=-910000001; raise exception 'arbitrary views write allowed'; exception when insufficient_privilege then checks:=checks+1; end;
 begin update public.profiles set role=role where id=actor; raise exception 'profile role write allowed'; exception when insufficient_privilege then checks:=checks+1; end;
 begin insert into public.cars(user_id,make) values(other_user,'BAD'); raise exception 'forged ownership allowed'; exception when insufficient_privilege then checks:=checks+1; end;
 begin insert into public.cars(make) values('BAD'); raise exception 'unowned insert allowed'; exception when insufficient_privilege then checks:=checks+1; end;
 insert into public.cars(user_id,make,model,year) values(actor,'SECURITY_TEST','ROLLBACK',2020) returning id into own_id; checks:=checks+1;
 delete from public.cars where id=own_id; get diagnostics n=row_count; if n<>1 then raise exception 'own delete broken'; end if; checks:=checks+1;
 select count(*) into n from public.temauto_messages; if n<>0 then raise exception 'letters exposed'; end if; checks:=checks+1;
 select count(*) into n from public.temauto_ad_admins; if n<>0 then raise exception 'owner membership exposed'; end if; checks:=checks+1;
 begin update public.temauto_ads set title='BAD'; get diagnostics n=row_count; if n<>0 then raise exception 'ads writable'; end if; checks:=checks+1; end;
 reset role;
 perform set_config('temauto.audit_checks',checks::text,true);
end $$;
select current_setting('temauto.audit_checks')::int passed_checks, 'ALL TRANSACTIONAL TEST CHANGES ROLLED BACK' outcome;
rollback;
