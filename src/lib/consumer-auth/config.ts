import type { VoxCoreHostClientConfig } from "./core-host-client";
import { createPrivateKey } from "node:crypto";

type Environment = Record<string, string | undefined>;

export type ConsumerAuthEnabledConfig = {
  enabled: true;
  entryEnabled: boolean;
  appUrl: string;
  databaseUrl: string;
  authSecret: string;
  googleClientId: string;
  googleClientSecret: string;
  otpPepper: string;
  smtpUrl: string;
  emailFrom: string;
  sessionMaxAgeSeconds: number;
  otpExpiresInSeconds: number;
  otpAllowedAttempts: number;
  core: VoxCoreHostClientConfig;
};

export type ConsumerAuthConfig = { enabled: false } | ConsumerAuthEnabledConfig;

function required(environment: Environment, name: string) {
  const value = environment[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function secureSecret(environment: Environment, name: string) {
  const value = required(environment, name);
  if (value.length < 32)
    throw new Error(`${name} must be at least 32 characters`);
  return value;
}

function origin(value: string, name: string) {
  const url = new URL(value);
  if (!/^https?:$/.test(url.protocol) || url.pathname !== "/") {
    throw new Error(`${name} must be an HTTP(S) origin`);
  }
  if (
    url.protocol !== "https:" &&
    !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
  ) {
    throw new Error(`${name} must use HTTPS outside loopback development`);
  }
  return url.origin;
}

function smtpUrl(environment: Environment) {
  const value = required(environment, "VOX_AUTH_SMTP_URL");
  const url = new URL(value);
  if (!/^smtps?:$/.test(url.protocol)) {
    throw new Error("VOX_AUTH_SMTP_URL must use SMTP or SMTPS");
  }
  return value;
}

function ed25519PrivateKey(environment: Environment) {
  const value = required(environment, "VOX_IDENTITY_SIGNING_PRIVATE_KEY");
  try {
    const key = createPrivateKey({
      key: Buffer.from(value, "base64"),
      format: "der",
      type: "pkcs8",
    });
    if (key.asymmetricKeyType !== "ed25519") throw new Error("wrong key type");
  } catch {
    throw new Error(
      "VOX_IDENTITY_SIGNING_PRIVATE_KEY must be a base64 PKCS#8 Ed25519 key",
    );
  }
  return value;
}

function emailFrom(environment: Environment) {
  const value = required(environment, "VOX_AUTH_EMAIL_FROM");
  if (/[\r\n]/.test(value)) {
    throw new Error("VOX_AUTH_EMAIL_FROM must be a single header value");
  }
  return value;
}

/**
 * Everything the account features need to call Core: its URL and this host's
 * credential, issued by `POST /v1/host-apps`. Returns null when Core is not
 * configured, so routes answer 503 instead of failing.
 */
export function readCoreHostConfig(
  environment: Environment = process.env,
): VoxCoreHostClientConfig | null {
  if (!environment.VOX_CORE_URL?.trim()) return null;
  return {
    baseUrl: origin(required(environment, "VOX_CORE_URL"), "VOX_CORE_URL"),
    hostCredential: {
      credentialId: required(environment, "VOX_HOST_CREDENTIAL_ID"),
      audience: required(environment, "VOX_HOST_AUDIENCE"),
      secret: secureSecret(environment, "VOX_HOST_SECRET"),
    },
  };
}

/**
 * Configuration for the legacy Better Auth stack (`/api/account/auth/*` and
 * email-recovery enrollment). Sign-in itself runs on Supabase.
 */
export function readConsumerAuthConfig(
  environment: Environment = process.env,
): ConsumerAuthConfig {
  const featureFlag = environment.VOX_CONSUMER_AUTH_ENABLED;
  if (featureFlag !== "true" && featureFlag !== "false") {
    return { enabled: false };
  }

  const issuer = origin(
    required(environment, "VOX_IDENTITY_ISSUER"),
    "VOX_IDENTITY_ISSUER",
  );
  const databaseUrl = required(environment, "VOX_WEB_DATABASE_URL");
  if (!/^postgres(?:ql)?:\/\//.test(databaseUrl)) {
    throw new Error("VOX_WEB_DATABASE_URL must be a PostgreSQL URL");
  }

  return {
    enabled: true,
    entryEnabled: featureFlag === "true",
    appUrl: issuer,
    databaseUrl,
    authSecret: secureSecret(environment, "VOX_CONSUMER_AUTH_SECRET"),
    googleClientId: required(environment, "VOX_GOOGLE_CLIENT_ID"),
    googleClientSecret: required(environment, "VOX_GOOGLE_CLIENT_SECRET"),
    otpPepper: secureSecret(environment, "VOX_AUTH_OTP_PEPPER"),
    smtpUrl: smtpUrl(environment),
    emailFrom: emailFrom(environment),
    sessionMaxAgeSeconds: 8 * 60 * 60,
    otpExpiresInSeconds: 10 * 60,
    otpAllowedAttempts: 5,
    core: {
      baseUrl: origin(required(environment, "VOX_CORE_URL"), "VOX_CORE_URL"),
      hostCredential: {
        credentialId: required(environment, "VOX_HOST_CREDENTIAL_ID"),
        audience: required(environment, "VOX_HOST_AUDIENCE"),
        secret: secureSecret(environment, "VOX_HOST_SECRET"),
      },
      identityAdapterKey: required(environment, "VOX_IDENTITY_ADAPTER_KEY"),
      identityCredential: {
        issuer,
        audience: required(environment, "VOX_IDENTITY_AUDIENCE"),
        privateKeyPkcs8Base64: ed25519PrivateKey(environment),
      },
    },
  };
}
