import { Badge, Page } from "@/components/ui";
import {
  ConnectionNotice,
  ManagementModules,
  OverviewStats,
  WorkspaceRuntimeCard,
  WorkspaceWelcome,
} from "@/components/admin/overview";
import { extractFirstName, requireSuperuser } from "@/lib/auth";
import { getSystemHealth } from "@/lib/system-health";
import { headers } from "next/headers";

export default async function OverviewPage() {
  const user = await requireSuperuser();
  let isClean = false;
  try {
    const headerList = await headers();
    const host = headerList.get("host")?.toLowerCase().split(":")[0];
    isClean = host === "admin.voxagent.in";
  } catch {}

  const connected = Boolean(
    process.env.VOX_CORE_ADMIN_URL && process.env.VOX_ADMIN_TOKEN,
  );

  const health = await getSystemHealth().catch(() => null);
  const firstName = extractFirstName(user.name, user.email);

  return (
    <Page
      title="Overview"
      description="Real-time workspace health, pipeline architecture, and telemetry."
      actions={<Badge tone="accent">Superuser: {firstName}</Badge>}
    >
      <WorkspaceWelcome
        firstName={firstName}
        email={user.email}
        avatarUrl={user.image}
        coreConfigured={connected}
      />
      <OverviewStats health={health} coreConfigured={connected} />
      <ManagementModules basePath={isClean ? "" : "/admin"} />
      <WorkspaceRuntimeCard
        health={health}
        coreConfigured={connected}
        email={user.email}
      />
      <ConnectionNotice configured={connected} />
    </Page>
  );
}
