"use client";

import {
  useState,
  useRef,
  useEffect,
  type ReactNode,
  type KeyboardEvent,
} from "react";
import {
  BellRing,
  CalendarClock,
  Check,
  Phone,
  MessageCircle,
  Smartphone,
  Undo2,
} from "lucide-react";

const levels = [
  {
    id: "notify",
    label: "Notify me",
    text: "Vox flags what needs attention. You take it from there.",
  },
  {
    id: "ask",
    label: "Ask first",
    text: "Vox prepares the action and waits for your approval.",
  },
  {
    id: "act",
    label: "Act automatically",
    text: "Vox completes the task within the limits you set.",
  },
] as const;

const reach = [
  { label: "Phone call", icon: Phone },
  { label: "Message", icon: MessageCircle },
  { label: "App", icon: Smartphone },
];

function Outcome({ level }: { level: number }) {
  if (level === 0)
    return (
      <div className="h-au-out" key="n">
        <p className="h-au-who">Vox</p>
        <p className="h-au-msg">
          Your 3:00 PM dentist visit overlaps your 3:30 PM team meeting.
        </p>
        <div className="h-au-actions">
          <span>Got it</span>
        </div>
      </div>
    );
  if (level === 1)
    return (
      <div className="h-au-out" key="a">
        <p className="h-au-who">Vox</p>
        <p className="h-au-msg">
          Your 3:00 PM dentist visit overlaps your 3:30 PM meeting. I can move
          the meeting to 4:30 PM and tell Sam.
        </p>
        <div className="h-au-actions">
          <span data-primary="true">Approve</span>
          <span>Not now</span>
        </div>
      </div>
    );
  return (
    <div className="h-au-out" key="x">
      <p className="h-au-who">Vox</p>
      <p className="h-au-msg">
        Your 3:00 PM dentist visit overlapped your 3:30 PM meeting, so I moved
        the meeting to 4:30 PM and told Sam.
      </p>
      <div className="h-au-actions">
        <span data-done="true">
          <Check size={14} aria-hidden="true" /> Done
        </span>
        <span>
          <Undo2 size={14} aria-hidden="true" /> Undo
        </span>
      </div>
    </div>
  );
}

export function AutonomyPanel({ children }: { children: ReactNode }) {
  const [level, setLevel] = useState(0);
  const panel = useRef<HTMLDivElement>(null);
  const manual = useRef(false);
  const track = useRef<HTMLDivElement>(null);
  const stopDemo = () => {
    manual.current = true;
  };
  useEffect(() => {
    const element = panel.current;
    const container = track.current;
    if (!element || !container) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    function update() {
      frame = 0;
      if (!element || !container) return;
      const height = element.getBoundingClientRect().height;
      const enabled =
        !motion.matches &&
        window.innerWidth > 900 &&
        height < window.innerHeight - 120;
      container.dataset.pinned = String(enabled);
      container.style.setProperty("--au-height", `${height}px`);
      const top = Math.max(88, (window.innerHeight - height) / 2);
      const bounds = container.getBoundingClientRect();
      container.dataset.pinActive = String(
        enabled && bounds.top <= top && bounds.bottom >= top + height,
      );
      if (!enabled || manual.current) return;
      const distance = bounds.height - height;
      const progress = Math.max(
        0,
        Math.min(1, (top - container.getBoundingClientRect().top) / distance),
      );
      setLevel(Math.min(2, Math.floor(progress * 3)));
    }
    function scroll() {
      manual.current = false;
      if (!frame) frame = requestAnimationFrame(update);
    }
    const resize = new ResizeObserver(() => {
      if (!frame) frame = requestAnimationFrame(update);
    });
    resize.observe(element);
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", scroll);
    motion.addEventListener("change", scroll);
    update();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", scroll);
      motion.removeEventListener("change", scroll);
    };
  }, []);
  const options = useRef<(HTMLButtonElement | null)[]>([]);
  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown")
      next = (index + 1) % levels.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
      next = (index + levels.length - 1) % levels.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = levels.length - 1;
    else return;
    event.preventDefault();
    stopDemo();
    setLevel(next);
    options.current[next]?.focus();
  }
  const [on, setOn] = useState([true, true, false]);
  return (
    <div className="h-au-scroll" ref={track}>
      <div className="h-au-scene" ref={panel}>
        {children}
        <div className="h-au">
          <div
            className="h-au-pick"
            role="radiogroup"
            aria-label="How much Vox does on its own"
          >
            {levels.map((l, i) => (
              <button
                key={l.id}
                type="button"
                role="radio"
                aria-checked={level === i}
                tabIndex={level === i ? 0 : -1}
                ref={(element) => {
                  options.current[i] = element;
                }}
                onKeyDown={(event) => navigate(event, i)}
                onFocus={stopDemo}
                onClick={() => {
                  stopDemo();
                  setLevel(i);
                }}
              >
                <span className="h-au-dots" aria-hidden="true">
                  {[0, 1, 2].map((d) => (
                    <i key={d} data-on={d <= i || undefined} />
                  ))}
                </span>
                <strong>{l.label}</strong>
                <span>{l.text}</span>
              </button>
            ))}
          </div>

          <div className="h-au-stage">
            <div className="h-au-trigger">
              <CalendarClock size={16} aria-hidden="true" />
              <span>Example: two events overlap this afternoon</span>
            </div>
            <div className="h-au-card">
              {levels.map((_, index) => (
                <div
                  key={index}
                  className="h-au-frame"
                  data-active={level === index}
                  aria-hidden={level !== index}
                >
                  <Outcome level={index} />
                </div>
              ))}
            </div>
            <div className="h-au-meta">
              <div>
                <p className="h-au-cap">Limits</p>
                <p
                  className={
                    level === 2 ? "h-au-limit h-au-limit-on" : "h-au-limit"
                  }
                >
                  {level === 2
                    ? "Only inside your working hours"
                    : "Applied when set to act automatically"}
                </p>
              </div>
              <div>
                <p className="h-au-cap">Reach me by</p>
                <div className="h-chips">
                  {reach.map(({ label, icon: Icon }, i) => (
                    <button
                      key={label}
                      type="button"
                      aria-pressed={on[i]}
                      onClick={() =>
                        setOn(on.map((v, j) => (j === i ? !v : v)))
                      }
                    >
                      <Icon size={14} aria-hidden="true" /> {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <p className="h-au-foot">
              <BellRing size={12} aria-hidden="true" /> Illustrative settings.
              Vox is in development.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
