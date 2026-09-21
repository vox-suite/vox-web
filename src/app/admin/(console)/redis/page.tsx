import { Page, Badge } from "@/components/ui";
import { RedisExplorer } from "@/components/admin/redis-explorer";
import { requireSuperuser } from "@/lib/auth";
export default async function RedisPage() {
  await requireSuperuser();
  return (
    <Page
      title="Redis explorer"
      description="Search, inspect and manage cached data through a bounded Redis interface."
      actions={<Badge tone="warning">Managed access</Badge>}
    >
      <RedisExplorer />
    </Page>
  );
}
