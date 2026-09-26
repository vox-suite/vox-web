import Image from "next/image";
import type { ComponentType, ReactNode } from "react";
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
import Link from "next/link";
import { CHANGELOG_DATA } from "@/components/changelog/changelog-data";
import { cn } from "@/lib/utils";
import { ConversationDemo } from "./demo";
import { CornerTicks } from "./blueprint-frame";

const latestReleases = CHANGELOG_DATA.slice(0, 3);

function Block({
  id,
  children,
  className,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "relative mx-auto w-full max-w-[1200px] scroll-mt-24 px-6 md:px-10",
        className,
      )}
    >
      {children}
    </section>
  );
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-12 max-w-2xl space-y-3">
      <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold tracking-[-0.025em] text-pure-white">
        {title}
      </h2>
      {description ? (
        <p className="text-[16px] leading-relaxed text-ash">{description}</p>
      ) : null}
    </header>
  );
}

// ---------------------------------------------------------------------------
// 1. HERO
// ---------------------------------------------------------------------------

export function Hero() {
  return (
    <section className="relative overflow-x-clip border-b border-[#232427] pt-24 pb-0 text-center md:pt-32">
      <div
        className="bp-dot-grid pointer-events-none absolute inset-0"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_40%_at_50%_20%,rgba(255,99,99,0.08)_0%,rgba(4,5,6,0)_70%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex max-w-[1200px] flex-col items-center px-6 md:px-10">
        <CornerTicks />

        <div className="inline-flex items-center gap-2.5 rounded-md border border-[#2f3031] bg-[#07080a] px-2.5 py-1 shadow-sm">
          <span className="rounded bg-mist px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-iron">
            VOX
          </span>
          <span className="font-mono text-[11px] uppercase tracking-widest text-smoke">
            The assistant you can call
          </span>
        </div>

        <h1 className="mt-6 max-w-[820px] text-balance font-display text-[clamp(2.75rem,6vw,4.75rem)] font-semibold leading-[1.03] tracking-[-0.035em] text-pure-white">
          Your chief of staff, <span className="text-ash">on speed dial.</span>
        </h1>

        <p className="mt-5 max-w-[600px] text-balance text-[17px] leading-relaxed text-ash md:text-[18px]">
          Call to untangle the day, put decisions into motion, and stay ahead
          without another app to manage.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/request-access"
            className="btn-primary-mist inline-flex h-11 items-center justify-center px-6 text-[14px] font-medium"
          >
            Request access
          </Link>
          <Link
            href="#follow-through"
            className="btn-secondary-obsidian inline-flex h-11 items-center justify-center px-6 text-[14px] font-medium"
          >
            See how Vox follows through
          </Link>
        </div>

        {/* Proof line */}
        <div
          className="mt-8 inline-flex flex-wrap items-center justify-center gap-1 rounded-md border border-[#2f3031] bg-[#07080a] px-2 py-1.5"
          aria-label="Available Vox capabilities"
        >
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium text-ash">
            <Phone size={13} className="text-coral-pulse" aria-hidden="true" />
            Natural phone calls
          </span>
          <span className="h-3.5 w-px bg-[#2f3031]" aria-hidden="true" />
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium text-ash">
            <Sparkles
              size={13}
              className="text-success-green"
              aria-hidden="true"
            />
            Continuous memory
          </span>
          <span className="h-3.5 w-px bg-[#2f3031]" aria-hidden="true" />
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium text-ash">
            <CalendarCheck
              size={13}
              className="text-electric-sky"
              aria-hidden="true"
            />
            Proactive follow-up
          </span>
        </div>

        {/* Dithered halftone signal ring */}
        <div className="relative mt-6 w-full max-w-[960px]">
          <Image
            src="/artwork/signal-ring.svg"
            alt=""
            width={1160}
            height={436}
            priority
            className="w-full"
            sizes="(max-width: 720px) 100vw, 960px"
          />
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 2. CAPABILITIES PROOF LINE
// ---------------------------------------------------------------------------

export function CapabilitiesStrip() {
  const items: Array<{
    icon: ComponentType<{ size?: number; className?: string }>;
    label: string;
    tone: string;
  }> = [
    { icon: Phone, label: "Phone and WhatsApp", tone: "text-coral-pulse" },
    {
      icon: MessageCircle,
      label: "Natural conversation",
      tone: "text-electric-sky",
    },
    {
      icon: Sparkles,
      label: "Proactive follow-through",
      tone: "text-success-green",
    },
    {
      icon: Fingerprint,
      label: "Speaker-aware privacy",
      tone: "text-mist",
    },
  ];

  return (
    <div className="border-b border-[#232427] bg-[#040506]">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-around gap-x-8 gap-y-4 px-6 py-7 md:px-10">
        {items.map(({ icon: Icon, label, tone }) => (
          <span
            key={label}
            className="inline-flex items-center gap-2.5 rounded px-2 py-1 text-[14px] font-semibold text-pure-white transition-colors duration-200"
          >
            <Icon size={17} className={tone} aria-hidden="true" />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. FOLLOW-THROUGH — THE CALL PATH
// ---------------------------------------------------------------------------

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
      "Decisions become durable tasks, calendar changes, notes, reminders, and scheduled follow-ups — not a transcript you must process later.",
  },
  {
    icon: PhoneCall,
    step: "04",
    title: "Hear back when it matters",
    description:
      "Vox can track progress across time and reach out again when a commitment changes, a deadline arrives, or you asked for a follow-up.",
  },
];

export function FollowThroughSection() {
  return (
    <section
      id="follow-through"
      className="relative border-b border-[#232427] py-20 md:py-28"
    >
      <div className="relative mx-auto max-w-[1200px] px-6 md:px-10">
        <CornerTicks />
        <SectionHeading
          title="A call becomes follow-through."
          description="Vox is built around the whole loop — from the first hello to the update that reaches you later."
        />

        <ol className="grid border border-[#232427] sm:grid-cols-2 lg:grid-cols-4">
          {callPath.map(({ icon: Icon, step, title, description }, idx) => (
            <li
              key={title}
              className={cn(
                "relative flex flex-col gap-4 bg-[#07080a] p-7",
                idx !== 0 &&
                  "border-t border-[#232427] sm:border-t-0 sm:border-l",
                idx === 2 && "border-t sm:border-t-0",
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-full border border-[#2f3031] bg-[#111214] text-mist">
                  <Icon size={17} aria-hidden="true" />
                </div>
                <span className="font-mono text-[11px] tracking-widest text-smoke">
                  STEP {step}
                </span>
              </div>
              <div>
                <h3 className="text-[16px] font-semibold leading-snug tracking-[-0.01em] text-pure-white">
                  {title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ash">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 4. WHAT VOX CAN DO TODAY
// ---------------------------------------------------------------------------

const currentCapabilities = [
  {
    icon: Radio,
    badge: "Low-latency duplex",
    title: "A call that feels interruptible",
    description:
      "Fast openings, streaming speech, and local voice activity detection keep the conversation responsive when you jump in.",
    preview: (
      <div className="flex items-center gap-3 border-t border-[#232427] px-6 py-4">
        <div className="flex h-4 items-end gap-[3px]" aria-hidden="true">
          {[6, 12, 16, 10, 14].map((h, i) => (
            <span
              key={i}
              className="w-[3px] rounded-full bg-coral-pulse"
              style={{ height: `${h}px` }}
            />
          ))}
        </div>
        <span className="text-[12px] text-ash">
          Live barge-in · streaming VAD
        </span>
        <span className="ml-auto rounded bg-obsidian px-2 py-0.5 font-mono text-[10px] text-success-green">
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
    preview: (
      <div className="flex items-center gap-2 border-t border-[#232427] px-6 py-4 text-[12px] text-ash">
        <Phone size={12} aria-hidden="true" /> Call ended
        <ArrowRight size={11} className="text-smoke" aria-hidden="true" />
        <MessageCircle size={12} aria-hidden="true" /> WhatsApp sync
      </div>
    ),
  },
  {
    icon: CalendarCheck,
    badge: "Auto calendar",
    title: "Work that keeps moving",
    description:
      "Create and update tasks, calendar plans, personal records, reminders, and scheduled work through ordinary conversation.",
    preview: (
      <div className="flex items-center gap-3 border-t border-[#232427] px-6 py-4">
        <Check size={13} className="text-success-green" aria-hidden="true" />
        <span className="text-[12px] text-ash">
          Thu 9:00 AM · Proposal block
        </span>
        <span className="ml-auto rounded bg-obsidian px-2 py-0.5 font-mono text-[10px] text-success-green">
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
    preview: (
      <div className="flex items-center gap-3 border-t border-[#232427] px-6 py-4">
        <PhoneCall size={13} className="text-electric-sky" aria-hidden="true" />
        <span className="text-[12px] text-ash">
          Briefing call · tomorrow 8:30 AM
        </span>
        <span className="ml-auto rounded bg-obsidian px-2 py-0.5 font-mono text-[10px] text-electric-sky">
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
    preview: (
      <div className="flex items-center gap-3 border-t border-[#232427] px-6 py-4">
        <Fingerprint size={13} className="text-mist" aria-hidden="true" />
        <span className="text-[12px] text-ash">Speaker match: Rahul</span>
        <span className="ml-auto rounded bg-obsidian px-2 py-0.5 font-mono text-[10px] text-electric-sky">
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
    preview: (
      <div className="flex items-center gap-3 border-t border-[#232427] px-6 py-4">
        <ShieldCheck size={13} className="text-smoke" aria-hidden="true" />
        <span className="text-[12px] text-ash">
          Event logged · signed &amp; durable
        </span>
        <span className="ml-auto rounded bg-obsidian px-2 py-0.5 font-mono text-[10px] text-smoke">
          Logged
        </span>
      </div>
    ),
  },
];

export function FeatureSection() {
  return (
    <section
      id="capabilities"
      className="relative border-b border-[#232427] py-20 md:py-28"
    >
      <div className="relative mx-auto max-w-[1200px] px-6 md:px-10">
        <CornerTicks />
        <SectionHeading
          title="What Vox can do today."
          description="Vox is faster in the moment, more useful after the call, and easier to trust."
        />

        <div className="grid border border-[#232427] md:grid-cols-2">
          {currentCapabilities.map(
            ({ icon: Icon, badge, title, description, preview }, idx) => (
              <article
                key={title}
                className={cn(
                  "flex flex-col bg-[#07080a] transition-colors duration-200 hover:bg-[#0a0b0d]",
                  idx !== 0 && "border-t border-[#232427]",
                  idx % 2 === 1 && "md:border-l",
                )}
              >
                <div className="flex items-center justify-between px-6 pt-6">
                  <div className="flex size-9 items-center justify-center rounded-lg border border-[#2f3031] bg-[#111214] text-mist">
                    <Icon size={16} aria-hidden="true" />
                  </div>
                  <span className="rounded border border-[#2f3031] bg-[#111214] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-smoke">
                    {badge}
                  </span>
                </div>
                <div className="px-6 pb-6 pt-4">
                  <h3 className="text-[17px] font-semibold leading-snug tracking-[-0.01em] text-pure-white">
                    {title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-ash">
                    {description}
                  </p>
                </div>
                {preview}
              </article>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 5. LIVE CONVERSATION DEMO
// ---------------------------------------------------------------------------

export function DemoSection() {
  return (
    <Block id="demo" className="border-b border-[#232427] py-20 md:py-28">
      <SectionHeading
        title="Talk naturally. Vox keeps the thread."
        description="A conversation can start with a messy thought and end with clear work, a durable record, and a follow-up already arranged."
      />
      <ConversationDemo />
    </Block>
  );
}

// ---------------------------------------------------------------------------
// 6. STORY — AFTER THE GOODBYE
// ---------------------------------------------------------------------------

export function StorySection() {
  return (
    <Block className="border-b border-[#232427] py-20 md:py-28">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <span className="inline-flex items-center gap-2 rounded border border-[#2f3031] bg-[#07080a] px-2.5 py-1 font-mono text-[11px] uppercase tracking-widest text-ash">
            <span className="size-1.5 rounded-sm bg-success-green" />
            After the goodbye
          </span>
          <h2 className="mt-4 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold tracking-[-0.025em] text-pure-white">
            The work continues after you hang up.
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-ash">
            A useful assistant should not disappear when the conversation ends.
            Vox keeps commitments durable, watches what is due, and brings the
            next important update back to you.
          </p>
          <p className="mt-3 text-[16px] leading-relaxed text-ash">
            That can mean a reminder, a WhatsApp update, or a scheduled call —
            whichever way fits the moment.
          </p>
          <Link
            href="#recently-shipped"
            className="btn-secondary-obsidian mt-6 inline-flex h-10 items-center px-4 text-[13px] font-medium"
          >
            See what changed recently
          </Link>
        </div>

        <div className="rounded-2xl border border-[#232427] bg-[#07080a] p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#232427] pb-4">
            <span className="inline-flex items-center gap-2 rounded bg-obsidian px-2 py-1 font-mono text-[11px] uppercase tracking-wider text-success-green">
              Follow-up scheduled
            </span>
            <span className="text-[12px] text-smoke">Tomorrow · 8:30 AM</span>
          </div>
          <h3 className="mt-4 text-[17px] font-semibold leading-snug text-pure-white">
            Prepare the project review briefing.
          </h3>
          <div className="mt-5 space-y-3">
            <div className="flex items-center gap-2.5 text-[13px] text-ash">
              <Check
                size={15}
                className="text-success-green"
                aria-hidden="true"
              />
              Decision saved to the project
            </div>
            <div className="flex items-center gap-2.5 text-[13px] text-ash">
              <Check
                size={15}
                className="text-success-green"
                aria-hidden="true"
              />
              Open items will be checked overnight
            </div>
            <div className="flex items-center gap-2.5 rounded-lg border border-[#2f3031] bg-[#111214] px-3 py-2.5 text-[13px] font-medium text-pure-white">
              <PhoneCall
                size={15}
                className="text-coral-pulse"
                aria-hidden="true"
              />
              Vox will call with the briefing
            </div>
          </div>
        </div>
      </div>
    </Block>
  );
}

// ---------------------------------------------------------------------------
// 7. PRINCIPLES
// ---------------------------------------------------------------------------

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
];

export function PrinciplesSection() {
  return (
    <section
      id="principles"
      className="relative border-b border-[#232427] py-20 md:py-28"
    >
      <div className="relative mx-auto max-w-[1200px] px-6 md:px-10">
        <CornerTicks />
        <SectionHeading title="Useful enough to act. Careful enough to trust." />

        <div className="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-16">
          <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-[#232427] bg-[#07080a]">
            <Fingerprint
              size={72}
              className="text-mist/30"
              aria-hidden="true"
            />
          </div>
          <div className="grid gap-8 sm:grid-cols-3 lg:gap-6">
            {principles.map(([title, body], index) => (
              <article key={title} className="border-t border-[#232427] pt-5">
                <span className="font-mono text-[11px] text-smoke">
                  0{index + 1}
                </span>
                <h3 className="mt-2 text-[15px] font-semibold leading-snug text-pure-white">
                  {title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-ash">
                  {body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 8. RELEASES & CHANGELOG
// ---------------------------------------------------------------------------

export function LatestSection() {
  return (
    <Block
      id="recently-shipped"
      className="border-b border-[#232427] py-20 md:py-28"
    >
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading
          title="Built in public, release by release."
          description="Each version below is live. The full build history is in the changelog."
        />
      </div>

      <div className="divide-y divide-[#232427] border-y border-[#232427]">
        {latestReleases.map((release) => (
          <article
            key={release.id}
            className="grid gap-3 py-6 md:grid-cols-[140px_minmax(0,1fr)_auto] md:gap-10"
          >
            <div className="flex gap-3 font-mono text-[12px] text-smoke md:flex-col md:gap-0.5">
              <span className="font-semibold text-mist">{release.version}</span>
              <time dateTime={release.date}>{release.formattedDate}</time>
            </div>
            <div className="min-w-0">
              <h3 className="text-[16px] font-medium tracking-[-0.01em] text-pure-white">
                {release.title}
              </h3>
            </div>
            <Link
              href={`/changelog#${release.id}`}
              className="inline-flex h-8 items-center gap-1.5 self-start text-[13px] text-ash transition-colors hover:text-pure-white"
            >
              Release notes
              <ArrowRight size={13} aria-hidden="true" />
            </Link>
          </article>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href="/changelog"
          className="btn-secondary-obsidian inline-flex h-10 items-center px-4 text-[13px] font-medium"
        >
          Read the latest releases
        </Link>
      </div>
    </Block>
  );
}

// ---------------------------------------------------------------------------
// 9. CLOSING
// ---------------------------------------------------------------------------

export function ClosingSection() {
  return (
    <section className="relative overflow-x-clip py-24 md:py-32">
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-full bg-[radial-gradient(50%_60%_at_50%_100%,rgba(255,99,99,0.06),transparent_70%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto flex max-w-[1200px] flex-col items-center px-6 text-center md:px-10">
        <h2 className="max-w-[20ch] text-balance font-display text-[clamp(2.25rem,5vw,3.75rem)] font-semibold leading-[1.05] tracking-[-0.035em] text-pure-white">
          Make one call. Leave with less to carry.
        </h2>
        <p className="mt-5 text-[17px] text-ash">
          Vox turns conversation into continuity.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/request-access"
            className="btn-primary-mist inline-flex h-11 items-center justify-center px-6 text-[14px] font-medium"
          >
            Request access
          </Link>
          <Link
            href="/changelog"
            className="btn-secondary-obsidian inline-flex h-11 items-center justify-center px-6 text-[14px] font-medium"
          >
            Follow the build
          </Link>
        </div>
      </div>
    </section>
  );
}
