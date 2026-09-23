BEGIN;

CREATE SCHEMA IF NOT EXISTS vox_web_auth;

CREATE TABLE vox_web_auth."user" (
  id uuid DEFAULT pg_catalog.gen_random_uuid() NOT NULL PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  "emailVerified" boolean NOT NULL,
  image text,
  "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "accountState" text DEFAULT 'active' NOT NULL,
  "coreUserContextId" text,
  "recoveryEnabledAt" timestamptz,
  CONSTRAINT user_account_state_check
    CHECK ("accountState" IN ('active', 'disabled')),
  CONSTRAINT user_core_context_unique UNIQUE ("coreUserContextId")
);

CREATE TABLE vox_web_auth.session (
  id uuid DEFAULT pg_catalog.gen_random_uuid() NOT NULL PRIMARY KEY,
  "expiresAt" timestamptz NOT NULL,
  token text NOT NULL UNIQUE,
  "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" timestamptz NOT NULL,
  "ipAddress" text,
  "userAgent" text,
  "authenticationMethod" text DEFAULT 'unknown' NOT NULL,
  "userId" uuid NOT NULL REFERENCES vox_web_auth."user" (id) ON DELETE CASCADE,
  CONSTRAINT session_authentication_method_check
    CHECK ("authenticationMethod" IN ('google', 'email-otp', 'unknown'))
);

CREATE TABLE vox_web_auth.account (
  id uuid DEFAULT pg_catalog.gen_random_uuid() NOT NULL PRIMARY KEY,
  "accountId" text NOT NULL,
  "providerId" text NOT NULL,
  "userId" uuid NOT NULL REFERENCES vox_web_auth."user" (id) ON DELETE CASCADE,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamptz,
  "refreshTokenExpiresAt" timestamptz,
  scope text,
  password text,
  "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" timestamptz NOT NULL,
  CONSTRAINT account_provider_identity_unique UNIQUE ("providerId", "accountId")
);

CREATE TABLE vox_web_auth.verification (
  id uuid DEFAULT pg_catalog.gen_random_uuid() NOT NULL PRIMARY KEY,
  identifier text NOT NULL,
  value text NOT NULL,
  "expiresAt" timestamptz NOT NULL,
  "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE vox_web_auth."rateLimit" (
  id uuid DEFAULT pg_catalog.gen_random_uuid() NOT NULL PRIMARY KEY,
  key text NOT NULL UNIQUE,
  count integer NOT NULL,
  "lastRequest" bigint NOT NULL
);

CREATE INDEX session_user_id_idx ON vox_web_auth.session ("userId");
CREATE UNIQUE INDEX user_email_lower_unique ON vox_web_auth."user" (lower(email));
CREATE INDEX session_expires_at_idx ON vox_web_auth.session ("expiresAt");
CREATE INDEX account_user_id_idx ON vox_web_auth.account ("userId");
CREATE INDEX verification_identifier_idx ON vox_web_auth.verification (identifier);
CREATE INDEX verification_expires_at_idx ON vox_web_auth.verification ("expiresAt");

COMMIT;
