import {
  createHmac,
  createPrivateKey,
  randomUUID,
  sign as signEd25519,
} from "node:crypto";

export type HostCredential = {
  credentialId: string;
  audience: string;
  secret: string;
};

export type HostContext = {
  hostUserId: string;
  organizationExternalKey: string | null;
};

type AssertionClock = {
  issuedAtSeconds: number;
  nonce: string;
};

export type FederatedIdentityCredential = {
  issuer: string;
  audience: string;
  privateKeyPkcs8Base64: string;
};

type FederatedClock = AssertionClock & { expiresAtSeconds: number };

export type VoxCoreHostClientConfig = {
  baseUrl: string;
  hostCredential: HostCredential;
  identityCredential: FederatedIdentityCredential;
  identityAdapterKey: string;
};

type VoxCoreHostClientDependencies = {
  fetch: typeof globalThis.fetch;
  now: () => number;
  nonce: () => string;
};

function canonical(prefix: string, fields: string[]) {
  return fields.reduce(
    (value, field) => `${value}|${Buffer.byteLength(field, "utf8")}:${field}`,
    prefix,
  );
}

export function createHostAssertion(
  credential: HostCredential,
  context: HostContext,
  clock: AssertionClock = {
    issuedAtSeconds: Math.floor(Date.now() / 1_000),
    nonce: randomUUID(),
  },
) {
  const canonicalValue = canonical("vox-host-assertion-v1", [
    credential.credentialId,
    credential.audience,
    String(clock.issuedAtSeconds),
    clock.nonce,
    context.hostUserId.trim(),
    context.organizationExternalKey?.trim() ?? "",
  ]);
  const signature = createHmac("sha256", credential.secret)
    .update(canonicalValue, "utf8")
    .digest("hex");

  return {
    headers: {
      "X-Vox-Host-Credential": credential.credentialId,
      "X-Vox-Host-Secret": credential.secret,
      "X-Vox-Host-Audience": credential.audience,
      "X-Vox-Host-Timestamp": String(clock.issuedAtSeconds),
      "X-Vox-Host-Nonce": clock.nonce,
      "X-Vox-Host-Signature": signature,
    },
  };
}

export function createFederatedProof(
  credential: FederatedIdentityCredential,
  subject: string,
  clock: FederatedClock = {
    issuedAtSeconds: Math.floor(Date.now() / 1_000),
    expiresAtSeconds: Math.floor(Date.now() / 1_000) + 300,
    nonce: randomUUID(),
  },
) {
  const normalizedSubject = subject.trim();
  const message = canonical("vox-federated-identity-v1", [
    credential.issuer,
    credential.audience,
    normalizedSubject,
    String(clock.issuedAtSeconds),
    String(clock.expiresAtSeconds),
    clock.nonce,
  ]);
  const key = createPrivateKey({
    key: Buffer.from(credential.privateKeyPkcs8Base64, "base64"),
    format: "der",
    type: "pkcs8",
  });
  const signature = signEd25519(null, Buffer.from(message, "utf8"), key);

  return {
    issuer: credential.issuer,
    audience: credential.audience,
    subject: normalizedSubject,
    issued_at: clock.issuedAtSeconds,
    expires_at: clock.expiresAtSeconds,
    nonce: clock.nonce,
    signature: signature.toString("hex"),
  };
}

export class VoxCoreHostClient {
  constructor(
    private readonly config: VoxCoreHostClientConfig,
    private readonly dependencies: VoxCoreHostClientDependencies = {
      fetch: globalThis.fetch,
      now: () => Math.floor(Date.now() / 1_000),
      nonce: randomUUID,
    },
  ) {}

  async authenticateAccount(accountId: string, establishedContextId?: string) {
    const hostUserId = `vox-account:${accountId}`;
    const hostContext: HostContext = {
      hostUserId,
      organizationExternalKey: null,
    };
    const issuedAtSeconds = this.dependencies.now();
    const assertion = createHostAssertion(
      this.config.hostCredential,
      hostContext,
      { issuedAtSeconds, nonce: this.dependencies.nonce() },
    );
    const proof = createFederatedProof(
      this.config.identityCredential,
      hostUserId,
      {
        issuedAtSeconds,
        expiresAtSeconds: issuedAtSeconds + 300,
        nonce: this.dependencies.nonce(),
      },
    );
    const response = await this.dependencies.fetch(
      new URL("/v1/identity/authentications", this.config.baseUrl),
      {
        method: "POST",
        headers: {
          ...assertion.headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          host_context: {
            host_user_id: hostContext.hostUserId,
            organization_external_key: null,
          },
          authentication: {
            adapter_external_key: this.config.identityAdapterKey,
            proof: { type: "federated", proof },
          },
        }),
        cache: "no-store",
      },
    );
    if (!response.ok) {
      throw new Error("Core rejected consumer authentication");
    }
    const body = (await response.json()) as Record<string, unknown>;
    const userContextId = body.user_context_id;
    if (typeof userContextId !== "string" || userContextId.length === 0) {
      throw new Error(
        "Core returned an invalid consumer authentication result",
      );
    }
    if (establishedContextId && establishedContextId !== userContextId) {
      throw new Error(
        "Core user context does not match the established account",
      );
    }
    return { userContextId };
  }
}
