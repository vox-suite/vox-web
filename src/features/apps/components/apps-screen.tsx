import { PageHeader } from "@/components/app";
import { ConnectionsPanel } from "@/features/connections/components/connections-panel";
import { ExtensionsPanel } from "@/features/extensions/components/extensions-panel";
import { GrantsPanel } from "@/features/grants/components/grants-panel";
import { SkillsPanel } from "@/features/skills/components/skills-panel";

const ACCESS_STEPS = [
  { label: "Installed", detail: "An app or skill is available to configure." },
  { label: "Connected", detail: "A verified external account is linked." },
  {
    label: "Agent enabled",
    detail: "You choose which agent gets each capability.",
  },
  {
    label: "Approved",
    detail: "A consequential action needs your exact approval.",
  },
];

const SECTIONS = [
  { id: "accounts", label: "Accounts" },
  { id: "apps", label: "Apps" },
  { id: "access", label: "Agent access" },
  { id: "skills", label: "Skills" },
];

export function AppsScreen() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Apps and skills"
        description="See what is installed, which account is connected, which agents can use it, and when an action needs approval."
      />
      <section aria-labelledby="access-steps" className="space-y-3">
        <h2 id="access-steps" className="sr-only">
          How access works
        </h2>
        <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {ACCESS_STEPS.map((step, index) => (
            <li
              key={step.label}
              className="rounded-lg border border-border-edge bg-ink px-4 py-3"
            >
              <p className="font-mono text-[11px] text-smoke">
                Step {index + 1}
              </p>
              <p className="text-[13px] font-medium text-pure-white">
                {step.label}
              </p>
              <p className="text-xs leading-relaxed text-smoke">
                {step.detail}
              </p>
            </li>
          ))}
        </ol>
      </section>
      <nav
        aria-label="Apps and skills sections"
        className="sticky top-14 z-20 -mx-4 flex gap-1 overflow-x-auto border-b border-border-edge bg-void-black/90 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 lg:top-0 lg:-mx-10 lg:px-10"
      >
        {SECTIONS.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="shrink-0 rounded-md px-3 py-1.5 text-[13px] text-ash no-underline hover:bg-graphite hover:text-pure-white"
          >
            {section.label}
          </a>
        ))}
      </nav>
      <div className="space-y-6">
        <ConnectionsPanel id="accounts" />
        <ExtensionsPanel id="apps" />
        <GrantsPanel id="access" />
        <SkillsPanel id="skills" />
      </div>
    </div>
  );
}
