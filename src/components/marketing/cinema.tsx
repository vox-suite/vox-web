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
import { VoxLogo } from "@/components/ui/vox-logo";
import { HeroCanvas } from "./hero-canvas";

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
    <span className="font-mono text-[12px] uppercase tracking-[0.16em] text-muted-foreground">
      {children}
    </span>
  );
}

function Primary({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="btn-pill-lake group">
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

export function Hero() {
  return (
    <section className="stage hero">
      <HeroCanvas />
      <div className="hero-copy">
        <div className="fade-in inline-flex items-center gap-2.5 rounded-full border border-[#3a3835] bg-black/40 px-4 py-1.5 backdrop-blur-sm" style={{ "--i": 0 } as React.CSSProperties}>
          <span className="size-1.5 animate-pulse rounded-full bg-coral" aria-hidden="true" />
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[#aba7a2]">
            Vox is listening · Phone &amp; WhatsApp
          </span>
        </div>

        <h1 className="mt-8 text-[clamp(3.25rem,9.5vw,9rem)] leading-[0.96] tracking-[-0.045em]">
          <span className="ln">
            <span style={{ "--i": 0 } as React.CSSProperties}>Call once.</span>
          </span>
          <span className="ln">
            <span style={{ "--i": 1 } as React.CSSProperties}>
              Work <em className="italic text-[#ff9473]">keeps moving.</em>
            </span>
          </span>
        </h1>

        <div className="hero-foot">
          <p className="fade-in max-w-[520px] text-[17px] leading-[1.45] md:text-[19px]" style={{ "--i": 2 } as React.CSSProperties}>
            A chief of staff you reach on a real phone call. It turns what you say into tasks,
            calendar changes and follow-ups — and calls you back when something needs you.
          </p>
          <div className="fade-in flex flex-wrap items-center gap-4" style={{ "--i": 3 } as React.CSSProperties}>
            <Primary href="/request-access">Request access</Primary>
            <Link href="#follow-through" className="btn-pill-ghost">
              Watch a call unfold
            </Link>
          </div>
        </div>
      </div>

      <div className="scroll-cue" aria-hidden="true">
        Scroll
      </div>
    </section>
  );
}

const manifesto =
  "You shouldn’t need another app to run your day. Say what’s on your mind. Vox makes it durable — tasks, calendar changes, reminders, follow-ups — and keeps it moving after you hang up.";

export function Manifesto() {
  return (
    <section className="manifesto">
      <p>
        {manifesto.split(" ").map((word, i) => (
          <span className="w" key={i}>
            {word}
          </span>
        ))}
      </p>
    </section>
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
        <span className="font-mono text-[12px] uppercase tracking-[0.16em] text-[#7b7773]">
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
    <section id="follow-through" className="stage">
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
              <p className="font-serif text-[28px] tracking-[-0.02em] !text-[#f6f3f1]">Vox</p>
              <p className="mt-1 text-[12px] uppercase tracking-[0.14em]">Connected</p>
              <div className="mt-4">
                <Wave />
              </div>
              <div className="mt-4 flex justify-center">
                <span className="grid size-14 place-items-center rounded-full bg-[#ff5b4a] text-white">
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
              <p className="mb-4 text-[11px] uppercase tracking-[0.14em] !text-[#7b7773]">
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
              <p className="mb-4 text-[11px] uppercase tracking-[0.14em] !text-[#7b7773]">
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
              <p className="text-[11px] uppercase tracking-[0.14em] !text-[#7b7773]">
                Scheduled · Tomorrow 8:30 AM
              </p>
              <div className="caller-ring mt-6">
                <PhoneCall size={40} className="text-[#242424]" aria-hidden="true" />
              </div>
              <p className="font-serif text-[28px] tracking-[-0.02em] !text-[#f6f3f1]">
                Vox is calling
              </p>
              <p className="mt-1 text-[13px]">Morning briefing · open launch items</p>
              <div className="mt-6 flex justify-center gap-10">
                <span className="grid size-14 place-items-center rounded-full bg-[#ff5b4a] text-white">
                  <PhoneOff size={22} aria-hidden="true" />
                </span>
                <span className="grid size-14 place-items-center rounded-full bg-[#34c759] text-white">
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

const nodes = [
  { tag: "Caller", name: "Your phone", note: "A normal call" },
  { tag: "Telephony", name: "Twilio", note: "Media Stream · μ-law 8 kHz" },
  { tag: "Listening", name: "AssemblyAI", note: "Streaming transcription" },
  { tag: "Thinking", name: "Vox Core", note: "Agents · memory · schedules", core: true },
  { tag: "Speaking", name: "ElevenLabs", note: "Streamed back as audio" },
];

const anatomyCards = [
  {
    title: "Greeted in 100 ms.",
    body: "Callers resolve through a minimal Redis cache with a 100 ms deadline. On a miss, a generic greeting plays — the database and the model never stand in the way of hello.",
  },
  {
    title: "Interruptible by design.",
    body: "Caller speech interrupts active playback, so Vox yields the floor the way a person would.",
  },
  {
    title: "Work outlives the line.",
    body: "Core Worker leases durable jobs from PostgreSQL, advances schedules, summarizes finished conversations and dispatches actions long after you hang up.",
  },
];

export function Anatomy() {
  return (
    <section id="anatomy" className="border-b border-border py-28 md:py-40">
      <div className="mx-auto max-w-[1432px] px-6 md:px-12">
        <div className="rv max-w-3xl">
          <Eyebrow>Under the hood</Eyebrow>
          <h2 className="mt-4 text-[clamp(2.5rem,6vw,5rem)] leading-[1] tracking-[-0.035em]">
            Anatomy of a call.
          </h2>
          <p className="mt-5 text-[17px] leading-[1.45]">
            Audio never waits on a database. This is the path a phone call takes, and what keeps
            running once it ends.
          </p>
        </div>

        <div className="rv flow mt-16">
          {nodes.flatMap(({ tag, name, note, core }, i) => [
            i > 0 && <span key={`l${i}`} className="flow-link" style={{ "--i": i } as React.CSSProperties} aria-hidden="true" />,
            <div key={name} className={`flow-node${core ? " core" : ""}`}>
              <small>{tag}</small>
              <strong>{name}</strong>
              <span>{note}</span>
            </div>,
          ])}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {anatomyCards.map(({ title, body }) => (
            <article key={title} className="rv feature-card">
              <h3 className="text-[26px] leading-[1.15] tracking-[-0.02em]">{title}</h3>
              <p className="mt-4 text-[15px] leading-[1.45]">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Surfaces() {
  return (
    <section id="surfaces" className="border-b border-border py-28 md:py-40">
      <div className="mx-auto max-w-[1432px] px-6 md:px-12">
        <div className="rv max-w-3xl">
          <Eyebrow>Everywhere you are</Eyebrow>
          <h2 className="mt-4 text-[clamp(2.5rem,6vw,5rem)] leading-[1] tracking-[-0.035em]">
            One agent. Every surface.
          </h2>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-12">
          <article className="rv elevated-card-periwinkle lg:col-span-7">
            <div
              className="pointer-events-none absolute -right-24 -top-24 size-[420px] rounded-full bg-gradient-to-br from-coral/40 via-sky-blue/50 to-mint/40 blur-[70px]"
              aria-hidden="true"
            />
            <div className="relative">
              <Monitor size={26} aria-hidden="true" />
              <h3 className="mt-8 text-[clamp(2rem,4vw,3rem)] leading-[1.05] tracking-[-0.03em]">
                Vox Desktop.
              </h3>
              <p className="mt-4 max-w-[520px] text-[16px] leading-[1.45] !text-inherit opacity-80">
                A native app built on Tauri. Home is a dark, stylized 3D city map that Vox itself
                can drive, alongside live voice, tasks, notes, schedules and reports on your own
                data.
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
              Kotlin and Jetpack Compose, as a thin client. It captures SMS and location, while
              Timeline, Pulse and Spaces run from the same shared Vox UI as desktop.
            </p>
          </article>

          <article className="rv feature-card lg:col-span-5">
            <MessageCircle size={26} aria-hidden="true" />
            <h3 className="mt-8 text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.05] tracking-[-0.03em]">
              Phone &amp; WhatsApp.
            </h3>
            <p className="mt-4 text-[15px] leading-[1.45]">
              Dial in or send a message. Bridge hands every finalized turn to the same Core agent
              and speaks the answer back.
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
  ["Uber", "Trip history · estimates"],
  ["Zomato", "Restaurant search · order handoff"],
  ["Amazon", "Catalog discovery · purchase handoff"],
  ["PlayStation", "Playtime history"],
  ["Expedia", "Lodging"],
  ["MCP servers", "Tool discovery"],
  ["Declarative skills", "Versioned packages"],
  ["Remote extensions", "Reviewed manifests"],
];

const guarantees = [
  ["Installing grants nothing.", "Adding an extension or skill never gives it account access. Access comes from explicit, per-agent grants."],
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
    <section id="connections" className="stage py-28 md:py-40">
      <div className="mx-auto max-w-[1432px] px-6 md:px-12">
        <div className="rv max-w-3xl">
          <span className="font-mono text-[12px] uppercase tracking-[0.16em] text-[#7b7773]">
            Vox Connections
          </span>
          <h2 className="mt-4 text-[clamp(2.5rem,6vw,5rem)] leading-[1] tracking-[-0.035em]">
            Connected, never presumed.
          </h2>
          <p className="mt-5 text-[17px] leading-[1.45]">
            A standalone connector platform with OAuth lifecycles, per-agent capability grants and
            signed requests. Independent of Core, usable by any host.
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
          <article key={title} className="rv border-t border-[#2c2a27] pt-6">
            <span className="font-mono text-[12px] text-[#7b7773]">0{i + 1}</span>
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
  { icon: ShieldCheck, title: "Hosts are signed in.", body: "Every Bridge call carries a timestamped, nonce-bound assertion. Host credentials never enter agent context." },
  { icon: CheckCheck, title: "Status is a prompt to verify.", body: "Vox queries authoritative state instead of assuming a background task succeeded." },
];

export function Trust() {
  return (
    <section id="principles" className="border-b border-border py-28 md:py-40">
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

export function SelfHost() {
  return (
    <section id="self-host" className="border-b border-border py-28 md:py-40">
      <div className="mx-auto grid max-w-[1432px] gap-12 px-6 md:px-12 lg:grid-cols-2 lg:items-center">
        <div className="rv">
          <Eyebrow>Vox Deploy</Eyebrow>
          <h2 className="mt-4 text-[clamp(2.5rem,6vw,5rem)] leading-[1] tracking-[-0.035em]">
            Run it your way.
          </h2>
          <p className="mt-5 max-w-[520px] text-[17px] leading-[1.45]">
            Core API, Core Worker, Bridge, PostgreSQL with pgvector and Redis ship as a supported
            Compose distribution under Apache 2.0.
          </p>
        </div>
        <div className="rv stage overflow-hidden rounded-[32px] border border-[#2c2a27] p-8">
          <div className="mb-5 flex gap-2" aria-hidden="true">
            <i className="size-2.5 rounded-full bg-[#ff5b4a]" />
            <i className="size-2.5 rounded-full bg-[#febc2e]" />
            <i className="size-2.5 rounded-full bg-[#34c759]" />
          </div>
          <pre className="overflow-x-auto font-mono text-[14px] leading-[1.7] text-[#f6f3f1]">
            <code>
              <span className="text-[#7b7773]">$ </span>cd vox-deploy{"\n"}
              <span className="text-[#7b7773]">$ </span>docker compose -f compose.self-hosted.yml up -d
            </code>
          </pre>
        </div>
      </div>
    </section>
  );
}

export function Closing() {
  return (
    <section className="stage closing">
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
          <Primary href="/request-access">Request access</Primary>
          <Link href="/changelog" className="btn-pill-ghost">
            Follow the build
          </Link>
        </div>
      </div>
    </section>
  );
}
