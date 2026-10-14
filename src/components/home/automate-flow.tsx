"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Phone } from "lucide-react";

const examples = [
  {
    name: "A reminder",
    ask: "Remind me to renew my passport Friday at nine. Call me.",
    when: "Friday · 9:00 AM",
    reply: "Your passport renewal reminder is due this morning.",
    note: "Need more time? Just say “Push it to Monday.”",
  },
  {
    name: "A bill alert",
    ask: "Call me when a bill in my connected accounts is due tomorrow.",
    when: "Your enabled alert · Bill due tomorrow",
    reply:
      "Your electricity bill is due tomorrow. Want a reminder this evening?",
    note: "Vox explains what triggered the alert. You decide what happens next.",
  },
  {
    name: "A weekly check-in",
    ask: "Every Sunday at six, call me to review my week.",
    when: "Sunday · 6:00 PM",
    reply:
      "Ready for your weekly check-in? What would you like to look back on?",
    note: "Ask about your spending, activity, or what’s coming up.",
  },
];
export function AutomateFlow({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(0);
  const section = useRef<HTMLDivElement>(null);
  const manual = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  function stopDemo() {
    manual.current = true;
    timers.current.forEach(clearTimeout);
  }
  useEffect(() => {
    const element = section.current;
    if (
      !element ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    let started = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          timers.current.forEach(clearTimeout);
          return;
        }
        if (started || manual.current) return;
        started = true;
        timers.current = [
          setTimeout(() => setActive(1), 3000),
          setTimeout(() => setActive(2), 6000),
        ];
      },
      { rootMargin: "-30% 0px -30% 0px" },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      timers.current.forEach(clearTimeout);
    };
  }, []);
  return (
    <div className="h-follow-layout" ref={section}>
      <div className="h-follow-intro">
        {children}
        <div
          className="h-follow-examples"
          role="group"
          aria-label="Choose a follow-through example"
        >
          {examples.map((item, index) => (
            <button
              key={item.name}
              type="button"
              aria-pressed={active === index}
              onFocus={stopDemo}
              onClick={() => {
                stopDemo();
                setActive(index);
              }}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>
      <div className="h-follow-stage">
        <div className="h-follow-scenes">
          {examples.map((example, index) => (
            <div
              className="h-simple-follow"
              key={example.name}
              data-active={active === index}
              aria-hidden={active !== index}
            >
              <div className="h-simple-follow-request">
                <span>You ask</span>
                <blockquote>“{example.ask}”</blockquote>
              </div>

              <div className="h-simple-follow-callback">
                <span>
                  <Phone size={18} aria-hidden="true" />
                  {example.when}
                </span>
                <blockquote>“{example.reply}”</blockquote>
                <p>{example.note}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="h-simple-follow-note">
          Illustrative examples. Vox calls for reminders you set and alerts you
          turn on.
        </p>
      </div>
    </div>
  );
}
