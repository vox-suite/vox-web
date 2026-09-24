import type { ReactNode } from "react";
import {
  ArrowRight,
  AudioLines,
  CalendarCheck,
  Check,
  CheckCheck,
  ListChecks,
  Phone,
  PhoneCall,
} from "lucide-react";
import Link from "next/link";
import { CHANGELOG_DATA } from "@/components/changelog/changelog-data";
import { cn } from "@/lib/utils";
import { ConversationDemo } from "./demo";
import { CrimsonKey } from "./shell";

const callPath = [
  {
    icon: Phone,
    title: "Call from wherever you are",
    description:
      "Use the phone already in your hand. Known callers get a personal opening without waiting for the rest of the system to wake up.",
  },
  {
    icon: AudioLines,
    title: "Speak without learning commands",
    description:
      "Pause, correct yourself, or interrupt. Vox keeps the conversation moving and works out what needs attention.",
  },
  {
    icon: CheckCheck,
    title: "Leave with the work in motion",
    description:
      "Decisions become durable tasks, calendar changes, notes, reminders, and scheduled follow-ups—not a transcript you must process later.",
  },
  {
    icon: PhoneCall,
    title: "Hear back when it matters",
    description:
      "Vox tracks progress across time and reaches out again when a commitment changes, a deadline arrives, or you asked for a follow-up.",
  },
];

const capabilities = [
  {
    group: "During the call",
    items: [
      [
        "A call that feels interruptible",
        "Fast openings and streaming speech keep the conversation responsive when you jump in.",
      ],
      [
        "Recognizes who is speaking",
        "Voice biometrics keep personal context with the right speaker, even when someone else takes the phone.",
      ],
      [
        "Context that survives the call",
        "Projects, preferences, tasks, and prior decisions carry across phone and WhatsApp.",
      ],
    ],
  },
  {
    group: "After the call",
    items: [
      [
        "Work that keeps moving",
        "Tasks, calendar plans, reminders, and scheduled work, created through ordinary conversation.",
      ],
      [
        "Calls back when it matters",
        "Follow-ups and outbound calls bring urgent updates to you instead of waiting behind a dashboard.",
      ],
      [
        "A trail for important actions",
        "Durable status updates and structured audit evidence make consequential work easy to inspect.",
      ],
    ],
  },
] as const;

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
        "mx-auto w-full max-w-[1200px] scroll-mt-24 px-6 md:px-10",
        className,
      )}
    >
      {children}
    </section>
  );
}

function Heading({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <header className={cn("max-w-[34rem] space-y-4", className)}>
      <h2 className="font-display text-[clamp(2rem,4.2vw,3rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-pure-white text-balance">
        {title}
      </h2>
      {description ? (
        <p className="text-[17px] leading-relaxed text-ash">{description}</p>
      ) : null}
    </header>
  );
}

function TranscriptLine({
  who,
  children,
  delay,
}: {
  who: "you" | "vox";
  children: ReactNode;
  delay: number;
}) {
  return (
    <div
      className={cn("rise flex", who === "you" ? "justify-end" : "justify-start")}
      style={{ animationDelay: `${delay}ms` }}
    >
      <p
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-snug",
          who === "you"
            ? "rounded-br-md bg-[#1f1f23] text-mist"
            : "rounded-bl-md bg-[#16161a] text-ash",
        )}
      >
        {children}
      </p>
    </div>
  );
}

function CallPhone() {
  const queued = [
    { icon: CalendarCheck, label: "Thu 9:00 – 11:00 held for the proposal" },
    { icon: ListChecks, label: "Internal sync moved to Thursday 2 PM" },
    { icon: PhoneCall, label: "Vox calls you tomorrow at 8:30 AM" },
  ];

  return (
    <figure className="relative mx-auto w-full max-w-[340px]">
      <div className="machined-frame rounded-[50px] p-[3px]">
        <div className="rounded-[47px] bg-[#050506] p-[7px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.8)]">
        <div className="relative overflow-hidden rounded-[40px] bg-[#070708] px-5 pb-6 pt-4">
          <div className="flex items-center justify-between px-2 text-[12px] font-medium text-mist">
            <span className="tabular-nums">9:41</span>
            <span
              className="h-[22px] w-[84px] rounded-full bg-black"
              aria-hidden="true"
            />
            <span className="font-mono tabular-nums text-ash">02:14</span>
          </div>

          <div className="mt-6 flex flex-col items-center text-center">
            <div className="relative size-16" aria-hidden="true">
              <span className="absolute inset-0 animate-[ring-out_2.4s_cubic-bezier(0.16,1,0.3,1)_infinite] rounded-full bg-crimson/40" />
              <span className="anodised relative flex size-16 items-center justify-center rounded-full text-white">
                <Phone size={22} strokeWidth={1.75} />
              </span>
            </div>
            <p className="mt-3 font-display text-xl font-semibold tracking-[-0.02em] text-pure-white">
              Vox
            </p>
            <p className="text-[13px] text-ash">On a call with you</p>
          </div>

          <div className="mt-6 space-y-2">
            <TranscriptLine who="you" delay={200}>
              Tomorrow is packed. Protect two hours for the proposal.
            </TranscriptLine>
            <TranscriptLine who="vox" delay={700}>
              The client review is fixed. I’ll move the internal sync to
              Thursday and hold 9 to 11.
            </TranscriptLine>
            <TranscriptLine who="you" delay={1200}>
              Perfect. Call me before the review.
            </TranscriptLine>
          </div>

          <div
            className="rise mt-5 rounded-2xl bg-[#111114] p-3"
            style={{ animationDelay: "1700ms" }}
          >
            <p className="flex items-center justify-between px-1 text-[12px] font-medium text-mist">
              Call ended
              <span className="text-ash">3 actions queued</span>
            </p>
            <ul className="mt-2 space-y-1">
              {queued.map(({ icon: Icon, label }, i) => (
                <li
                  key={label}
                  className="flex items-center gap-2.5 rounded-lg px-1 py-1.5 text-[13px] text-ash"
                >
                  <Icon
                    size={15}
                    className={cn(
                      "shrink-0",
                      i === queued.length - 1 ? "text-crimson-hi" : "text-mist",
                    )}
                    aria-hidden="true"
                  />
                  <span className={i === queued.length - 1 ? "text-mist" : ""}>
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        </div>
      </div>
      <figcaption className="mt-4 text-center text-[13px] text-smoke">
        Illustrative call. No live call is taking place.
      </figcaption>
    </figure>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-x-clip">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_45%_at_72%_48%,rgba(215,55,63,0.16)_0%,rgba(142,28,34,0.06)_45%,transparent_75%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto grid max-w-[1200px] items-center gap-16 px-6 pb-24 pt-32 md:px-10 md:pt-40 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-10 lg:pb-32">
        <div className="max-w-[36rem]">
          <h1 className="font-display text-[clamp(2.75rem,7vw,5rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-pure-white">
            Your chief of staff, on speed dial.
          </h1>
          <p className="mt-6 max-w-[30rem] text-lg leading-relaxed text-ash">
            Call to untangle the day, put decisions into motion, and stay
            ahead, without another app to manage. Vox keeps the work moving
            after you hang up.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
            <CrimsonKey href="/request-access">Request access</CrimsonKey>
            <Link
              href="#how-it-works"
              className="group inline-flex h-12 items-center gap-2 text-[15px] text-mist hover:text-pure-white"
            >
              See how it works
              <ArrowRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
          <p className="mt-10 text-sm text-smoke">
            Works over a phone call or WhatsApp. No app to install.
          </p>
        </div>
        <CallPhone />
      </div>
    </section>
  );
}

export function FollowThroughSection() {
  return (
    <Block id="how-it-works" className="py-24 md:py-32">
      <Heading
        title="A call becomes follow-through."
        description="Vox is built around the whole loop, from the first hello to the update that reaches you later."
      />
      <ol className="relative mt-16 grid gap-10 md:grid-cols-4 md:gap-8">
        <span
          className="absolute left-[19px] top-5 h-[calc(100%-40px)] w-px bg-gradient-to-b from-white/10 via-white/10 to-crimson/60 md:left-5 md:right-5 md:top-5 md:h-px md:w-auto md:bg-gradient-to-r"
          aria-hidden="true"
        />
        {callPath.map(({ icon: Icon, title, description }, i) => {
          const last = i === callPath.length - 1;
          return (
            <li
              key={title}
              className="relative grid grid-cols-[40px_1fr] gap-x-5 md:block"
            >
              <span
                className={cn(
                  "relative flex size-10 items-center justify-center rounded-full",
                  last ? "anodised text-white" : "key-graphite text-mist",
                )}
                aria-hidden="true"
              >
                <Icon size={17} strokeWidth={1.75} />
              </span>
              <div className="md:mt-6">
                <h3 className="text-[17px] font-medium tracking-[-0.01em] text-pure-white">
                  {title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ash">
                  {description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </Block>
  );
}

export function DemoSection() {
  return (
    <Block id="demo" className="py-16 md:py-24">
      <Heading
        title="Talk naturally. Vox keeps the thread."
        description="A conversation can start with a messy thought and end with clear work, a durable record, and a follow-up already arranged."
      />
      <div className="mt-12">
        <ConversationDemo />
      </div>
    </Block>
  );
}

export function FeatureSection() {
  return (
    <Block id="capabilities" className="py-24 md:py-32">
      <div className="grid gap-14 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
        <Heading
          title="What Vox can do today."
          description="Faster in the moment, more useful after the call, and easier to trust."
          className="lg:sticky lg:top-32 lg:self-start"
        />
        <div className="grid gap-12 sm:grid-cols-2 sm:gap-10">
          {capabilities.map(({ group, items }) => (
            <div key={group}>
              <h3 className="font-display text-[22px] font-semibold tracking-[-0.02em] text-pure-white">
                {group}
              </h3>
              <dl className="mt-6 space-y-7">
                {items.map(([title, description]) => (
                  <div key={title}>
                    <dt className="text-[17px] font-medium tracking-[-0.01em] text-mist">
                      {title}
                    </dt>
                    <dd className="mt-1.5 text-[15px] leading-relaxed text-ash">
                      {description}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </div>
    </Block>
  );
}

export function StorySection() {
  return (
    <Block className="py-16 md:py-24">
      <div className="plate grid items-center gap-12 overflow-hidden rounded-[28px] p-8 md:p-14 lg:grid-cols-2 lg:gap-16">
        <div>
          <Heading title="The work continues after you hang up." />
          <p className="mt-5 max-w-[32rem] text-[17px] leading-relaxed text-ash">
            Vox keeps commitments durable, watches what is due, and brings the
            next important update back to you, as a reminder, a WhatsApp
            message, or a scheduled call.
          </p>
          <Link
            href="#recently-shipped"
            className="group mt-8 inline-flex items-center gap-2 text-[15px] text-mist hover:text-pure-white"
          >
            See what changed recently
            <ArrowRight
              size={16}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>

        <div className="relative mx-auto w-full max-w-[380px]">
          <div
            className="pointer-events-none absolute -inset-10 bg-[radial-gradient(closest-side,rgba(215,55,63,0.14),transparent)]"
            aria-hidden="true"
          />
          <div className="relative rounded-3xl bg-[#08080a] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_24px_48px_-24px_rgba(0,0,0,0.9)]">
            <p className="text-[13px] text-ash">
              Tomorrow · <span className="tabular-nums">8:30 AM</span>
            </p>
            <p className="mt-1 font-display text-2xl font-semibold tracking-[-0.02em] text-pure-white">
              Vox is calling
            </p>
            <p className="mt-1 text-[15px] text-ash">
              Project review briefing
            </p>
            <ul className="mt-6 space-y-2.5 text-[15px] text-mist">
              <li className="flex items-center gap-2.5">
                <Check size={16} className="text-ash" aria-hidden="true" />
                Decision saved to the project
              </li>
              <li className="flex items-center gap-2.5">
                <Check size={16} className="text-ash" aria-hidden="true" />
                Open items checked overnight
              </li>
            </ul>
            <div className="mt-8 flex items-center gap-3" aria-hidden="true">
              <span className="anodised flex size-12 items-center justify-center rounded-full text-white">
                <Phone size={19} strokeWidth={1.75} />
              </span>
              <span className="text-[13px] text-smoke">Illustrative</span>
            </div>
          </div>
        </div>
      </div>
    </Block>
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
    <Block id="principles" className="py-24 md:py-32">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
        <Heading title="Useful enough to act. Careful enough to trust." />
        <div className="divide-y divide-white/[0.06]">
          {principles.map(([title, body]) => (
            <article key={title} className="py-7 first:pt-0 last:pb-0">
              <h3 className="text-[19px] font-medium tracking-[-0.01em] text-pure-white">
                {title}
              </h3>
              <p className="mt-2 max-w-[36rem] text-[15px] leading-relaxed text-ash">
                {body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </Block>
  );
}

export function LatestSection() {
  return (
    <Block id="recently-shipped" className="py-16 md:py-24">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <Heading
          title="Built in public, release by release."
          description="Each version below is live. Full notes for every release are in the changelog."
        />
        <Link
          href="/changelog"
          className="key-graphite inline-flex h-11 items-center gap-2 rounded-xl px-5 text-[15px]"
        >
          Read the latest releases
        </Link>
      </div>
      <div className="mt-12 divide-y divide-white/[0.06]">
        {latestReleases.map((release) => (
          <article
            key={release.id}
            className="grid gap-3 py-8 md:grid-cols-[160px_minmax(0,1fr)_auto] md:gap-10"
          >
            <div className="flex gap-3 font-mono text-[13px] text-smoke md:flex-col md:gap-1">
              <span className="text-mist">{release.version}</span>
              <time dateTime={release.date}>{release.formattedDate}</time>
            </div>
            <div className="min-w-0">
              <h3 className="text-[17px] font-medium tracking-[-0.01em] text-pure-white">
                {release.title}
              </h3>
            </div>
            <Link
              href={`/changelog#${release.id}`}
              className="inline-flex h-10 items-center gap-1.5 self-start text-sm text-ash hover:text-pure-white"
            >
              Release notes
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </article>
        ))}
      </div>
    </Block>
  );
}

export function ClosingSection() {
  return (
    <section className="relative overflow-x-clip">
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-full bg-[radial-gradient(50%_60%_at_50%_100%,rgba(215,55,63,0.18),transparent_70%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto flex max-w-[1200px] flex-col items-center px-6 pb-32 pt-24 text-center md:px-10 md:pb-40 md:pt-32">
        <h2 className="max-w-[16ch] font-display text-[clamp(2.25rem,5.5vw,4rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-pure-white text-balance">
          Make one call. Leave with less to carry.
        </h2>
        <p className="mt-5 text-lg text-ash">
          Vox turns conversation into continuity.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
          <CrimsonKey href="/request-access">Request access</CrimsonKey>
          <Link
            href="/changelog"
            className="inline-flex h-12 items-center text-[15px] text-mist hover:text-pure-white"
          >
            Follow the build
          </Link>
        </div>
      </div>
    </section>
  );
}
