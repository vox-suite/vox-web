"use client";
import { useState } from "react";
import {
  CalendarDays,
  Check,
  MessageCircle,
  Phone,
  Sparkles,
  Waves,
} from "lucide-react";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

const examples = [
  {
    label: "Plan and follow through",
    icon: CalendarDays,
    title: "Turn a crowded day into a plan that holds.",
    details: [
      "Understands the trade-off",
      "Moves the decision into your calendar",
      "Keeps the next check-in attached",
    ],
    user: "Tomorrow is packed. Protect two hours for the proposal and move anything that can wait.",
    first:
      "The client review is fixed. I can move the internal sync to Thursday and hold 9 to 11 for the proposal.",
    last: "Done. I’ll check in tomorrow morning if anything new conflicts with that block.",
    outcome: "Calendar updated · follow-up scheduled",
  },
  {
    label: "Delegate a commitment",
    icon: MessageCircle,
    title: "Capture the commitment while it is fresh.",
    details: [
      "Keeps the project context",
      "Creates durable work",
      "Reports progress across channels",
    ],
    user: "There’s a lot on my mind this week.",
    first:
      "I have it. Should I track the launch brief and remind you Thursday afternoon?",
    last: "It’s added with a Friday deadline. I’ll send the progress update on WhatsApp Thursday.",
    outcome: "Task created · cross-channel update arranged",
  },
  {
    label: "Prepare and call back",
    icon: Sparkles,
    title: "Let the next important moment come to you.",
    details: [
      "Schedules background preparation",
      "Keeps evidence with the task",
      "Calls when the briefing is ready",
    ],
    user: "Review the open launch items overnight and call me before the 9 AM meeting.",
    first:
      "I’ll check the outstanding tasks and decisions, then prepare a short briefing.",
    last: "Scheduled. I’ll call at 8:30 AM and flag anything that needs your decision first.",
    outcome: "Review scheduled · outbound call queued",
  },
];

export function ConversationDemo() {
  const [selected, setSelected] = useState(0);
  const example = examples[selected];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Explore conversations">
        {examples.map(({ label, icon: Icon }, index) => (
          <button
            type="button"
            key={label}
            aria-pressed={index === selected}
            aria-controls="conversation-preview"
            onClick={() => setSelected(index)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors",
              index === selected
                ? "border-coral-pulse/40 bg-ember-hush text-mist shadow-subtle-3"
                : "border-border-edge bg-graphite/50 text-ash hover:border-ash hover:text-pure-white"
            )}
          >
            <Icon size={15} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>
      <div
        className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_200px_minmax(0,1.2fr)]"
        id="conversation-preview"
        aria-live="polite"
        aria-atomic="true"
      >
        <aside className="hidden rounded-2xl border border-border-edge bg-ink p-6 shadow-subtle-3 lg:block">
          <p className="mb-2 font-mono text-xs uppercase tracking-wide text-smoke">
            Real-life conversations
          </p>
          <h3 className="mb-4 text-lg font-medium text-pure-white">{example.title}</h3>
          <div className="flex flex-col gap-2">
            {example.details.map((detail) => (
              <span
                key={detail}
                className="inline-flex items-start gap-2 text-sm text-ash"
              >
                <Check size={13} className="mt-0.5 shrink-0 text-mist" aria-hidden="true" />
                {detail}
              </span>
            ))}
          </div>
        </aside>
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border-edge bg-obsidian p-6 text-center shadow-subtle-3">
          <p className="font-mono text-xs uppercase tracking-wide text-smoke">
            Your personal assistant
          </p>
          <div
            className="flex size-24 items-center justify-center rounded-full border border-border-edge bg-graphite text-coral-pulse shadow-key-window"
            aria-hidden="true"
          >
            <Waves size={36} strokeWidth={1.25} />
          </div>
          <Badge tone="positive">
            <Phone size={11} aria-hidden="true" /> Voice-first simplicity
          </Badge>
        </div>
        <div className="rounded-2xl border border-border-edge bg-ink p-6 shadow-subtle-3">
          <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-xs text-smoke">Conversation preview</span>
            <Badge>Illustrative</Badge>
          </header>
          <div className="mb-3 rounded-md border border-border-edge bg-graphite/60 px-3 py-2.5 text-sm text-mist">
            {example.user}
          </div>
          <div className="mb-3 rounded-md border border-border-edge bg-obsidian px-3 py-2.5 text-sm text-ash">
            {example.first}
          </div>
          <div className="mb-4 rounded-md border border-border-edge bg-obsidian px-3 py-2.5 text-sm text-ash">
            {example.last}
          </div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-ember-hush/60 px-3 py-2 font-mono text-xs text-coral-pulse">
            <Check size={13} aria-hidden="true" />
            {example.outcome}
          </div>
          <small className="block text-xs leading-relaxed text-smoke">
            Illustrative conversation based on current Vox capabilities. No active call is
            taking place.
          </small>
        </div>
      </div>
    </div>
  );
}
