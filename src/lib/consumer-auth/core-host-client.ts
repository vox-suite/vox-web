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
  authorization_state:
    "pending" | "authorized" | "expired" | "revoked" | "cancelled" | "failed";
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

export type CapabilityGrant = {
  id: string;
  agent_external_key: string;
  connection_id: string;
  capability_external_key: string;
};

export type SkillListing = {
  id: string;
  external_key: string;
  title: string;
  summary: string;
  curated: boolean;
  latest_version: number;
  installed_version: number | null;
  enabled: boolean;
  update_available: boolean;
};

export type PublishSkillRequest = {
  external_key: string;
  title: string;
  summary: string;
  instructions: string;
  requested_capabilities: string[];
  resources: Record<string, string>;
};

export type SkillVersion = {
  version: number;
  instructions: string;
  requested_capabilities: string[];
  resources: Record<string, string>;
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
  state:
    | "queued"
    | "running"
    | "waiting_for_clarification"
    | "waiting_for_approval"
    | "waiting_for_connection"
    | "completed"
    | "cancelled"
    | "failed";
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
  span_id: string;
  task_run_id: string;
  agent_external_key: string;
  capability_external_key: string;
  details: MaterialProposalDetails;
  expires_at: string;
  replaces_proposal_id?: string | null;
};

export type ExtensionProtocol = "mcp" | "direct";
export type ExtensionEffect = "read" | "write" | "mixed";
export type ConformanceStatus = "pending" | "passed" | "failed";
export type ConsentStatus = "consented" | "consent_required";
export type LifecycleState =
  "installed" | "active" | "quarantined" | "disabled" | "removed";

export type ExtensionOperator = {
  operator_id: string;
  operator_name: string;
  support_email?: string | null;
  terms_url?: string | null;
};

export type ExtensionCapability = {
  external_key: string;
  display_name: string;
  effect: ExtensionEffect;
  consequential?: boolean;
  data_recipients?: string[];
  access_needs?: string[];
  optional_guarantees?: Record<string, unknown>;
};

export type RemoteExtension = {
  id: string;
  external_key: string;
  display_name: string;
  protocol: ExtensionProtocol;
  endpoint_url: string;
  operator: ExtensionOperator;
  current_version: number;
  conformance_status: ConformanceStatus;
  operator_enabled: boolean;
  consent_status: ConsentStatus;
  lifecycle_state: LifecycleState;
  created_at: string;
  updated_at: string;
  capabilities?: ExtensionCapability[];
};

export type InstallExtensionRequest = {
  external_key: string;
  display_name: string;
  protocol: ExtensionProtocol;
  endpoint_url: string;
  operator: ExtensionOperator;
  capabilities: ExtensionCapability[];
};

export type UpdateExtensionRequest = {
  endpoint_url?: string;
  operator?: ExtensionOperator;
  capabilities?: ExtensionCapability[];
};

export type UberTrip = {
  trip_id: string;
  request_time: string;
  status: string;
  distance_miles: number;
  start_city: string | null;
  pickup_latitude?: number | null;
  pickup_longitude?: number | null;
  dropoff_latitude?: number | null;
  dropoff_longitude?: number | null;
};

export type UberHistoryResponse = {
  trips: UberTrip[];
  total_trips: number;
  retrieved_at: string;
  freshness_seconds: number;
};

export type UberReadRequest = {
  connection_id: string;
  agent_external_key?: string;
  offset?: number;
  limit?: number;
  include_city?: boolean;
};

export type LodgingProperty = {
  property_id: string;
  name: string;
  location: string;
  star_rating: number;
  price_amount_minor: number;
  currency: string;
  available_rate_plans: Array<{
    rate_plan_id: string;
    room_name: string;
    refundable: boolean;
    cancellation_deadline: string | null;
  }>;
};

export type LodgingSearchRequest = {
  connection_id: string;
  agent_external_key?: string;
  destination: string;
  check_in: string;
  check_out: string;
  occupancy: number;
};

export type LodgingSearchResponse = {
  properties: LodgingProperty[];
  total_results: number;
};

export type LodgingBookingRequest = {
  connection_id: string;
  agent_external_key?: string;
  booking_request: {
    property_id: string;
    rate_plan_id: string;
    guest_name: string;
    check_in: string;
    check_out: string;
    total_amount_minor: number;
    currency: string;
  };
};

export type LodgingBooking = {
  booking_id: string;
  expedia_booking_ref: string;
  property_id: string;
  status: "confirmed" | "reconciling" | "cancelled" | "failed";
  check_in: string;
  check_out: string;
  total_amount_minor: number;
  currency: string;
  cancellation_policy: string;
  created_at: string;
};

export type LodgingCancelResponse = {
  booking_id: string;
  expedia_booking_ref: string;
  property_id: string;
  status: "cancelled" | "reconciling";
  refund_amount_minor: number;
  currency: string;
  cancelled_at: string;
};

export type AmazonHandoffRequest = {
  asin: string;
  locale?: string;
  quantity?: number;
  partner_tag?: string;
};

export type ZomatoHandoffRequest = {
  res_id?: string | null;
  order_id?: string | null;
  handoff_type?: "CartAndCheckout" | "TrackOrder" | "ViewRestaurant";
};

export type UberHandoffRequest = {
  pickup_latitude: number;
  pickup_longitude: number;
  dropoff_latitude: number;
  dropoff_longitude: number;
  product_id?: string | null;
  fare_id?: string | null;
};

export type HandoffResponse = {
  provider: string;
  action: string;
  handoff_url: string;
  status: string;
  completed: boolean;
  disclaimer: string;
};

export type MultiServiceJourneyItem = {
  service: string;
  service_type: "connected_read" | "consequential_write" | "labelled_handoff";
  provider: "uber" | "expedia" | "amazon" | "zomato";
  action: string;
  status:
    | "confirmed"
    | "completed"
    | "handoff_created"
    | "pending"
    | "reconciling"
    | "failed"
    | "unknown";
  authoritative_reference?: string | null;
  payment_status?:
    | "not_applicable"
    | "authorized_in_escrow"
    | "settled"
    | "refunded"
    | "failed";
  handoff_url?: string | null;
  summary: string;
  completed: boolean;
};

export type MultiServiceJourney = {
  journey_id: string;
  title: string;
  items: MultiServiceJourneyItem[];
  created_at: string;
};

export type ReminderScheduleKind = "one_time" | "interval" | "recurring";

export type ReminderDeliveryStatus =
  "scheduled" | "delivered_to_channel" | "failed" | "unknown";

export type Reminder = {
  id: string;
  user_context_id: string;
  title: string;
  message: string;
  channel: string;
  destination: string;
  timezone: string;
  schedule_kind: ReminderScheduleKind;
  run_at: string | null;
  interval_seconds: number | null;
  recurrence_expression: string | null;
  status: ReminderDeliveryStatus;
  max_retries: number;
  retry_count: number;
  last_attempt_at: string | null;
  next_run_at: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type ReminderDelivery = {
  id: string;
  reminder_id: string;
  status: ReminderDeliveryStatus;
  channel: string;
  destination: string;
  provider_receipt_id: string | null;
  failure_reason: string | null;
  attempted_at: string;
};

export type CreateReminderInput = {
  title: string;
  message: string;
  channel: string;
  destination: string;
  timezone: string;
  schedule_kind: ReminderScheduleKind;
  run_at?: string | null;
  interval_seconds?: number | null;
  recurrence_expression?: string | null;
  max_retries?: number | null;
  metadata?: Record<string, unknown> | null;
};

export type UserPreference = {
  id: string;
  user_context_id: string;
  category: string;
  preference_key: string;
  value: unknown;
  is_sensitive: boolean;
  confirmed_at: string | null;
  created_at: string;
  updated_at: string;
  authority_disclaimer: string;
};

export type SetPreferenceInput = {
  category: string;
  preference_key: string;
  value: unknown;
  is_sensitive?: boolean | null;
  confirmed?: boolean | null;
};

export type DeleteHistoryResponse = {
  deleted_spans_count: number;
  deleted_conversations_count: number;
  disclosure: string;
};

export type PortableExportResponse = {
  export_id: string;
  download_url: string;
  categories: string[];
  generated_at: string;
  disclosure: string;
};

export type SelectedAgent = {
  definition: { external_key: string; purpose: string };
};

export type EffectiveSkill = { id: string };

export type VoxCoreHostClientConfig = {
  baseUrl: string;
  hostCredential: HostCredential;
  /** Only the legacy Better Auth account authority signs federated identity proofs. */
  identityCredential?: FederatedIdentityCredential;
  identityAdapterKey?: string;
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

export class CoreHostRequestError extends Error {
  constructor(
    public readonly status: number,
    path: string,
  ) {
    super(`Core request to ${path} failed (${status})`);
  }
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
    const { identityCredential, identityAdapterKey } = this.config;
    if (!identityCredential || !identityAdapterKey) {
      throw new Error("Federated identity credential is not configured");
    }
    const issuedAtSeconds = this.dependencies.now();
    const assertion = createHostAssertion(
      this.config.hostCredential,
      hostContext,
      { issuedAtSeconds, nonce: this.dependencies.nonce() },
    );
    const proof = createFederatedProof(identityCredential, hostUserId, {
      issuedAtSeconds,
      expiresAtSeconds: issuedAtSeconds + 300,
      nonce: this.dependencies.nonce(),
    });
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
            adapter_external_key: identityAdapterKey,
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
      throw new CoreHostRequestError(response.status, path);
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

  async listSkills(accountId: string): Promise<SkillListing[]> {
    return this.signedPost<SkillListing[]>("/v1/skills/list", accountId, {
      host_context: {
        host_user_id: `vox-account:${accountId}`,
        organization_external_key: null,
      },
    });
  }

  async publishPrivateSkill(
    accountId: string,
    skill: PublishSkillRequest,
  ): Promise<SkillListing> {
    return this.signedPost<SkillListing>("/v1/skills/private", accountId, {
      host_context: {
        host_user_id: `vox-account:${accountId}`,
        organization_external_key: null,
      },
      skill,
    });
  }

  async getSkillVersion(
    accountId: string,
    skillId: string,
    version: number,
  ): Promise<SkillVersion> {
    return this.signedPost<SkillVersion>(
      `/v1/skills/${encodeURIComponent(skillId)}/versions/${version}`,
      accountId,
      {
        host_context: {
          host_user_id: `vox-account:${accountId}`,
          organization_external_key: null,
        },
      },
    );
  }

  async changeSkillInstallation(
    accountId: string,
    skillId: string,
    action: "install" | "disable",
    version?: number,
  ): Promise<void> {
    if (
      action === "install" &&
      (!Number.isInteger(version) || !version || version < 1)
    ) {
      throw new Error("Reviewed skill version is required");
    }
    return this.signedPost<void>(
      `/v1/skills/${encodeURIComponent(skillId)}/${action}`,
      accountId,
      {
        host_context: {
          host_user_id: `vox-account:${accountId}`,
          organization_external_key: null,
        },
        ...(action === "install" ? { version } : {}),
      },
    );
  }

  async effectiveSkills(
    accountId: string,
    agentKey: string,
  ): Promise<EffectiveSkill[]> {
    return this.signedPost<EffectiveSkill[]>(
      `/v1/agents/${encodeURIComponent(agentKey)}/effective-skills`,
      accountId,
      {
        host_context: {
          host_user_id: `vox-account:${accountId}`,
          organization_external_key: null,
        },
      },
    );
  }

  async selectedAgents(accountId: string): Promise<SelectedAgent[]> {
    return this.signedPost<SelectedAgent[]>("/v1/agents/selected", accountId, {
      host_context: {
        host_user_id: `vox-account:${accountId}`,
        organization_external_key: null,
      },
    });
  }

  async setSkillAgentEnabled(
    accountId: string,
    agentKey: string,
    skillId: string,
    enabled: boolean,
  ): Promise<void> {
    return this.signedPost<void>(
      `/v1/agents/${encodeURIComponent(agentKey)}/skills/${encodeURIComponent(skillId)}/enable`,
      accountId,
      {
        host_context: {
          host_user_id: `vox-account:${accountId}`,
          organization_external_key: null,
        },
        enabled,
      },
    );
  }

  async initiateConnection(
    accountId: string,
    initiation: InitiateConnectionRequest,
  ): Promise<InitiateConnectionResponse> {
    return this.signedPost<InitiateConnectionResponse>(
      "/v1/connections/initiate",
      accountId,
      {
        host_context: {
          host_user_id: `vox-account:${accountId}`,
          organization_external_key: null,
        },
        initiation,
      },
    );
  }

  async disconnectConnection(
    accountId: string,
    connectionId: string,
  ): Promise<Connection> {
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

  async listEffectiveGrants(
    accountId: string,
    agentKey: string,
  ): Promise<CapabilityGrant[]> {
    return this.signedPost<CapabilityGrant[]>(
      `/v1/agents/${encodeURIComponent(agentKey)}/effective-capability-grants`,
      accountId,
      {
        host_user_id: `vox-account:${accountId}`,
        organization_external_key: null,
      },
    );
  }

  async createGrant(
    accountId: string,
    grant: CreateGrantRequest,
  ): Promise<CapabilityGrant> {
    return this.signedPost<CapabilityGrant>(
      "/v1/capability-grants",
      accountId,
      {
        host_context: {
          host_user_id: `vox-account:${accountId}`,
          organization_external_key: null,
        },
        grant,
      },
    );
  }

  async revokeGrant(
    accountId: string,
    grant: CreateGrantRequest,
  ): Promise<void> {
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

  async startTask(
    accountId: string,
    task: StartTaskRequest,
  ): Promise<DurableTask> {
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

  async listExtensions(accountId: string): Promise<RemoteExtension[]> {
    return this.signedPost<RemoteExtension[]>(
      "/v1/remote-extensions/list",
      accountId,
      {
        host_context: {
          host_user_id: `vox-account:${accountId}`,
          organization_external_key: null,
        },
      },
    );
  }

  async getExtension(
    accountId: string,
    extensionId: string,
  ): Promise<RemoteExtension> {
    return this.signedPost<RemoteExtension>(
      `/v1/remote-extensions/${encodeURIComponent(extensionId)}`,
      accountId,
      {
        host_context: {
          host_user_id: `vox-account:${accountId}`,
          organization_external_key: null,
        },
      },
    );
  }

  async installExtension(
    accountId: string,
    extension: InstallExtensionRequest,
  ): Promise<RemoteExtension> {
    return this.signedPost<RemoteExtension>(
      "/v1/remote-extensions",
      accountId,
      {
        host_context: {
          host_user_id: `vox-account:${accountId}`,
          organization_external_key: null,
        },
        extension,
      },
    );
  }

  async updateExtension(
    accountId: string,
    extensionId: string,
    extension: UpdateExtensionRequest,
  ): Promise<RemoteExtension> {
    return this.signedPost<RemoteExtension>(
      `/v1/remote-extensions/${encodeURIComponent(extensionId)}`,
      accountId,
      {
        host_context: {
          host_user_id: `vox-account:${accountId}`,
          organization_external_key: null,
        },
        extension,
      },
      "PUT",
    );
  }

  async quarantineExtension(
    accountId: string,
    extensionId: string,
    version: number,
  ): Promise<RemoteExtension> {
    return this.signedPost<RemoteExtension>(
      `/v1/remote-extensions/${encodeURIComponent(extensionId)}/quarantine`,
      accountId,
      {
        host_context: {
          host_user_id: `vox-account:${accountId}`,
          organization_external_key: null,
        },
        version,
      },
    );
  }

  async removeExtension(
    accountId: string,
    extensionId: string,
  ): Promise<RemoteExtension> {
    return this.signedPost<RemoteExtension>(
      `/v1/remote-extensions/${encodeURIComponent(extensionId)}`,
      accountId,
      {
        host_context: {
          host_user_id: `vox-account:${accountId}`,
          organization_external_key: null,
        },
      },
      "DELETE",
    );
  }

  async readUberHistory(
    accountId: string,
    request: UberReadRequest,
  ): Promise<UberHistoryResponse> {
    return this.signedPost<UberHistoryResponse>(
      "/v1/connected-reads/uber",
      accountId,
      {
        host_context: {
          host_user_id: `vox-account:${accountId}`,
          organization_external_key: null,
        },
        agent_external_key: request.agent_external_key ?? "saathi",
        connection_id: request.connection_id,
        offset: request.offset ?? 0,
        limit: request.limit ?? 10,
        include_city: request.include_city ?? true,
      },
    );
  }

  async searchLodging(
    accountId: string,
    request: LodgingSearchRequest,
  ): Promise<LodgingSearchResponse> {
    return this.signedPost<LodgingSearchResponse>(
      "/v1/lodging/search",
      accountId,
      {
        host_context: {
          host_user_id: `vox-account:${accountId}`,
          organization_external_key: null,
        },
        agent_external_key: request.agent_external_key ?? "saathi",
        connection_id: request.connection_id,
        destination: request.destination,
        check_in: request.check_in,
        check_out: request.check_out,
        occupancy: request.occupancy,
      },
    );
  }

  async bookLodging(
    accountId: string,
    request: LodgingBookingRequest,
  ): Promise<LodgingBooking> {
    return this.signedPost<LodgingBooking>("/v1/lodging/bookings", accountId, {
      host_context: {
        host_user_id: `vox-account:${accountId}`,
        organization_external_key: null,
      },
      agent_external_key: request.agent_external_key ?? "saathi",
      connection_id: request.connection_id,
      booking_request: request.booking_request,
    });
  }

  async cancelLodgingBooking(
    accountId: string,
    bookingId: string,
    connectionId: string,
    reason?: string,
    agentExternalKey?: string,
  ): Promise<LodgingCancelResponse> {
    return this.signedPost<LodgingCancelResponse>(
      `/v1/lodging/bookings/${encodeURIComponent(bookingId)}/cancel`,
      accountId,
      {
        host_context: {
          host_user_id: `vox-account:${accountId}`,
          organization_external_key: null,
        },
        agent_external_key: agentExternalKey ?? "saathi",
        connection_id: connectionId,
        reason: reason ?? "Consumer requested cancellation",
      },
    );
  }

  async createAmazonHandoff(
    accountId: string,
    connectionId: string,
    handoff: AmazonHandoffRequest,
    agentExternalKey?: string,
  ): Promise<HandoffResponse> {
    return this.signedPost<HandoffResponse>("/v1/handoffs/amazon", accountId, {
      host_context: {
        host_user_id: `vox-account:${accountId}`,
        organization_external_key: null,
      },
      agent_external_key: agentExternalKey ?? "saathi",
      connection_id: connectionId,
      handoff: {
        asin: handoff.asin,
        locale: handoff.locale ?? "US",
        quantity: handoff.quantity ?? 1,
        partner_tag: handoff.partner_tag ?? "vox-20",
      },
    });
  }

  async createZomatoHandoff(
    accountId: string,
    connectionId: string,
    handoff: ZomatoHandoffRequest,
    agentExternalKey?: string,
  ): Promise<HandoffResponse> {
    return this.signedPost<HandoffResponse>("/v1/handoffs/zomato", accountId, {
      host_context: {
        host_user_id: `vox-account:${accountId}`,
        organization_external_key: null,
      },
      agent_external_key: agentExternalKey ?? "saathi",
      connection_id: connectionId,
      handoff: {
        res_id: handoff.res_id ?? null,
        order_id: handoff.order_id ?? null,
        handoff_type: handoff.handoff_type ?? "ViewRestaurant",
      },
    });
  }

  async createUberRideHandoff(
    accountId: string,
    connectionId: string,
    handoff: UberHandoffRequest,
    agentExternalKey?: string,
  ): Promise<HandoffResponse> {
    return this.signedPost<HandoffResponse>("/v1/handoffs/uber", accountId, {
      host_context: {
        host_user_id: `vox-account:${accountId}`,
        organization_external_key: null,
      },
      agent_external_key: agentExternalKey ?? "saathi",
      connection_id: connectionId,
      handoff: {
        pickup_latitude: handoff.pickup_latitude,
        pickup_longitude: handoff.pickup_longitude,
        dropoff_latitude: handoff.dropoff_latitude,
        dropoff_longitude: handoff.dropoff_longitude,
        product_id: handoff.product_id ?? null,
        fare_id: handoff.fare_id ?? null,
      },
    });
  }

  async listReminders(accountId: string): Promise<Reminder[]> {
    return this.signedPost<Reminder[]>("/v1/reminders/list", accountId, {
      host_context: {
        host_user_id: `vox-account:${accountId}`,
        organization_external_key: null,
      },
    });
  }

  async createReminder(
    accountId: string,
    input: CreateReminderInput,
  ): Promise<Reminder> {
    return this.signedPost<Reminder>("/v1/reminders", accountId, {
      host_context: {
        host_user_id: `vox-account:${accountId}`,
        organization_external_key: null,
      },
      title: input.title,
      message: input.message,
      channel: input.channel,
      destination: input.destination,
      timezone: input.timezone,
      schedule_kind: input.schedule_kind,
      run_at: input.run_at ?? null,
      interval_seconds: input.interval_seconds ?? null,
      recurrence_expression: input.recurrence_expression ?? null,
      max_retries: input.max_retries ?? 3,
      metadata: input.metadata ?? null,
    });
  }

  async getReminder(accountId: string, reminderId: string): Promise<Reminder> {
    return this.signedPost<Reminder>(
      `/v1/reminders/${encodeURIComponent(reminderId)}`,
      accountId,
      {
        host_context: {
          host_user_id: `vox-account:${accountId}`,
          organization_external_key: null,
        },
      },
    );
  }

  async cancelReminder(
    accountId: string,
    reminderId: string,
  ): Promise<Reminder> {
    return this.signedPost<Reminder>(
      `/v1/reminders/${encodeURIComponent(reminderId)}/cancel`,
      accountId,
      {
        host_context: {
          host_user_id: `vox-account:${accountId}`,
          organization_external_key: null,
        },
      },
    );
  }

  async getReminderDeliveries(
    accountId: string,
    reminderId: string,
  ): Promise<ReminderDelivery[]> {
    return this.signedPost<ReminderDelivery[]>(
      `/v1/reminders/${encodeURIComponent(reminderId)}/deliveries`,
      accountId,
      {
        host_context: {
          host_user_id: `vox-account:${accountId}`,
          organization_external_key: null,
        },
      },
    );
  }

  async listPreferences(accountId: string): Promise<UserPreference[]> {
    return this.signedPost<UserPreference[]>(
      "/v1/preferences/list",
      accountId,
      {
        host_context: {
          host_user_id: `vox-account:${accountId}`,
          organization_external_key: null,
        },
      },
    );
  }

  async setPreference(
    accountId: string,
    preference: SetPreferenceInput,
  ): Promise<UserPreference> {
    return this.signedPost<UserPreference>("/v1/preferences", accountId, {
      host_context: {
        host_user_id: `vox-account:${accountId}`,
        organization_external_key: null,
      },
      preference,
    });
  }

  async deletePreference(accountId: string, key: string): Promise<void> {
    return this.signedPost<void>(
      `/v1/preferences/${encodeURIComponent(key)}`,
      accountId,
      {
        host_context: {
          host_user_id: `vox-account:${accountId}`,
          organization_external_key: null,
        },
      },
      "DELETE",
    );
  }

  async deleteTaskHistory(
    accountId: string,
    deleteConversations = true,
  ): Promise<DeleteHistoryResponse> {
    return this.signedPost<DeleteHistoryResponse>(
      "/v1/privacy/delete-history",
      accountId,
      {
        host_context: {
          host_user_id: `vox-account:${accountId}`,
          organization_external_key: null,
        },
        delete_conversations: deleteConversations,
      },
    );
  }

  async requestPortableExport(
    accountId: string,
    categories: ("preferences" | "config" | "spans")[],
  ): Promise<PortableExportResponse> {
    return this.signedPost<PortableExportResponse>(
      "/v1/privacy/portable-export",
      accountId,
      {
        host_context: {
          host_user_id: `vox-account:${accountId}`,
          organization_external_key: null,
        },
        categories,
      },
    );
  }
}
