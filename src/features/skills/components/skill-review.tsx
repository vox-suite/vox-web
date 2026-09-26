"use client";

import { Button } from "@/components/ui";
import type {
  SkillListing,
  SkillVersion,
} from "@/lib/consumer-auth/core-host-client";

export type SkillReviewState = {
  skill: SkillListing;
  current: SkillVersion | null;
  next: SkillVersion;
};

function VersionBody({
  heading,
  version,
}: {
  heading: string;
  version: SkillVersion;
}) {
  return (
    <div className="min-w-0 space-y-2">
      <h4 className="text-[13px] font-medium text-mist">{heading}</h4>
      <pre className="max-h-80 overflow-auto rounded-md border border-border-edge bg-ink p-3 text-xs break-words whitespace-pre-wrap text-ash">
        {version.instructions}
      </pre>
      <pre className="max-h-40 overflow-auto rounded-md border border-border-edge bg-ink p-3 text-xs break-words whitespace-pre-wrap text-ash">
        {JSON.stringify(version.resources, null, 2)}
      </pre>
    </div>
  );
}

export function SkillReview({
  review,
  pending,
  onInstall,
  onCancel,
}: {
  review: SkillReviewState;
  pending: boolean;
  onInstall: () => void;
  onCancel: () => void;
}) {
  const { skill, current, next } = review;
  return (
    <section
      aria-label={`Review ${skill.title}`}
      className="space-y-4 rounded-lg border border-slate bg-obsidian p-4"
    >
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-pure-white">
          Review {skill.title} v{next.version}
        </h3>
        <p className="text-[13px] text-smoke">
          Requested tools are requirements, not permission. Only tools you grant
          to an agent can be used.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {current ? (
          <VersionBody
            heading={`Installed v${current.version}`}
            version={current}
          />
        ) : null}
        <VersionBody heading={`New v${next.version}`} version={next} />
      </div>
      <p className="text-[13px] text-smoke">
        Requested tools: {next.requested_capabilities.join(", ") || "None"}
        {current
          ? ` (previous: ${current.requested_capabilities.join(", ") || "none"})`
          : ""}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button disabled={pending} onClick={onInstall}>
          {pending ? "Installing…" : `Install v${next.version}`}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </section>
  );
}
