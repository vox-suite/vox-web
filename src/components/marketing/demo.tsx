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
    <div className="demo">
      <div
        className="demo-tabs"
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
          >
            <Icon size={15} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>
      <div
        className="demo-content"
        id="conversation-preview"
        aria-live="polite"
        aria-atomic="true"
      >
        <aside className="demo-context">
          <p>Real-life conversations</p>
          <h3>{example.title}</h3>
          <div className="demo-list">
            {example.details.map((detail) => (
              <span key={detail}>
                <Check size={13} aria-hidden="true" />
                {detail}
              </span>
            ))}
          </div>
        </aside>
        <div className="demo-voice">
          <p>Your personal assistant</p>
          <div className="voice-orbit" aria-hidden="true">
            <Waves />
          </div>
          <Badge tone="positive">
            <Phone size={11} aria-hidden="true" /> Voice-first simplicity
          </Badge>
        </div>
        <div className="demo-transcript">
          <header>
            <span>Conversation preview</span>
            <Badge>Illustrative</Badge>
          </header>
          <div className="bubble" data-speaker="user">
            {example.user}
          </div>
          <div className="bubble">{example.first}</div>
          <div className="bubble">{example.last}</div>
          <div className="demo-outcome">
            <Check size={13} aria-hidden="true" />
            {example.outcome}
          </div>
          <small>
            Illustrative conversation based on current Vox capabilities. No
            active call is taking place.
          </small>
        </div>
      </div>
    </div>
  );
}
