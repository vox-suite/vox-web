import { Page, Badge } from "@/components/ui";
import { RedisExplorer } from "@/components/admin/redis-explorer";
import { requireSuperuser } from "@/lib/auth";
export default async function RedisPage() {
  await requireSuperuser();
  return (
    <Page
      title="Redis explorer"
      description="A closer look at your cached data. Search keys and inspect their contents."
      actions={<Badge tone="accent">Read-only access</Badge>}
    >
      <RedisExplorer />
    </Page>
  );
}
