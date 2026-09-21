import { Badge, Page } from "@/components/ui";
import { SystemHealthDashboard } from "@/components/admin/system-health";
import { requireSuperuser } from "@/lib/auth";

export default async function HealthPage() {
  await requireSuperuser();
  return (
    <Page
      title="System health"
      description="Inspect host system metrics, physical RAM usage, and Docker container resources."
      actions={<Badge tone="accent">Live telemetry</Badge>}
    >
      <SystemHealthDashboard />
    </Page>
  );
}
