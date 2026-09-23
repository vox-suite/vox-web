import {
  Activity,
  CheckCircle2,
  Database,
  Server,
  Workflow,
  ShieldCheck,
  Waves,
} from "lucide-react";
import {
  Badge,
  Card,
  Grid,
  ModuleCard,
  Notice,
  Stack,
  Stat,
} from "@/components/ui";
import { adminModules, adminHref } from "@/lib/admin-modules";
import type { SystemHealthData } from "@/lib/system-health";

export function WorkspaceWelcome({
  firstName,
  email,
  avatarUrl,
  coreConfigured,
}: {
  firstName: string;
  email: string;
  avatarUrl?: string | null;
  coreConfigured: boolean;
}) {
  return (
    <div className="admin-welcome">
      <div className="admin-welcome-content">
        <div className="admin-welcome-meta">
          <Badge tone="positive">
            <CheckCircle2 size={12} aria-hidden="true" />
            Operational
          </Badge>
          <Badge tone="accent">
            <ShieldCheck size={12} aria-hidden="true" />
            Superuser: {email}
          </Badge>
          <Badge tone="neutral">
            {coreConfigured ? "Core Connected" : "Standalone Console"}
          </Badge>
        </div>
        <h2>Welcome back, {firstName}</h2>
        <p>
          Live workspace status, runtime telemetry, and pipeline management for
          Vox.
        </p>
      </div>
      {avatarUrl ? (
        <div className="admin-welcome-avatar">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarUrl}
            alt={firstName}
            referrerPolicy="no-referrer"
          />
        </div>
      ) : (
        <div className="admin-welcome-art" aria-hidden="true">
          <Waves size={64} strokeWidth={1.25} />
        </div>
      )}
    </div>
  );
}

export function OverviewStats({
  health,
  coreConfigured,
}: {
  health: SystemHealthData | null;
  coreConfigured: boolean;
}) {
  const cpuPercent =
    health?.host?.cpu?.usagePercent != null
      ? `${health.host.cpu.usagePercent}%`
      : "—";
  const cpuDesc = health?.host?.cpu
    ? `${health.host.cpu.cores} core(s) active`
    : "Host CPU processor";

  const memPercent =
    health?.host?.memory?.usedPercent != null
      ? `${health.host.memory.usedPercent}%`
      : "—";
  const memDesc = health?.host?.memory
    ? `${health.host.memory.usedFormatted} of ${health.host.memory.totalFormatted}`
    : "Host memory allocation";

  return (
    <Grid columns={4}>
      <Stat
        label="Host CPU Load"
        value={cpuPercent}
        description={cpuDesc}
      />
      <Stat
        label="Memory Utilization"
        value={memPercent}
        description={memDesc}
      />
      <Stat
        label="Redis Explorer"
        value={coreConfigured ? "Ready" : "Pending"}
        description={
          coreConfigured
            ? "Connected to Core session cache"
            : "Core admin endpoint unconfigured"
        }
      />
      <Stat
        label="Pipeline Flow"
        value="Online"
        description="Interactive Bridge & Core canvas"
      />
    </Grid>
  );
}

export function ManagementModules({
  basePath = "/admin",
}: { basePath?: string } = {}) {
  const activeModules = adminModules.filter((m) => m.slug);
  return (
    <Grid columns={activeModules.length === 3 ? 3 : 2}>
      {activeModules.map((module) => (
        <ModuleCard
          key={module.slug}
          title={module.title}
          description={module.description}
          href={adminHref(module.slug, basePath)}
          icon={
            module.icon === "pipeline" ? (
              <Workflow size={22} />
            ) : module.icon === "health" ? (
              <Activity size={22} />
            ) : module.icon === "database" ? (
              <Database size={22} />
            ) : (
              <Server size={22} />
            )
          }
        />
      ))}
    </Grid>
  );
}

export function WorkspaceRuntimeCard({
  health,
  coreConfigured,
  email,
}: {
  health: SystemHealthData | null;
  coreConfigured: boolean;
  email: string;
}) {
  const host = health?.host;
  return (
    <Card
      title="Runtime environment"
      description="Host operating environment, node process parameters, and identity boundaries."
    >
      <dl className="overview-runtime-grid">
        <div className="overview-runtime-item">
          <dt>Node.js Runtime</dt>
          <dd>{host?.process?.nodeVersion || process.version}</dd>
        </div>
        <div className="overview-runtime-item">
          <dt>Host Platform</dt>
          <dd>
            {host ? `${host.platform} (${host.arch})` : "Standard Serverless"}
          </dd>
        </div>
        <div className="overview-runtime-item">
          <dt>System Uptime</dt>
          <dd>{host?.uptimeFormatted || "Continuous"}</dd>
        </div>
        <div className="overview-runtime-item">
          <dt>Active Administrator</dt>
          <dd>{email}</dd>
        </div>
        <div className="overview-runtime-item">
          <dt>Core Admin Endpoint</dt>
          <dd>{coreConfigured ? "Configured" : "Not Set"}</dd>
        </div>
        <div className="overview-runtime-item">
          <dt>Docker Daemon</dt>
          <dd>
            {health?.docker?.available
              ? `${health.docker.runningContainers} running / ${health.docker.totalContainers} total`
              : "Not Available (Managed Host)"}
          </dd>
        </div>
      </dl>
    </Card>
  );
}

export function ConnectionNotice({ configured }: { configured: boolean }) {
  if (configured) {
    return (
      <Notice title="Core Admin Connected" tone="success">
        Vox Web has established an active administrative connection to Vox Core.
        Session caches, telemetry, and background worker state are live.
      </Notice>
    );
  }

  return (
    <Notice title="Standalone Console Mode" tone="info">
      Vox Web is running in standalone console mode. Configure{" "}
      <code>VOX_CORE_ADMIN_URL</code> and <code>VOX_ADMIN_TOKEN</code> in your
      environment variables to enable direct Redis cache management and worker
      telemetry.
    </Notice>
  );
}
