import { Badge, Page, Grid, Stat } from "@/components/ui";
import {
  ConnectionNotice,
  ManagementModules,
  WorkspaceWelcome,
} from "@/components/admin/overview";
import { requireSuperuser } from "@/lib/auth";
export default async function OverviewPage() {
  await requireSuperuser();
  const connected = Boolean(
    process.env.VOX_CORE_ADMIN_URL && process.env.VOX_ADMIN_TOKEN,
  );
  return (
    <Page
      title="Overview"
      description="Your home for managing Vox."
      actions={<Badge tone="accent">Superuser</Badge>}
    >
      <WorkspaceWelcome />
      <Grid>
        <Stat
          label="Workspace"
          value="Vox"
          description="One home for your management tools."
        />
        <Stat
          label="Data access"
          value="Read only"
          description="Inspect Redis without changing entries."
        />
        <Stat
          label="Authentication"
          value="Google"
          description="Restricted to approved accounts."
        />
      </Grid>
      <ManagementModules />
      <ConnectionNotice configured={connected} />
    </Page>
  );
}
