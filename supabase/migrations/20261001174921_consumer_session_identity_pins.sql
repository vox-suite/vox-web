-- Provider adapter state; never exposed through the public Data API.
create schema vox_auth;
revoke all on schema vox_auth from public, anon, authenticated;
grant usage on schema vox_auth to supabase_auth_admin;

create table vox_auth.session_identity_pins (
  session_id uuid primary key,
  user_id uuid not null,
  identity_id uuid not null,
  provider text not null check (provider in ('email', 'google')),
  created_at timestamptz not null default now()
);
alter table vox_auth.session_identity_pins enable row level security;
-- Only the trusted Auth hook can insert/read. No update/delete grants or public policy.
grant select, insert on vox_auth.session_identity_pins to supabase_auth_admin;
create policy auth_hook_read on vox_auth.session_identity_pins
  for select to supabase_auth_admin using (true);
create policy auth_hook_insert on vox_auth.session_identity_pins
  for insert to supabase_auth_admin with check (true);

create function vox_auth.custom_access_token_hook(event jsonb)
returns jsonb language plpgsql volatile
set search_path = ''
as $$
declare
  claims jsonb := (event->'claims') - 'vox_identity';
  actor_id uuid := (event->>'user_id')::uuid;
  pin_session_id uuid := (event->'claims'->>'session_id')::uuid;
  method text := event->>'authentication_method';
  identity_ids uuid[];
  providers text[];
  pin vox_auth.session_identity_pins%rowtype;
begin
  -- Return a valid Supabase token without Vox authority on any policy mismatch.
  if claims->>'sub' is distinct from actor_id::text or
     claims->>'role' is distinct from 'authenticated' or
     claims->>'aud' is distinct from 'authenticated' or
     claims->>'is_anonymous' is distinct from 'false' or
     not exists (select 1 from auth.sessions s where s.id = pin_session_id and s.user_id = actor_id)
  then return jsonb_build_object('claims', claims); end if;

  select array_agg(i.id), array_agg(i.provider) into identity_ids, providers
    from auth.identities i where i.user_id = actor_id;
  if cardinality(identity_ids) is distinct from 1 or
     providers[1] not in ('email', 'google')
  then return jsonb_build_object('claims', claims); end if;

  select p.* into pin from vox_auth.session_identity_pins p where p.session_id = pin_session_id;
  if not found then
    -- A refresh must never create a pin from the current merged user record.
    if not ((providers[1] = 'google' and method = 'oauth') or
            (providers[1] = 'email' and method in ('otp', 'magiclink', 'email/signup')))
    then return jsonb_build_object('claims', claims); end if;
    insert into vox_auth.session_identity_pins(session_id, user_id, identity_id, provider)
      values (pin_session_id, actor_id, identity_ids[1], providers[1]) on conflict do nothing;
    select p.* into pin from vox_auth.session_identity_pins p where p.session_id = pin_session_id;
  end if;
  if pin.user_id is distinct from actor_id or pin.identity_id is distinct from identity_ids[1] or
     pin.provider is distinct from providers[1] or
     not (method = 'token_refresh' or
          (pin.provider = 'google' and method = 'oauth') or
          (pin.provider = 'email' and method in ('otp', 'magiclink', 'email/signup')))
  then return jsonb_build_object('claims', claims); end if;

  claims := jsonb_set(claims, '{vox_identity}', jsonb_build_object(
    'version', 1, 'session_id', pin.session_id, 'user_id', pin.user_id,
    'identity_id', pin.identity_id, 'provider', pin.provider));
  return jsonb_build_object('claims', claims);
end;
$$;
revoke all on function vox_auth.custom_access_token_hook(jsonb) from public, anon, authenticated;
grant execute on function vox_auth.custom_access_token_hook(jsonb) to supabase_auth_admin;
-- Auth's existing privileges supply read access to auth.sessions/auth.identities.
-- There is deliberately no FK to identities: deleting an identity cannot delete
-- its pin and let an old session bind a replacement identity on refresh.
