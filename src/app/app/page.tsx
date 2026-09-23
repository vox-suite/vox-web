import {
  IdentityControls,
  RecoveryEnrollment,
  SessionControls,
} from "@/components/consumer/account-controls";
import { ConnectionsManager } from "@/components/consumer/connections-manager";
import { ExtensionsManager } from "@/components/consumer/extensions-manager";
import { GrantsManager } from "@/components/consumer/grants-manager";
import { ProposalsManager } from "@/components/consumer/proposals-manager";
import { TasksView } from "@/components/consumer/tasks-view";
import { UnifiedJourneys } from "@/components/consumer/unified-journeys";
import { AuthFrame, Badge, Card, Stack, Text } from "@/components/ui";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { consumerHref } from "@/lib/access";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ConsumerHomePage() {
  const requestHeaders = await headers();
  const account = await currentConsumer(requestHeaders);
  if (!account) {
    redirect(
      `${consumerHref(requestHeaders.get("host") ?? "", "/sign-in")}?reason=session`,
    );
  }
  return (
    <AuthFrame
      brandHref="/app"
      footer="Vox account · Canonical identity and authority protected by Core"
    >
      <Stack gap="large">
        <Stack>
          <Badge tone="positive">Signed in</Badge>
          <h1>Welcome{account.name ? `, ${account.name}` : ""}.</h1>
          <Text muted>{account.email}</Text>
        </Stack>
        <UnifiedJourneys />
        <TasksView />
        <ProposalsManager />
        <ConnectionsManager />
        <GrantsManager />
        <ExtensionsManager />
        <Card
          title="Email recovery"
          description="Enable this explicitly before email codes may recover a Google account."
          tone="soft"
        >
          <RecoveryEnrollment enabled={account.recoveryEnabled} />
        </Card>
        <Card
          title="Linked identities"
          description="Linking is always explicit. Vox never merges accounts because two providers report the same email."
          tone="soft"
        >
          <IdentityControls />
        </Card>
        <SessionControls />
      </Stack>
    </AuthFrame>
  );
}

