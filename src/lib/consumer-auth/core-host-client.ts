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

export type Connection = {
  id: string;
  integration_external_key: string;
  external_account_reference: string;
  account_display_id: string | null;
  credential_custody: "platform_held" | "external_operator";
  authorization_state: "pending" | "authorized" | "expired" | "revoked" | "cancelled" | "failed";
  authorized_capabilities: string[];
  expires_at: string | null;
  failure_code: string | null;
  created_at: string;
  updated_at: string;
};

export type InitiateConnectionRequest = {
  integration_external_key: string;
  credential_custody: "platform_held" | "external_operator";
  requested_capabilities?: string[];
  redirect_uri?: string | null;
};

export type InitiateConnectionResponse = {
  session_id: string;
  integration_external_key: string;
  state_token: string;
  authorization_url: string;
  expires_at: string;
};

export type VerifyConnectionCallbackRequest = {
  session_id: string;
  state_token: string;
  authorization: {
    integration_external_key: string;
    external_account_reference: string;
    account_display_id?: string | null;
    credential_custody: "platform_held" | "external_operator";
    authorization_state: "authorized" | "failed";
    authorized_capabilities?: string[];
    expires_at?: string | null;
    failure_code?: string | null;
  };
};

export type CapabilityGrant = {
  id: string;
  agent_external_key: string;
  connection_id: string;
  capability_external_key: string;
};

export type CreateGrantRequest = {
  agent_external_key: string;
  connection_id: string;
  capability_external_key: string;
};

export type DurableTask = {
  id: string;
  title: string;
  instruction: string;
  agent_external_key: string | null;
  state: "queued" | "running" | "waiting_for_clarification" | "waiting_for_approval" | "waiting_for_connection" | "completed" | "cancelled" | "failed";
  run_id: string;
  wait_reason?: string | null;
  created_at: string;
  updated_at: string;
};

export type StartTaskRequest = {
  title: string;
  instruction: string;
  agent_external_key?: string | null;
};

export type MaterialProposalDetails = {
  title?: string;
  provider?: string;
  account_reference?: string;
  recipient?: string;
  location?: string;
  time?: string;
  content?: string;
  price?: number;
  currency?: string;
  fees?: number;
  data_recipients?: string[];
  grouped_actions?: Array<{
    action_id: string;
    description: string;
    provider?: string;
    price?: number;
    fees?: number;
    outcome?: string;
  }>;
  [key: string]: unknown;
};

export type ActionProposal = {
  id: string;
  capability_external_key: string;
  expires_at: string;
  approval_id?: string | null;
  state?: "pending" | "approved" | "superseded" | "expired" | "consumed";
  details: MaterialProposalDetails;
};

export type CreateProposalRequest = {
  task_id: string;
  task_run_id: string;
  agent_external_key: string;
  capability_external_key: string;
  details: MaterialProposalDetails;
  expires_at: string;
  replaces_proposal_id?: string | null;
};

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

  private async signedPost<T>(
    path: string,
    accountId: string,
    body: Record<string, unknown>,
    method = "POST",
  ): Promise<T> {
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
    const response = await this.dependencies.fetch(
      new URL(path, this.config.baseUrl),
      {
        method,
        headers: {
          ...assertion.headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
      },
    );
    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`Core request to ${path} failed (${response.status}): ${errText}`);
    }
    if (response.status === 204) {
      return undefined as T;
    }
    return (await response.json()) as T;
  }

  async listConnections(accountId: string): Promise<Connection[]> {
    return this.signedPost<Connection[]>("/v1/connections/list", accountId, {
      host_context: {
        host_user_id: `vox-account:${accountId}`,
        organization_external_key: null,
      },
    });
  }

  async initiateConnection(
    accountId: string,
    initiation: InitiateConnectionRequest,
  ): Promise<InitiateConnectionResponse> {
    return this.signedPost<InitiateConnectionResponse>("/v1/connections/initiate", accountId, {
      host_context: {
        host_user_id: `vox-account:${accountId}`,
        organization_external_key: null,
      },
      initiation,
    });
  }

  async verifyConnectionCallback(
    accountId: string,
    callback: VerifyConnectionCallbackRequest,
  ): Promise<Connection> {
    return this.signedPost<Connection>("/v1/connections/callback", accountId, {
      host_context: {
        host_user_id: `vox-account:${accountId}`,
        organization_external_key: null,
      },
      callback,
    });
  }

  async disconnectConnection(accountId: string, connectionId: string): Promise<Connection> {
    return this.signedPost<Connection>(
      `/v1/connections/${encodeURIComponent(connectionId)}/disconnect`,
      accountId,
      {
        host_context: {
          host_user_id: `vox-account:${accountId}`,
          organization_external_key: null,
        },
      },
    );
  }

  async listEffectiveGrants(accountId: string, agentKey: string): Promise<CapabilityGrant[]> {
    return this.signedPost<CapabilityGrant[]>(
      `/v1/agents/${encodeURIComponent(agentKey)}/effective-capability-grants`,
      accountId,
      {
        host_user_id: `vox-account:${accountId}`,
        organization_external_key: null,
      },
    );
  }

  async createGrant(accountId: string, grant: CreateGrantRequest): Promise<CapabilityGrant> {
    return this.signedPost<CapabilityGrant>("/v1/capability-grants", accountId, {
      host_context: {
        host_user_id: `vox-account:${accountId}`,
        organization_external_key: null,
      },
      grant,
    });
  }

  async revokeGrant(accountId: string, grant: CreateGrantRequest): Promise<void> {
    return this.signedPost<void>(
      "/v1/capability-grants",
      accountId,
      {
        host_context: {
          host_user_id: `vox-account:${accountId}`,
          organization_external_key: null,
        },
        grant,
      },
      "DELETE",
    );
  }

  async startTask(accountId: string, task: StartTaskRequest): Promise<DurableTask> {
    return this.signedPost<DurableTask>("/v1/durable-tasks", accountId, {
      host_context: {
        host_user_id: `vox-account:${accountId}`,
        organization_external_key: null,
      },
      task,
    });
  }

  async getTask(accountId: string, taskId: string): Promise<DurableTask> {
    return this.signedPost<DurableTask>(
      `/v1/durable-tasks/${encodeURIComponent(taskId)}`,
      accountId,
      {
        host_context: {
          host_user_id: `vox-account:${accountId}`,
          organization_external_key: null,
        },
      },
    );
  }

  async cancelTask(accountId: string, taskId: string): Promise<DurableTask> {
    return this.signedPost<DurableTask>(
      `/v1/durable-tasks/${encodeURIComponent(taskId)}/cancel`,
      accountId,
      {
        host_context: {
          host_user_id: `vox-account:${accountId}`,
          organization_external_key: null,
        },
      },
    );
  }

  async createProposal(
    accountId: string,
    proposal: CreateProposalRequest,
  ): Promise<ActionProposal> {
    return this.signedPost<ActionProposal>("/v1/action-proposals", accountId, {
      host_context: {
        host_user_id: `vox-account:${accountId}`,
        organization_external_key: null,
      },
      proposal,
    });
  }

  async approveProposal(
    accountId: string,
    proposalId: string,
    details: Record<string, unknown>,
  ): Promise<ActionProposal> {
    return this.signedPost<ActionProposal>(
      `/v1/action-proposals/${encodeURIComponent(proposalId)}/approve`,
      accountId,
      {
        host_context: {
          host_user_id: `vox-account:${accountId}`,
          organization_external_key: null,
        },
        details,
      },
    );
  }
}

