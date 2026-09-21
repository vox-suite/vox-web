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
    label: "Plan your day",
    icon: CalendarDays,
    title: "Make room for what actually matters.",
    details: [
      "Sort schedules without the friction",
      "Protect focus time for your priorities",
      "Adapt easily as plans change",
    ],
    user: "My schedule tomorrow is packed. Can you help me find some breathing room?",
    first:
      "Let’s take a look. What’s the main thing you want to protect tomorrow?",
    last: "Got it. Let’s move the afternoon sync to Thursday and keep your morning focus block open.",
  },
  {
    label: "Think it through",
    icon: MessageCircle,
    title: "Turn mental clutter into clear next steps.",
    details: [
      "Talk it out at your own pace",
      "Distill thoughts into actionable steps",
      "Pick up right where you left off",
    ],
    user: "There’s a lot on my mind this week.",
    first: "I’m here. What’s demanding your attention the most right now?",
    last: "We can break this down one step at a time. What would bring you the most relief today?",
  },
  {
    label: "Stay on track",
    icon: Sparkles,
    title: "Turn good intentions into lasting habits.",
    details: [
      "Transform ideas into realistic plans",
      "Keep context across every check-in",
      "Follow through with gentle accountability",
    ],
    user: "I want to get back into running, but I keep putting it off.",
    first:
      "Let’s start with something easy that fits your routine. When do you usually have twenty minutes?",
    last: "Tuesday and Thursday mornings work well. I’ll remind you before breakfast so you're ready to go.",
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
          <small>
            A preview of the voice experience in development. No active call is
            taking place.
          </small>
        </div>
      </div>
    </div>
  );
}
