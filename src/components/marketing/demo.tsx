"use client";
import { useState } from "react";
import { CalendarDays, Check, MessageCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { VoxLogo } from "@/components/ui/vox-logo";

const examples = [
  {
    label: "Plan and follow through",
    icon: CalendarDays,
    user: "Tomorrow is packed. Protect two hours for the proposal and move anything that can wait.",
    first:
      "The client review is fixed. I can move the internal sync to Thursday and hold 9 to 11 for the proposal.",
    last: "Done. I’ll check in tomorrow morning if anything new conflicts with that block.",
    outcome: "Calendar updated · follow-up scheduled",
  },
  {
    label: "Delegate a commitment",
    icon: MessageCircle,
    user: "There’s a lot on my mind this week.",
    first:
      "I have it. Should I track the launch brief and remind you Thursday afternoon?",
    last: "It’s added with a Friday deadline. I’ll send the progress update on WhatsApp Thursday.",
    outcome: "Task created · WhatsApp update arranged",
  },
  {
    label: "Prepare and call back",
    icon: Sparkles,
    user: "Review the open launch items overnight and call me before the 9 AM meeting.",
    first:
      "I’ll check the outstanding tasks and decisions, then prepare a short briefing.",
    last: "Scheduled. I’ll call at 8:30 AM and flag anything that needs your decision first.",
    outcome: "Review scheduled · outbound call queued",
  },
];

export function ConversationDemo() {
  const [selected, setSelected] = useState(1);
  const example = examples[selected];

  return (
    <div className="grid overflow-hidden rounded-2xl border border-[#232427] bg-[#07080a] xl:grid-cols-[220px_200px_minmax(0,1fr)]">
      <div
        className="flex gap-2 overflow-x-auto border-b border-[#232427] p-3 xl:flex-col xl:overflow-visible xl:border-b-0 xl:border-r xl:bg-[#0a0a0c] xl:p-4"
        role="group"
        aria-label="Explore conversations"
      >
        {examples.map(({ label, icon: Icon }, index) => (
          <button
            type="button"
            key={label}
            aria-pressed={index === selected}
            aria-controls="conversation-preview"
            onClick={() => setSelected(index)}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-4 text-left text-[15px] transition-colors duration-150",
              index === selected
                ? "key-graphite text-pure-white"
                : "text-ash hover:bg-white/[0.03] hover:text-pure-white",
            )}
          >
            <Icon
              size={16}
              className={index === selected ? "text-mist" : ""}
              aria-hidden="true"
            />
            {label}
          </button>
        ))}
      </div>

      <div className="hidden flex-col items-center justify-center gap-3 border-r border-[#232427] bg-[#0a0a0c] px-6 py-10 text-center xl:flex">
        <p className="font-mono text-[10px] uppercase tracking-widest text-smoke">
          Your personal assistant
        </p>
        <VoxLogo size={64} animated state="listening" speed={0.6} />
        <span className="inline-flex items-center gap-1.5 rounded bg-obsidian px-2 py-1 font-mono text-[10px] text-success-green">
          Voice-first simplicity
        </span>
      </div>

      <div
        className="flex flex-col gap-3 p-5 md:p-10"
        id="conversation-preview"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[13px] font-medium text-ash">
            Conversation preview
          </span>
          <span className="rounded border border-[#2f3031] bg-[#111214] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-smoke">
            Illustrative
          </span>
        </div>
        <p className="ml-auto max-w-[34rem] rounded-2xl rounded-br-md bg-[#1f1f23] px-4 py-3 text-[15px] leading-relaxed text-mist">
          {example.user}
        </p>
        <p className="max-w-[34rem] rounded-2xl rounded-bl-md bg-[#16161a] px-4 py-3 text-[15px] leading-relaxed text-ash">
          {example.first}
        </p>
        <p className="max-w-[34rem] rounded-2xl rounded-bl-md bg-[#16161a] px-4 py-3 text-[15px] leading-relaxed text-ash">
          {example.last}
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-sm text-pure-white">
            <Check size={15} className="text-mist" aria-hidden="true" />
            {example.outcome}
          </span>
          <span className="text-[13px] text-smoke">
            Illustrative conversation. No live call is taking place.
          </span>
        </div>
      </div>
    </div>
  );
}
