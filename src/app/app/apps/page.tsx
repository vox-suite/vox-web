import { AppsAndSkillsHub } from "@/components/consumer/apps-and-skills-hub";
import { AuthFrame } from "@/components/ui";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { consumerHref } from "@/lib/access";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AppsAndSkillsPage() {
  const requestHeaders = await headers();
  const account = await currentConsumer(requestHeaders);
  if (!account) {
    redirect(`${consumerHref(requestHeaders.get("host") ?? "", "/sign-in")}?reason=session`);
  }
  return (
    <AuthFrame brandHref="/app" footer="Vox account · Access is enforced by Core">
      <AppsAndSkillsHub />
    </AuthFrame>
  );
}
