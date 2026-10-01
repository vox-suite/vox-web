\set ON_ERROR_STOP on
begin;
create role anon;
create role authenticated;
create role supabase_auth_admin;
create schema auth;
create table auth.sessions (id uuid primary key, user_id uuid not null);
create table auth.identities (id uuid primary key, user_id uuid not null, provider text not null);
grant usage on schema auth to supabase_auth_admin;
grant select on auth.sessions, auth.identities to supabase_auth_admin;
\ir ../../supabase/migrations/20261001174921_consumer_session_identity_pins.sql
insert into auth.identities values ('11111111-1111-4111-8111-111111111111', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'google');
insert into auth.sessions values
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
 ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
 ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
create function pg_temp.event(method text, session_id text default 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb') returns jsonb language sql as $$
select jsonb_build_object('user_id', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'authentication_method', method,
 'claims', jsonb_build_object('sub', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'session_id', session_id, 'role', 'authenticated', 'aud', 'authenticated', 'is_anonymous', false,
 'vox_identity', jsonb_build_object('identity_id','untrusted-preexisting-claim')))
$$;
set role supabase_auth_admin;
do $$ begin
 if vox_auth.custom_access_token_hook(pg_temp.event('oauth'))->'claims'->'vox_identity'->>'identity_id' is distinct from '11111111-1111-4111-8111-111111111111' then raise exception 'fresh OAuth pin missing'; end if;
 if vox_auth.custom_access_token_hook(pg_temp.event('token_refresh'))->'claims'->'vox_identity' is null then raise exception 'valid refresh rejected'; end if;
 if vox_auth.custom_access_token_hook(pg_temp.event('token_refresh', 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'))->'claims' ? 'vox_identity' then raise exception 'refresh created pin'; end if;
 if vox_auth.custom_access_token_hook(pg_temp.event('otp', 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'))->'claims' ? 'vox_identity' then raise exception 'OTP inherited Google authority'; end if;
end $$;
reset role;
-- Automatic linking blocks both fresh and previously pinned sessions.
insert into auth.identities values ('22222222-2222-4222-8222-222222222222', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'email');
set role supabase_auth_admin;
do $$ begin
 if vox_auth.custom_access_token_hook(pg_temp.event('oauth'))->'claims' ? 'vox_identity' then raise exception 'multiidentity refresh allowed'; end if;
 if vox_auth.custom_access_token_hook(pg_temp.event('otp','cccccccc-cccc-4ccc-8ccc-cccccccccccc'))->'claims' ? 'vox_identity' then raise exception 'automatic link inherited authority'; end if;
end $$;
reset role;
-- Delete old Google and leave a sole replacement Google under the same user UUID.
delete from auth.identities;
insert into auth.identities values ('33333333-3333-4333-8333-333333333333', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'google');
set role supabase_auth_admin;
do $$ begin
 if vox_auth.custom_access_token_hook(pg_temp.event('token_refresh'))->'claims' ? 'vox_identity' then raise exception 'old session repinned replacement'; end if;
 if vox_auth.custom_access_token_hook(pg_temp.event('oauth'))->'claims' ? 'vox_identity' then raise exception 'old session overwritten'; end if;
 if vox_auth.custom_access_token_hook(pg_temp.event('oauth','cccccccc-cccc-4ccc-8ccc-cccccccccccc'))->'claims'->'vox_identity'->>'identity_id' is distinct from '33333333-3333-4333-8333-333333333333' then raise exception 'fresh replacement login failed'; end if;
 if (select identity_id from vox_auth.session_identity_pins where session_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb') is distinct from '11111111-1111-4111-8111-111111111111'::uuid then raise exception 'original pin mutated'; end if;
 if has_table_privilege(current_user, 'vox_auth.session_identity_pins', 'UPDATE') or has_table_privilege(current_user, 'vox_auth.session_identity_pins', 'DELETE') then raise exception 'hook can mutate pins'; end if;
end $$;
reset role;
-- Standalone email OTP works; unsupported identities and absent sessions do not.
delete from auth.identities;
insert into auth.identities values ('44444444-4444-4444-8444-444444444444', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'email');
set role supabase_auth_admin;
do $$ begin
 if vox_auth.custom_access_token_hook(pg_temp.event('otp','dddddddd-dddd-4ddd-8ddd-dddddddddddd'))->'claims'->'vox_identity'->>'provider' is distinct from 'email' then raise exception 'standalone OTP failed'; end if;
 if vox_auth.custom_access_token_hook(pg_temp.event('otp','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'))->'claims' ? 'vox_identity' then raise exception 'missing session accepted'; end if;
end $$;
reset role;
do $$ begin
 if has_function_privilege('anon','vox_auth.custom_access_token_hook(jsonb)','EXECUTE') or has_function_privilege('authenticated','vox_auth.custom_access_token_hook(jsonb)','EXECUTE') then raise exception 'public can call hook'; end if;
 if has_schema_privilege('authenticated','vox_auth','USAGE') then raise exception 'public can read pins'; end if;
end $$;
rollback;
