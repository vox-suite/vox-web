import {
  ArrowRight,
  AudioLines,
  CalendarCheck,
  Check,
  CheckCheck,
  Fingerprint,
  History,
  MessageCircle,
  Phone,
  PhoneCall,
  Radio,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Badge, Grid, LinkButton, Row, Section } from "@/components/ui";
import { CHANGELOG_DATA } from "@/components/changelog/changelog-data";
import { cn } from "@/lib/utils";
import { ConversationDemo } from "./demo";

const callPath = [
  {
    icon: Phone,
    step: "01",
    title: "Call from wherever you are",
    description:
      "Use the phone already in your hand. Known callers get a personal opening without waiting for the rest of the system to wake up.",
  },
  {
    icon: AudioLines,
    step: "02",
    title: "Speak without learning commands",
    description:
      "Pause, correct yourself, or interrupt. Vox keeps the conversation moving and works out what needs attention.",
  },
  {
    icon: CheckCheck,
    step: "03",
    title: "Leave with the work in motion",
    description:
      "Decisions become durable tasks, calendar changes, notes, reminders, and scheduled follow-ups—not a transcript you must process later.",
  },
  {
    icon: PhoneCall,
    step: "04",
    title: "Hear back when it matters",
    description:
      "Vox can track progress across time and reach out again when a commitment changes, a deadline arrives, or you asked for a follow-up.",
  },
];

const currentCapabilities = [
  {
    icon: Radio,
    badge: "< 180ms duplex",
    title: "A call that feels interruptible",
    description:
      "Fast openings, streaming speech, and local voice activity detection keep the conversation responsive when you jump in.",
    visual: (
      <div
        className="mt-6 flex items-center gap-3 rounded-md border border-border-edge bg-obsidian px-3 py-2.5"
        aria-hidden="true"
      >
        <div className="flex h-6 items-end gap-0.5">
          {["h-[9px]", "h-[15px]", "h-3", "h-[18px]", "h-[9px]"].map(
            (height, i) => (
              <span
                key={i}
                className={`w-0.5 rounded-full bg-coral-pulse ${height}`}
              />
            ),
          )}
        </div>
        <span className="flex-1 truncate font-mono text-xs text-smoke">
          Live barge-in · Streaming VAD
        </span>
        <span className="rounded-md bg-ember-hush px-1.5 py-0.5 font-mono text-[10px] text-coral-pulse">
          Active
        </span>
      </div>
    ),
  },
  {
    icon: History,
    badge: "Phone ⇄ WhatsApp",
    title: "Context that survives the call",
    description:
      "Vox carries your projects, preferences, tasks, and prior decisions across phone and WhatsApp conversations.",
    visual: (
      <div
        className="mt-6 flex flex-wrap items-center gap-2 rounded-md border border-border-edge bg-obsidian px-3 py-2.5 font-mono text-xs text-smoke"
        aria-hidden="true"
      >
        <span className="inline-flex items-center gap-1.5 rounded-md bg-graphite px-2 py-1">
          <Phone size={12} /> Call ended
        </span>
        <ArrowRight size={11} className="text-iron" />
        <span className="inline-flex items-center gap-1.5 rounded-md bg-graphite px-2 py-1">
          <MessageCircle size={12} /> WhatsApp sync
        </span>
      </div>
    ),
  },
  {
    icon: CalendarCheck,
    badge: "Auto calendar",
    title: "Work that keeps moving",
    description:
      "Create and update tasks, calendar plans, personal records, reminders, and scheduled work through ordinary conversation.",
    visual: (
      <div
        className="mt-6 flex items-center gap-3 rounded-md border border-border-edge bg-obsidian px-3 py-2.5"
        aria-hidden="true"
      >
        <Check size={13} className="shrink-0 text-mist" />
        <span className="flex-1 truncate font-mono text-xs text-smoke">
          Thu 9:00 AM · Proposal block
        </span>
        <span className="rounded-md bg-graphite px-1.5 py-0.5 font-mono text-[10px] text-mist">
          Added
        </span>
      </div>
    ),
  },
  {
    icon: PhoneCall,
    badge: "Outbound queue",
    title: "Calls back when it matters",
    description:
      "Schedule follow-ups and outbound calls so urgent updates can come to you instead of waiting behind another dashboard.",
    visual: (
      <div
        className="mt-6 flex items-center gap-3 rounded-md border border-border-edge bg-obsidian px-3 py-2.5"
        aria-hidden="true"
      >
        <PhoneCall size={13} className="shrink-0 text-ash" />
        <span className="flex-1 truncate font-mono text-xs text-smoke">
          Briefing call · Tomorrow 8:30 AM
        </span>
        <span className="rounded-md bg-graphite px-1.5 py-0.5 font-mono text-[10px] text-ash">
          Queued
        </span>
      </div>
    ),
  },
  {
    icon: Fingerprint,
    badge: "Voice biometrics",
    title: "Recognizes who is speaking",
    description:
      "Voice biometrics help Vox keep personal context with the right speaker, including when a different person takes over the call.",
    visual: (
      <div
        className="mt-6 flex items-center gap-3 rounded-md border border-border-edge bg-obsidian px-3 py-2.5"
        aria-hidden="true"
      >
        <Fingerprint size={13} className="shrink-0 text-ash" />
        <span className="flex-1 truncate font-mono text-xs text-smoke">
          Speaker match: Rahul
        </span>
        <span className="rounded-md bg-graphite px-1.5 py-0.5 font-mono text-[10px] text-mist">
          Verified
        </span>
      </div>
    ),
  },
  {
    icon: ShieldCheck,
    badge: "Audit trail",
    title: "A trail for important actions",
    description:
      "Durable status updates and structured audit evidence make consequential work easier to inspect and recover.",
    visual: (
      <div
        className="mt-6 flex items-center gap-3 rounded-md border border-border-edge bg-obsidian px-3 py-2.5"
        aria-hidden="true"
      >
        <ShieldCheck size={13} className="shrink-0 text-ash" />
        <span className="flex-1 truncate font-mono text-xs text-smoke">
          Event #1042 · Signed &amp; durable
        </span>
        <span className="rounded-md bg-graphite px-1.5 py-0.5 font-mono text-[10px] text-smoke">
          Logged
        </span>
      </div>
    ),
  },
];

const latestReleaseIds = [
  "2026-09-21-wespeaker-biometrics-elevenlabs-mp3",
  "2026-09-19-zero-latency-audio-cache",
  "2026-09-16-autonomous-tasks-cross-channel",
];

const latestReleases = latestReleaseIds.flatMap((id) => {
  const release = CHANGELOG_DATA.find((item) => item.id === id);
  return release ? [release] : [];
});

export function HeroAppMockup() {
  return (
    <div
      className="overflow-hidden rounded-[12px] border border-[#363739] bg-ink shadow-[rgba(255,255,255,0.05)_0px_1px_0px_0px_inset,rgba(255,255,255,0.18)_0px_0px_0px_1px,rgba(0,0,0,0.55)_0px_24px_60px_8px]"
      aria-label="Vox Command Center interface preview"
    >
      <div className="flex items-center gap-3 border-b border-[#232427] px-4 py-3">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-1 font-mono text-[12px] text-ash">
          <span className="text-mist">vox</span>
          <span className="text-smoke">/</span>
          <span className="truncate text-smoke">live-duplex-session</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-ash">
          <span
            className="size-1.5 rounded-full bg-coral-pulse shadow-[0_0_8px_rgba(255,99,99,0.85)]"
            aria-hidden="true"
          />
          <span>Connected · &lt; 180ms</span>
        </div>
      </div>

      <div className="mx-3 mt-3 flex flex-wrap items-center gap-3 rounded-2xl border border-[#363739] bg-obsidian px-3 py-2.5 shadow-[rgba(255,255,255,0.05)_0px_1px_0px_0px_inset]">
        <div className="shrink-0" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect
              x="6"
              y="0.5"
              width="7.5"
              height="7.5"
              rx="1.5"
              transform="rotate(45 6 0.5)"
              fill="#ff6363"
            />
          </svg>
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-0.5 text-[13px] text-mist">
          <span className="truncate">
            Protect two hours for the proposal and move internal sync to
            Thursday
          </span>
          <span
            className="ml-0.5 inline-block h-3.5 w-px animate-pulse bg-coral-pulse"
            aria-hidden="true"
          />
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-md bg-graphite px-2 py-1 font-mono text-[10px] text-ash">
          <span
            className="size-1.5 animate-pulse rounded-full bg-coral-pulse"
            aria-hidden="true"
          />
          Live Voice · Rahul
        </div>
      </div>

      <div className="mt-2 space-y-1 px-3 pb-3" role="list">
        <div
          className="flex items-start gap-3 rounded-lg bg-ember-hush/50 px-3 py-2.5 ring-1 ring-inset ring-coral-pulse/20"
          role="listitem"
        >
          <div
            className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-ember-hush text-mist"
            aria-hidden="true"
          >
            <CalendarCheck size={14} />
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="text-[13px] leading-snug text-mist">
              <strong className="font-medium text-pure-white">Calendar:</strong>{" "}
              Block Thu 9:00 AM – 11:00 AM (Proposal Preparation)
            </div>
            <div className="font-mono text-[11px] text-ash">
              Moved Internal Sync to Thu 2:00 PM · Zero conflicts detected
            </div>
          </div>
          <div className="hidden items-center gap-2 font-mono text-[10px] text-ash sm:flex">
            <span>Auto-scheduled</span>
            <kbd className="rounded border border-[#363739] bg-graphite px-1.5 py-0.5 text-mist">
              ↵
            </kbd>
          </div>
        </div>

        <div
          className="flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-white/[0.02]"
          role="listitem"
        >
          <div
            className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-graphite text-mist"
            aria-hidden="true"
          >
            <MessageCircle size={14} />
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="text-[13px] leading-snug text-mist">
              <strong className="font-medium text-pure-white">WhatsApp:</strong>{" "}
              Dispatch follow-up brief to Rahul
            </div>
            <div className="font-mono text-[11px] text-ash">
              Scheduled Thursday 4:30 PM · Cross-channel notification
            </div>
          </div>
          <div className="hidden font-mono text-[10px] text-ash sm:block">
            <kbd className="rounded border border-[#363739] bg-graphite px-1.5 py-0.5 text-mist">
              ⌘1
            </kbd>
          </div>
        </div>

        <div
          className="flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-white/[0.02]"
          role="listitem"
        >
          <div
            className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-graphite text-mist"
            aria-hidden="true"
          >
            <Fingerprint size={14} />
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="text-[13px] leading-snug text-mist">
              <strong className="font-medium text-pure-white">
                Biometrics:
              </strong>{" "}
              Speaker verified (Rahul)
            </div>
            <div className="font-mono text-[11px] text-ash">
              ResNet-34 neural voice biometrics · 99.4% confidence match
            </div>
          </div>
          <div className="hidden font-mono text-[10px] text-ash sm:block">
            <kbd className="rounded border border-[#363739] bg-graphite px-1.5 py-0.5 text-mist">
              ⌘2
            </kbd>
          </div>
        </div>

        <div
          className="flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-white/[0.02]"
          role="listitem"
        >
          <div
            className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-graphite text-mist"
            aria-hidden="true"
          >
            <PhoneCall size={14} />
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="text-[13px] leading-snug text-mist">
              <strong className="font-medium text-pure-white">
                Outbound Call:
              </strong>{" "}
              Morning Review Briefing
            </div>
            <div className="font-mono text-[11px] text-ash">
              Queued for Tomorrow 8:30 AM · Jev System One arbitration
            </div>
          </div>
          <div className="hidden font-mono text-[10px] text-ash sm:block">
            <kbd className="rounded border border-[#363739] bg-graphite px-1.5 py-0.5 text-mist">
              ⌘3
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-[#232427] bg-obsidian/80 px-4 py-2.5 font-mono text-[10px] text-ash">
        <div className="inline-flex items-center gap-1.5">
          <kbd className="rounded border border-[#363739] bg-graphite px-1 py-0.5 text-mist">
            ↵
          </kbd>
          <span>Run Action</span>
        </div>
        <div className="inline-flex items-center gap-1.5">
          <kbd className="rounded border border-[#363739] bg-graphite px-1 py-0.5 text-mist">
            ⌘K
          </kbd>
          <span>Actions</span>
        </div>
        <div className="inline-flex items-center gap-1.5">
          <kbd className="rounded border border-[#363739] bg-graphite px-1 py-0.5 text-mist">
            ⌥↵
          </kbd>
          <span>Quick Call</span>
        </div>
        <div className="inline-flex items-center gap-1.5">
          <kbd className="rounded border border-[#363739] bg-graphite px-1 py-0.5 text-mist">
            Esc
          </kbd>
          <span>Hang Up</span>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative bg-void-black">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(100vh,920px)]"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,rgba(20,60,163,0.5)_0%,rgba(2,25,59,0.2)_35%,transparent_65%)]" />
        <div className="absolute -left-[20%] top-[8%] h-[42%] w-[85%] -rotate-[18deg] rounded-[100%] bg-[#ff6363]/[0.28] blur-[90px]" />
        <div className="absolute -right-[15%] top-[18%] h-[36%] w-[70%] rotate-[12deg] rounded-[100%] bg-[#ff6363]/[0.18] blur-[100px]" />
        <div className="absolute left-[10%] top-[22%] h-[28%] w-[55%] rotate-[-6deg] rounded-[100%] bg-[#63a1ff]/[0.12] blur-[80px]" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-void-black to-transparent" />
      </div>

      <div className="relative mx-auto flex max-w-[1200px] flex-col items-center px-6 pb-24 pt-36 text-center md:px-8 md:pb-32 md:pt-44">
        <div className="mb-8 inline-flex items-center gap-2 rounded-md bg-ember-hush px-2.5 py-1 text-[12px] font-medium text-coral-pulse">
          <span
            className="size-1.5 rounded-full bg-coral-pulse"
            aria-hidden="true"
          />
          The assistant you can call
        </div>

        <h1 className="max-w-[18ch] text-[clamp(2.5rem,6vw,3.5rem)] font-normal leading-[1.12] tracking-[0.22px] text-pure-white md:text-[56px] md:leading-[1.17]">
          Your chief of staff,
          <br />
          on speed dial.
        </h1>

        <p className="mt-6 max-w-[480px] text-base leading-relaxed text-ash">
          Call to untangle the day, put decisions into motion, and stay ahead
          without another app to manage.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <LinkButton href="/request-access">Request access</LinkButton>
          <LinkButton href="#follow-through" variant="secondary">
            See how Vox follows through
          </LinkButton>
        </div>

        <div
          className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-mono text-[12px] text-ash"
          aria-label="Core specifications"
        >
          <span>v1.104.21</span>
          <span className="text-smoke" aria-hidden="true">
            |
          </span>
          <span>PSTN Telephony &amp; WhatsApp</span>
          <span className="text-smoke" aria-hidden="true">
            |
          </span>
          <span>&lt; 180ms duplex</span>
          <span className="text-smoke" aria-hidden="true">
            |
          </span>
          <span>Autonomous follow-through</span>
        </div>

        <div className="mt-16 w-full max-w-[880px] md:mt-20">
          <HeroAppMockup />
        </div>
      </div>
    </section>
  );
}

export function Capabilities() {
  const items = [
    { icon: Phone, label: "Phone and WhatsApp" },
    { icon: MessageCircle, label: "Natural conversation" },
    { icon: Sparkles, label: "Proactive follow-through" },
    { icon: Fingerprint, label: "Speaker-aware privacy" },
  ];

  return (
    <div
      className="mx-auto flex max-w-[1200px] gap-3 overflow-x-auto px-6 pb-4 md:px-8"
      aria-label="Core capabilities"
      role="region"
      tabIndex={0}
    >
      {items.map(({ icon: Icon, label }) => (
        <span
          key={label}
          className="inline-flex shrink-0 items-center gap-2.5 rounded-full border border-border-edge bg-ink/80 px-4 py-2 text-sm text-mist shadow-subtle-3"
        >
          <span
            className="flex size-7 items-center justify-center rounded-full bg-graphite text-ash"
            aria-hidden="true"
          >
            <Icon size={15} />
          </span>
          {label}
        </span>
      ))}
    </div>
  );
}

export function FollowThroughSection() {
  return (
    <Section
      id="follow-through"
      title="A call becomes follow-through."
      description="Vox is built around the whole loop—from the first hello to the update that reaches you later."
    >
      <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {callPath.map(({ icon: Icon, step, title, description }) => (
          <li
            key={title}
            className="flex flex-col gap-3 rounded-2xl border border-border-edge bg-ink p-6 shadow-subtle-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div
                className="flex size-10 items-center justify-center rounded-md bg-graphite text-mist"
                aria-hidden="true"
              >
                <Icon size={16} />
              </div>
              <span className="font-mono text-xs text-smoke">Step {step}</span>
            </div>
            <h3 className="text-lg font-medium text-pure-white">{title}</h3>
            <p className="text-sm text-ash">{description}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

export function DemoSection() {
  return (
    <div className="border-y border-border-edge bg-ink/40">
      <Section
        id="possibilities"
        title="Talk naturally. Vox keeps the thread."
        description="A conversation can start with a messy thought and end with clear work, a durable record, and a follow-up already arranged."
      >
        <ConversationDemo />
      </Section>
    </div>
  );
}

export function FeatureSection() {
  return (
    <Section
      id="capabilities"
      title="What Vox can do today."
      description="Vox is faster in the moment, more useful after the call, and easier to trust."
    >
      <Grid columns={2}>
        {currentCapabilities.map(
          ({ icon: Icon, badge, title, description, visual }, index) => (
            <article
              key={title}
              className={cn(
                "flex flex-col rounded-2xl border border-border-edge bg-ink p-6 shadow-subtle-3",
                (index === 0 || index === currentCapabilities.length - 1) &&
                  "ring-1 ring-coral-pulse/15",
              )}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div
                  className="flex size-10 items-center justify-center rounded-md bg-graphite text-mist"
                  aria-hidden="true"
                >
                  <Icon size={18} />
                </div>
                <span className="font-mono text-[11px] text-smoke">
                  {badge}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <h3 className="text-lg font-medium text-pure-white">{title}</h3>
                <p className="text-sm text-ash">{description}</p>
              </div>
              {visual}
            </article>
          ),
        )}
      </Grid>
    </Section>
  );
}

export function StorySection() {
  return (
    <Section>
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="space-y-5">
          <Badge>After the goodbye</Badge>
          <h2 className="text-heading font-normal text-pure-white">
            The work continues after you hang up.
          </h2>
          <p>
            A useful assistant should not disappear when the conversation ends.
            Vox keeps commitments durable, watches what is due, and brings the
            next important update back to you.
          </p>
          <p>
            That can mean a reminder, a WhatsApp update, or a scheduled
            call—whichever way fits the moment.
          </p>
          <LinkButton href="#recently-shipped" variant="secondary">
            See what changed recently
          </LinkButton>
        </div>
        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-md rounded-2xl border border-border-edge bg-ink p-6 shadow-key-window">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <Badge tone="positive">Follow-up scheduled</Badge>
              <span className="font-mono text-xs text-smoke">
                Tomorrow · 8:30 AM
              </span>
            </div>
            <h3 className="mb-5 text-xl font-medium text-pure-white">
              Prepare the project review briefing.
            </h3>
            <div className="mb-2 flex items-center gap-2 text-sm text-ash">
              <Check size={16} aria-hidden="true" />
              Decision saved to the project
            </div>
            <div className="mb-2 flex items-center gap-2 text-sm text-ash">
              <Check size={16} aria-hidden="true" />
              Open items will be checked overnight
            </div>
            <div className="flex items-center gap-2 rounded-md border border-coral-pulse/30 bg-ember-hush/50 px-3 py-2 text-sm text-mist">
              <PhoneCall
                size={16}
                className="text-coral-pulse"
                aria-hidden="true"
              />
              Vox will call with the briefing
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

export function PrinciplesSection() {
  const principles = [
    [
      "Your voice helps protect your context",
      "Speaker recognition helps Vox notice when another person takes over and keep personal work attached to the right identity.",
    ],
    [
      "Consequential actions stay explicit",
      "Important work is designed around confirmation, scoped authority, and a durable record of what happened.",
    ],
    [
      "Status is a prompt to verify, not a promise",
      "Vox tracks durable updates and retrieves authoritative state instead of pretending a background action succeeded.",
    ],
  ] as const;

  return (
    <Section
      id="principles"
      title="Useful enough to act. Careful enough to trust."
    >
      <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,280px)_1fr]">
        <div
          className="relative flex items-center justify-center overflow-hidden rounded-2xl border border-border-edge bg-ink py-16 text-ash/30"
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,99,99,0.12)_0%,transparent_65%)]" />
          <Fingerprint size={120} strokeWidth={1} className="relative z-10" />
        </div>
        <div className="divide-y divide-border-edge">
          {principles.map(([title, body]) => (
            <article
              key={title}
              className="space-y-2 py-6 first:pt-0 last:pb-0"
            >
              <h3 className="text-lg font-medium text-pure-white">{title}</h3>
              <p className="text-sm text-ash">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}

export function LatestSection() {
  return (
    <Section
      id="recently-shipped"
      title="Built in public, release by release."
      description="Each version below is live. The full build history is in the changelog."
    >
      <div className="divide-y divide-border-edge rounded-2xl border border-border-edge bg-ink shadow-subtle-3">
        {latestReleases.map((release) => (
          <article
            key={release.id}
            className="flex flex-col gap-4 p-6 md:flex-row md:items-start md:justify-between"
          >
            <div className="flex shrink-0 flex-col gap-1 font-mono text-xs text-smoke md:w-36">
              <span className="text-mist">{release.version}</span>
              <time dateTime={release.date}>{release.formattedDate}</time>
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <h3 className="text-lg font-medium text-pure-white">
                {release.title}
              </h3>
              <p className="text-sm text-ash">{release.summary}</p>
            </div>
            <LinkButton href={`/changelog#${release.id}`} variant="ghost">
              Release notes
            </LinkButton>
          </article>
        ))}
      </div>
      <div className="mt-8">
        <LinkButton href="/changelog" variant="secondary">
          Read the latest releases
        </LinkButton>
      </div>
    </Section>
  );
}

export function ClosingSection() {
  return (
    <Section>
      <div className="rounded-2xl border border-border-edge bg-ink px-6 py-16 text-center shadow-subtle-3 md:px-12">
        <h2 className="mb-3 text-heading font-normal text-pure-white">
          Make one call. Leave with less to carry.
        </h2>
        <p className="mx-auto mb-8 max-w-lg text-ash">
          Vox turns conversation into continuity.
        </p>
        <Row className="justify-center">
          <LinkButton href="/request-access">Request access</LinkButton>
          <LinkButton href="/changelog" variant="secondary">
            Follow the build
          </LinkButton>
        </Row>
      </div>
    </Section>
  );
}
