import type { ReactNode } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  CheckCheck,
  Fingerprint,
  Monitor,
  Phone,
  PhoneCall,
  PhoneOff,
  Smartphone,
  BellRing,
  ShieldCheck,
  Globe,
  MessageCircle,
} from "lucide-react";
import { ACCESS_HREF } from "@/lib/site";
import { VoxLogo } from "@/components/ui/vox-logo";

const bars = Array.from({ length: 56 }, (_, i) =>
  Math.round(18 + Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.55)) * 82),
);

function Wave() {
  return (
    <div className="wave" aria-hidden="true">
      {bars.map((h, i) => (
        <i key={i} style={{ "--h": h, "--i": i } as React.CSSProperties} />
      ))}
    </div>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-[12px] uppercase tracking-[0.16em] text-fg-dim">
      {children}
    </span>
  );
}

export function Primary({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="btn-pill-primary group">
      <span>{children}</span>
      <span
        className="inline-block transition-transform group-hover:translate-x-0.5"
        aria-hidden="true"
      >
        ▸
      </span>
    </Link>
  );
}

const transcript = [
  ["you", "Tomorrow is packed. Protect two hours for the proposal and move anything that can wait."],
  ["vox", "The client review is fixed. I can move the internal sync to Thursday and hold 9 to 11."],
  ["you", "Do it. And chase the launch brief Friday."],
] as const;

const landed = [
  { icon: CalendarCheck, title: "Calendar updated", meta: "Proposal block · 9:00–11:00" },
  { icon: CheckCheck, title: "Task created", meta: "Launch brief · due Friday" },
  { icon: BellRing, title: "Follow-up scheduled", meta: "Thursday · 3:00 PM on WhatsApp" },
];

function Scene({
  index,
  tag,
  title,
  body,
  children,
}: {
  index: number;
  tag: string;
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <div className={`scene s${index}`}>
      <div>
        <span className="font-mono text-[12px] uppercase tracking-[0.16em] text-fg-dim">
          0{index + 1} · {tag}
        </span>
        <h2 className="mt-4 text-[clamp(3rem,8vw,7rem)] leading-[0.95] tracking-[-0.04em]">
          {title}
        </h2>
        <p className="mt-6 max-w-[460px] text-[17px] leading-[1.45]">{body}</p>
      </div>
      <div className="scene-visual">{children}</div>
    </div>
  );
}

export function CallChapter() {
  return (
    <section id="follow-through" className="bg-background">
      <div className="call-track">
        <div className="call-pin">
          <Scene
            index={0}
            tag="The call"
            title="You call."
            body="A real phone number. No app to open and nothing to learn. Known callers are greeted by name before the rest of the system has woken up."
          >
            <div className="glass text-center">
              <div className="caller-ring">
                <VoxLogo size={44} animated aria-hidden="true" />
              </div>
              <p className="font-serif text-[28px] tracking-[-0.02em] !text-fg">Vox</p>
              <p className="mt-1 text-[12px] uppercase tracking-[0.14em]">Connected</p>
              <div className="mt-4">
                <Wave />
              </div>
              <div className="mt-4 flex justify-center">
                <span className="grid size-14 place-items-center rounded-full bg-danger text-background">
                  <PhoneOff size={22} aria-hidden="true" />
                </span>
              </div>
            </div>
          </Scene>

          <Scene
            index={1}
            tag="The conversation"
            title="You talk."
            body="Pause, correct yourself, wander. Speech streams in and out, and Vox stops talking the moment you start."
          >
            <div className="glass">
              <p className="mb-4 text-[11px] uppercase tracking-[0.14em] !text-fg-dim">
                Illustrative conversation
              </p>
              <div className="stagger flex flex-col gap-3">
                {transcript.map(([who, line]) => (
                  <div key={line} className={`bubble ${who}`}>
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </Scene>

          <Scene
            index={2}
            tag="The follow-through"
            title="It lands."
            body="Decisions become calendar changes, tasks and reminders — each with a durable status, not a transcript you have to process later."
          >
            <div className="glass">
              <p className="mb-4 text-[11px] uppercase tracking-[0.14em] !text-fg-dim">
                Illustrative outcome
              </p>
              <div className="stagger flex flex-col gap-3">
                {landed.map(({ icon: Icon, title, meta }) => (
                  <div key={title} className="action-row">
                    <Icon size={20} aria-hidden="true" />
                    <div>
                      <b>{title}</b>
                      <span>{meta}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Scene>

          <Scene
            index={3}
            tag="The callback"
            title="It calls back."
            body="When a deadline arrives or a commitment changes, Vox reaches out to you. By phone, or on WhatsApp."
          >
            <div className="glass text-center">
              <p className="text-[11px] uppercase tracking-[0.14em] !text-fg-dim">
                Scheduled · Tomorrow 8:30 AM
              </p>
              <div className="caller-ring mt-6">
                <PhoneCall size={40} className="text-background" aria-hidden="true" />
              </div>
              <p className="font-serif text-[28px] tracking-[-0.02em] !text-fg">
                Vox is calling
              </p>
              <p className="mt-1 text-[13px]">Morning briefing · open launch items</p>
              <div className="mt-6 flex justify-center gap-10">
                <span className="grid size-14 place-items-center rounded-full bg-danger text-background">
                  <PhoneOff size={22} aria-hidden="true" />
                </span>
                <span className="grid size-14 place-items-center rounded-full bg-success text-background">
                  <Phone size={22} aria-hidden="true" />
                </span>
              </div>
            </div>
          </Scene>

          <div className="call-rail" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </div>
        </div>
      </div>
    </section>
  );
}

const useCases = [
  {
    title: "Protect your day.",
    say: "“Tomorrow is packed. Hold two hours for the proposal and move anything that can wait.”",
    body: "Vox shields focus time, shifts flexible meetings and tells you what moved.",
  },
  {
    title: "Delegate and let go.",
    say: "“There’s a lot on my mind this week.”",
    body: "It tracks the commitment, sets a deadline and sends the progress update on WhatsApp.",
  },
  {
    title: "Start tomorrow briefed.",
    say: "“Review the launch items overnight and call me before the 9 AM.”",
    body: "At 8:30 your phone rings with a short briefing, decisions first.",
  },
  {
    title: "Handle the errands.",
    say: "“Find somewhere good for dinner and check how long a cab takes.”",
    body: "With Google Calendar or PlayStation connected, Vox can read upcoming events and gaming activity when helping you. You control timeline synchronization and assistant reads.",
  },
];

export function UseCases() {
  return (
    <section id="use-cases" className="border-b border-line py-28 md:py-40">
      <div className="mx-auto max-w-[1432px] px-6 md:px-12">
        <div className="rv max-w-3xl">
          <Eyebrow>What people use it for</Eyebrow>
          <h2 className="mt-4 text-[clamp(2.5rem,6vw,5rem)] leading-[1] tracking-[-0.035em]">
            Say it once. It’s handled.
          </h2>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {useCases.map(({ title, say, body }, i) => (
            <article key={title} className="rv feature-card flex min-h-[320px] flex-col justify-between">
              <span className="font-mono text-[12px] text-fg-dim">0{i + 1}</span>
              <div>
                <p className="font-serif text-[20px] italic leading-[1.3] text-fg-muted">{say}</p>
                <h3 className="mt-6 text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.05] tracking-[-0.03em]">
                  {title}
                </h3>
                <p className="mt-3 max-w-[460px] text-[15px] leading-[1.45]">{body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Surfaces() {
  return (
    <section id="surfaces" className="border-b border-line py-28 md:py-40">
      <div className="mx-auto max-w-[1432px] px-6 md:px-12">
        <div className="rv max-w-3xl">
          <Eyebrow>Everywhere you are</Eyebrow>
          <h2 className="mt-4 text-[clamp(2.5rem,6vw,5rem)] leading-[1] tracking-[-0.035em]">
            One agent. Every surface.
          </h2>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-12">
          <article className="rv elevated-card lg:col-span-7">
            <div
              className="pointer-events-none absolute -right-24 -top-24 size-[420px] rounded-full bg-gradient-to-br from-coral/25 via-sky/50 to-mint/25 blur-[70px]"
              aria-hidden="true"
            />
            <div className="relative">
              <Monitor size={26} aria-hidden="true" />
              <h3 className="mt-8 text-[clamp(2rem,4vw,3rem)] leading-[1.05] tracking-[-0.03em]">
                Vox Desktop.
              </h3>
              <p className="mt-4 max-w-[520px] text-[16px] leading-[1.45] !text-inherit opacity-80">
                A native app for your computer. Home is a dark, stylized 3D city map that Vox itself can drive, alongside live voice, tasks, notes, schedules and reports on your own data.
              </p>
              <p className="mt-4 max-w-[520px] text-[14px] leading-[1.45] !text-inherit opacity-70">
                Optionally let a phone call control your Mac. It is off by default, every command
                needs a spoken confirmation, and each one is logged locally.
              </p>
            </div>
          </article>

          <article className="rv feature-card lg:col-span-5">
            <Smartphone size={26} aria-hidden="true" />
            <h3 className="mt-8 text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.05] tracking-[-0.03em]">
              Vox for Android.
            </h3>
            <p className="mt-4 text-[15px] leading-[1.45]">
              Take Vox with you. It captures SMS and location in the background, and Timeline, Pulse and Spaces look and work the same as on desktop.
            </p>
          </article>

          <article className="rv feature-card lg:col-span-5">
            <MessageCircle size={26} aria-hidden="true" />
            <h3 className="mt-8 text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.05] tracking-[-0.03em]">
              Phone &amp; WhatsApp.
            </h3>
            <p className="mt-4 text-[15px] leading-[1.45]">
              Dial in or send a message. It’s the same assistant either way, and it speaks the answer back on calls.
            </p>
          </article>

          <article className="rv feature-card lg:col-span-7">
            <Globe size={26} aria-hidden="true" />
            <h3 className="mt-8 text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.05] tracking-[-0.03em]">
              Vox Web.
            </h3>
            <p className="mt-4 max-w-[520px] text-[15px] leading-[1.45]">
              Request access, sign in, and review the reminders, proposals and connected apps Vox
              is working with.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

const providers = [
  ["Google Calendar", "Calendar events · read-only"],
  ["PlayStation", "Observed playtime · session times unknown"],
];

const guarantees = [
  ["Two uses, your choice.", "Linking asks for consent to timeline synchronization and assistant reads. You can pause either independently."],
  ["Handoffs are labelled.", "Where a provider can’t be driven end to end, Vox says it is handing off instead of pretending the work is done."],
  ["Consequential means approved.", "Actions that matter need an exact approval, and leave an audit record behind."],
];

export function Connections() {
  const pills = providers.map(([name, what]) => (
    <div className="marquee-pill" key={name}>
      <strong>{name}</strong>
      <span>{what}</span>
    </div>
  ));
  return (
    <section id="connections" className="py-28 md:py-40">
      <div className="mx-auto max-w-[1432px] px-6 md:px-12">
        <div className="rv max-w-3xl">
          <span className="font-mono text-[12px] uppercase tracking-[0.16em] text-fg-dim">
            Connected accounts
          </span>
          <h2 className="mt-4 text-[clamp(2.5rem,6vw,5rem)] leading-[1] tracking-[-0.035em]">
            Connected, never presumed.
          </h2>
          <p className="mt-5 text-[17px] leading-[1.45]">
            Link the accounts you already use. You decide what Vox can touch, and what it still has to ask you about.
          </p>
        </div>
      </div>

      <div className="marquee mt-16" aria-label="Supported connections">
        <div className="marquee-track">
          {pills}
          <div className="contents" aria-hidden="true">
            {pills}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-20 grid max-w-[1432px] gap-10 px-6 md:grid-cols-3 md:px-12">
        {guarantees.map(([title, body], i) => (
          <article key={title} className="rv border-t border-line pt-6">
            <span className="font-mono text-[12px] text-fg-dim">0{i + 1}</span>
            <h3 className="mt-3 text-[26px] leading-[1.15] tracking-[-0.02em]">{title}</h3>
            <p className="mt-3 text-[15px] leading-[1.45]">{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

const trust = [
  { icon: Fingerprint, title: "Your voice protects your context.", body: "Speaker recognition keeps personal work attached to the right person, even when a phone changes hands." },
  { icon: ShieldCheck, title: "Every action leaves a record.", body: "Consequential actions are confirmed, scoped and logged, so you can always see what happened." },
  { icon: CheckCheck, title: "Status is a prompt to verify.", body: "Vox queries authoritative state instead of assuming a background task succeeded." },
];

export function Trust() {
  return (
    <section id="principles" className="border-b border-line py-28 md:py-40">
      <div className="mx-auto max-w-[1432px] px-6 md:px-12">
        <h2 className="rv max-w-[18ch] text-[clamp(2.5rem,6.5vw,5.5rem)] leading-[1] tracking-[-0.04em]">
          Useful enough to act. Careful enough to trust.
        </h2>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {trust.map(({ icon: Icon, title, body }) => (
            <article key={title} className="rv feature-card">
              <Icon size={26} aria-hidden="true" />
              <h3 className="mt-10 text-[26px] leading-[1.15] tracking-[-0.02em]">{title}</h3>
              <p className="mt-4 text-[15px] leading-[1.45]">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Closing() {
  return (
    <section className="closing">
      <div className="closing-glow" aria-hidden="true" />
      <div className="closing-mark" aria-hidden="true">
        vox
      </div>
      <div className="relative z-10 flex flex-col items-center">
        <h2 className="max-w-[14ch] text-balance text-[clamp(3rem,9vw,8rem)] leading-[0.96] tracking-[-0.045em]">
          Make one call.
        </h2>
        <p className="mt-6 max-w-[520px] text-[18px] leading-[1.4]">
          Leave with less to carry. Vox is reachable today by phone call and WhatsApp.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Primary href={ACCESS_HREF}>Request access</Primary>
          <Link href="#follow-through" className="btn-pill-ghost">
            Replay the call
          </Link>
        </div>
      </div>
    </section>
  );
}
