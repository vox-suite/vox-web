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
    <div className="flex flex-col gap-6 rounded-2xl bg-ink p-6 shadow-subtle-3 md:flex-row md:items-center md:justify-between md:p-8">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex flex-wrap gap-2">
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
        <div className="size-20 shrink-0 overflow-hidden rounded-2xl border border-border-edge bg-obsidian shadow-subtle-3 md:size-24">
          {/* eslint-disable-next-line @next/next/no-img-element -- external OAuth avatar, no remote pattern configured for next/image */}
          <img
            src={avatarUrl}
            alt={firstName}
            className="size-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      ) : (
        <div
          className="flex size-20 shrink-0 items-center justify-center rounded-2xl border border-border-edge bg-obsidian text-smoke shadow-subtle-3 md:size-24"
          aria-hidden="true"
        >
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
      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-md border border-border-edge bg-obsidian p-4">
          <dt className="font-mono text-[11px] uppercase tracking-wide text-smoke">
            Node.js Runtime
          </dt>
          <dd className="mt-1.5 font-mono text-sm text-mist">
            {host?.process?.nodeVersion || process.version}
          </dd>
        </div>
        <div className="rounded-md border border-border-edge bg-obsidian p-4">
          <dt className="font-mono text-[11px] uppercase tracking-wide text-smoke">
            Host Platform
          </dt>
          <dd className="mt-1.5 font-mono text-sm text-mist">
            {host ? `${host.platform} (${host.arch})` : "Standard Serverless"}
          </dd>
        </div>
        <div className="rounded-md border border-border-edge bg-obsidian p-4">
          <dt className="font-mono text-[11px] uppercase tracking-wide text-smoke">
            System Uptime
          </dt>
          <dd className="mt-1.5 font-mono text-sm text-mist">
            {host?.uptimeFormatted || "Continuous"}
          </dd>
        </div>
        <div className="rounded-md border border-border-edge bg-obsidian p-4">
          <dt className="font-mono text-[11px] uppercase tracking-wide text-smoke">
            Active Administrator
          </dt>
          <dd className="mt-1.5 truncate font-mono text-sm text-mist">{email}</dd>
        </div>
        <div className="rounded-md border border-border-edge bg-obsidian p-4">
          <dt className="font-mono text-[11px] uppercase tracking-wide text-smoke">
            Core Admin Endpoint
          </dt>
          <dd className="mt-1.5 font-mono text-sm text-mist">
            {coreConfigured ? "Configured" : "Not Set"}
          </dd>
        </div>
        <div className="rounded-md border border-border-edge bg-obsidian p-4">
          <dt className="font-mono text-[11px] uppercase tracking-wide text-smoke">
            Docker Daemon
          </dt>
          <dd className="mt-1.5 font-mono text-sm text-mist">
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
