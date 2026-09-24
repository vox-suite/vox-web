"use client";
import { useState } from "react";
import { CalendarDays, Check, MessageCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="plate grid overflow-hidden rounded-[28px] lg:grid-cols-[300px_minmax(0,1fr)]">
      <div
        className="flex gap-2 overflow-x-auto p-3 lg:flex-col lg:overflow-visible lg:bg-[#0a0a0c] lg:p-4"
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

      <div
        className="flex flex-col gap-3 p-5 md:p-10"
        id="conversation-preview"
        aria-live="polite"
        aria-atomic="true"
      >
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
