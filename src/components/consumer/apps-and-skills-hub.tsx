import { ConnectionsManager } from "./connections-manager";
import { ExtensionsManager } from "./extensions-manager";
import { GrantsManager } from "./grants-manager";
import { SkillsManager } from "./skills-manager";
import { Badge, Card, LinkButton, Stack, Text } from "@/components/ui";

export function AppsAndSkillsHub() {
  return (
    <Stack gap="large">
      <div>
        <LinkButton href="/app" variant="ghost">Back to your account</LinkButton>
        <h1 className="mt-4">Apps and skills</h1>
        <Text muted>See what is installed, which account is connected, which agents can use it, and when an action needs approval.</Text>
      </div>
      <Card title="How access works" tone="soft">
        <ol className="grid gap-3 text-sm text-mist md:grid-cols-4">
          <li><Badge tone="neutral">1 · Installed</Badge><p className="mt-2">An app or skill is available to configure.</p></li>
          <li><Badge tone="neutral">2 · Connected</Badge><p className="mt-2">A verified external account is linked.</p></li>
          <li><Badge tone="neutral">3 · Agent enabled</Badge><p className="mt-2">You choose which agent gets each capability.</p></li>
          <li><Badge tone="neutral">4 · Approved</Badge><p className="mt-2">A consequential action needs your exact approval.</p></li>
        </ol>
      </Card>
      <nav aria-label="Apps and skills sections" className="flex flex-wrap gap-4 text-sm">
        <a href="#accounts" className="underline underline-offset-4">Accounts</a>
        <a href="#apps" className="underline underline-offset-4">Apps</a>
        <a href="#access" className="underline underline-offset-4">Agent access</a>
        <a href="#skills" className="underline underline-offset-4">Skills</a>
      </nav>
      <section id="accounts" aria-label="Connected accounts"><ConnectionsManager /></section>
      <section id="apps" aria-label="Apps"><ExtensionsManager /></section>
      <section id="access" aria-label="Agent access"><GrantsManager /></section>
      <section id="skills" aria-label="Skills"><SkillsManager /></section>
    </Stack>
  );
}
