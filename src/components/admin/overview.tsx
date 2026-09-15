import { Blocks, Database, Palette, Waves } from "lucide-react";
import { Grid, ModuleCard, Notice, Stack } from "@/components/ui";
import { adminModules, adminHref } from "@/lib/admin-modules";
export function WorkspaceWelcome() {
  return (
    <div className="admin-welcome">
      <div>
        <h2>
          A little more clarity.
          <br />A place for every detail.
        </h2>
        <p>Explore your data and keep the everyday operations in view.</p>
      </div>
      <Waves size={75} strokeWidth={1} aria-hidden="true" />
    </div>
  );
}
export function ManagementModules({
  basePath = "/admin",
}: { basePath?: string } = {}) {
  return (
    <Grid columns={2}>
      {adminModules
        .filter((m) => m.slug)
        .map((module) => (
          <ModuleCard
            key={module.slug}
            title={module.title}
            description={module.description}
            href={adminHref(module.slug, basePath)}
            icon={
              module.icon === "database" ? (
                <Database size={22} />
              ) : module.icon === "design" ? (
                <Palette size={22} />
              ) : (
                <Blocks size={22} />
              )
            }
          />
        ))}
    </Grid>
  );
}
export function ConnectionNotice({ configured }: { configured: boolean }) {
  return configured ? (
    <Notice title="Explore your Redis data">
      Open Redis explorer to check the connection and browse entries.
    </Notice>
  ) : (
    <Stack>
      <Notice title="Connect your data source">
        The workspace is ready. Configure the Core admin connection to start
        browsing Redis.
      </Notice>
    </Stack>
  );
}
