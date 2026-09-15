import {
  AuthFrame,
  Badge,
  LinkButton,
  Notice,
  Stack,
  Text,
} from "@/components/ui";
import { GoogleSignIn } from "@/components/admin/auth-controls";
import { authConfigured, currentSuperuser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  let target = "/admin";
  try {
    const headerList = await headers();
    const host = headerList.get("host")?.toLowerCase().split(":")[0];
    if (host === "admin.voxagent.in") {
      target = "/";
    }
  } catch {}
  if (await currentSuperuser()) redirect(target);
  const { error } = await searchParams;
  const configured = authConfigured();
  return (
    <AuthFrame>
      <Stack gap="large">
        <Stack>
          <Badge tone="accent">Vox administration</Badge>
          <h1>
            A clearer view
            <br />
            of your workspace.
          </h1>
          <Text muted>
            Sign in with your authorized Google account to manage Vox.
          </Text>
        </Stack>
        {error && (
          <Notice title="Sign-in was not completed" tone="error">
            Use an authorized Google account and try again. If access is still
            denied, contact the workspace owner.
          </Notice>
        )}
        {!configured && (
          <Notice title="Sign-in is not available yet">
            The workspace owner needs to finish the Google sign-in setup.
          </Notice>
        )}
        <GoogleSignIn disabled={!configured} />
        <Text muted small>
          Access is limited to approved superusers.
        </Text>
        <LinkButton href="https://voxagent.in" variant="ghost">
          Back to Vox
        </LinkButton>
      </Stack>
    </AuthFrame>
  );
}
