import Image from "next/image";
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
      <div className="capability-card-preview" aria-hidden="true">
        <div className="capability-waveform">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <span className="capability-preview-text">Live barge-in · Streaming VAD</span>
        <span className="capability-preview-chip">Active</span>
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
      <div className="capability-card-preview capability-flow-preview" aria-hidden="true">
        <span className="capability-flow-step">
          <Phone size={12} /> Call ended
        </span>
        <ArrowRight size={11} className="capability-flow-arrow" />
        <span className="capability-flow-step">
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
      <div className="capability-card-preview" aria-hidden="true">
        <Check size={13} className="capability-preview-check" />
        <span className="capability-preview-text">Thu 9:00 AM · Proposal block</span>
        <span className="capability-preview-chip capability-chip-emerald">Added</span>
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
      <div className="capability-card-preview" aria-hidden="true">
        <PhoneCall size={13} className="capability-preview-phone" />
        <span className="capability-preview-text">Briefing call · Tomorrow 8:30 AM</span>
        <span className="capability-preview-chip capability-chip-amber">Queued</span>
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
      <div className="capability-card-preview" aria-hidden="true">
        <Fingerprint size={13} className="capability-preview-fingerprint" />
        <span className="capability-preview-text">Speaker match: Rahul</span>
        <span className="capability-preview-chip capability-chip-indigo">Verified</span>
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
      <div className="capability-card-preview" aria-hidden="true">
        <ShieldCheck size={13} className="capability-preview-shield" />
        <span className="capability-preview-text">Event #1042 · Signed & durable</span>
        <span className="capability-preview-chip capability-chip-slate">Logged</span>
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

export function Hero() {
  return (
    <section className="hero">
      <Badge tone="accent">The assistant you can call</Badge>
      <h1>
        Your chief of staff,
        <br />
        <span>on speed dial.</span>
      </h1>
      <p>
        Call to untangle the day, put decisions into motion, and stay ahead
        without another app to manage.
      </p>
      <Row>
        <LinkButton href="/request-access">Request access</LinkButton>
        <LinkButton href="#follow-through" variant="secondary">
          See how Vox follows through
        </LinkButton>
      </Row>
      <div className="hero-proof" aria-label="Available Vox capabilities">
        <span className="hero-proof-item">
          <Phone size={13} aria-hidden="true" className="hero-proof-icon" />
          Natural phone calls
        </span>
        <span className="hero-proof-divider" aria-hidden="true" />
        <span className="hero-proof-item">
          <Sparkles size={13} aria-hidden="true" className="hero-proof-icon" />
          Continuous memory
        </span>
        <span className="hero-proof-divider" aria-hidden="true" />
        <span className="hero-proof-item">
          <CalendarCheck size={13} aria-hidden="true" className="hero-proof-icon" />
          Proactive follow-up
        </span>
      </div>
      <div className="hero-art" aria-hidden="true">
        <Image
          src="/artwork/signal-ring.svg"
          alt=""
          width={1160}
          height={436}
          priority
          sizes="(max-width: 720px) 100vw, 960px"
        />
      </div>
    </section>
  );
}

export function Capabilities() {
  return (
    <div className="capability-line" aria-label="Core capabilities">
      <span className="capability-item" data-tone="blue">
        <Phone size={16} aria-hidden="true" />
        Phone and WhatsApp
      </span>
      <span className="capability-item" data-tone="purple">
        <MessageCircle size={16} aria-hidden="true" />
        Natural conversation
      </span>
      <span className="capability-item" data-tone="amber">
        <Sparkles size={16} aria-hidden="true" />
        Proactive follow-through
      </span>
      <span className="capability-item" data-tone="emerald">
        <Fingerprint size={16} aria-hidden="true" />
        Speaker-aware privacy
      </span>
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
      <ol className="call-path">
        {callPath.map(({ icon: Icon, step, title, description }) => (
          <li key={title}>
            <div className="call-path-top">
              <div className="call-path-marker" aria-hidden="true">
                <Icon />
              </div>
              <span className="call-path-step-badge">Step {step}</span>
            </div>
            <h3>{title}</h3>
            <p>{description}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

export function DemoSection() {
  return (
    <div className="demo-section">
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
            <article className="capability-card" key={title} data-featured={index === 0 || index === currentCapabilities.length - 1 ? "true" : undefined}>
              <div className="capability-card-header">
                <div className="capability-card-icon" aria-hidden="true">
                  <Icon />
                </div>
                <span className="capability-card-tag">{badge}</span>
              </div>
              <div className="capability-card-body">
                <h3>{title}</h3>
                <p>{description}</p>
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
      <div className="story">
        <div className="story-copy">
          <Badge>After the goodbye</Badge>
          <h2>The work continues after you hang up.</h2>
          <p>
            A useful assistant should not disappear when the conversation ends.
            Vox keeps commitments durable, watches what is due, and brings the
            next important update back to you.
          </p>
          <p>
            That can mean a reminder, a WhatsApp update, or a scheduled call—whichever way fits the moment.
          </p>
          <LinkButton href="#recently-shipped" variant="secondary">
            See what changed recently
          </LinkButton>
        </div>
        <div className="story-art">
          <div className="follow-up-card">
            <div className="follow-up-card-header">
              <Badge tone="positive">Follow-up scheduled</Badge>
              <span>Tomorrow · 8:30 AM</span>
            </div>
            <h3>Prepare the project review briefing.</h3>
            <div className="follow-up-event">
              <Check size={16} aria-hidden="true" />
              Decision saved to the project
            </div>
            <div className="follow-up-event">
              <Check size={16} aria-hidden="true" />
              Open items will be checked overnight
            </div>
            <div className="follow-up-event" data-active="true">
              <PhoneCall size={16} aria-hidden="true" />
              Vox will call with the briefing
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

export function PrinciplesSection() {
  return (
    <Section
      id="principles"
      title="Useful enough to act. Careful enough to trust."
    >
      <div className="principles">
        <div className="principles-art" aria-hidden="true">
          <Fingerprint />
        </div>
        <div>
          {[
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
          ].map(([title, body], index) => (
            <article
              className="principle"
              key={title}
              data-principle-index={index}
            >
              <h3>{title}</h3>
              <p>{body}</p>
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
      <div className="release-list">
        {latestReleases.map((release) => (
          <article key={release.id}>
            <div className="release-meta">
              <span>{release.version}</span>
              <time dateTime={release.date}>{release.formattedDate}</time>
            </div>
            <div>
              <h3>{release.title}</h3>
              <p>{release.summary}</p>
            </div>
            <LinkButton href={`/changelog#${release.id}`} variant="ghost">
              Release notes
            </LinkButton>
          </article>
        ))}
      </div>
      <div className="release-action">
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
      <div className="closing">
        <h2>Make one call. Leave with less to carry.</h2>
        <p>Vox turns conversation into continuity.</p>
        <Row>
          <LinkButton href="/request-access">Request access</LinkButton>
          <LinkButton href="/changelog" variant="secondary">
            Follow the build
          </LinkButton>
        </Row>
      </div>
    </Section>
  );
}
