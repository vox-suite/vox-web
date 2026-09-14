import Image from "next/image";
import {
  CalendarDays,
  Check,
  Fingerprint,
  MessageCircle,
  Phone,
  Sparkles,
} from "lucide-react";
import { Badge, Grid, LinkButton, Row, Section } from "@/components/ui";
import { ConversationDemo } from "./demo";

export function Hero() {
  return (
    <section className="hero">
      <Badge tone="accent">Voice-first intelligence</Badge>
      <h1>
        Your chief of staff,
        <br />
        <span>on speed dial.</span>
      </h1>
      <p>
        The smartest person in the room is now one phone call away.
        <br />
        Calendar, commitments, priorities—handled before you hang up.
      </p>
      <Row>
        <LinkButton href="#possibilities">Discover Vox</LinkButton>
        <LinkButton href="#how-it-works" variant="secondary">
          How it works
        </LinkButton>
      </Row>
      <div className="hero-art" aria-hidden="true">
        <Image
          src="/artwork/signal-ring.svg"
          alt="Vox intelligence signal ring"
          width={1160}
          height={436}
          priority
        />
      </div>
    </section>
  );
}

export function Capabilities() {
  return (
    <div className="capability-line" aria-label="Planned capabilities">
      <span className="capability-item" data-tone="blue">
        <Phone size={16} aria-hidden="true" />
        One simple call
      </span>
      <span className="capability-item" data-tone="purple">
        <MessageCircle size={16} aria-hidden="true" />
        Natural conversation
      </span>
      <span className="capability-item" data-tone="amber">
        <CalendarDays size={16} aria-hidden="true" />
        Everyday coordination
      </span>
      <span className="capability-item" data-tone="emerald">
        <Fingerprint size={16} aria-hidden="true" />
        Private by design
      </span>
    </div>
  );
}

export function DemoSection() {
  return (
    <div className="demo-section">
      <Section
        id="possibilities"
        title="Whatever your day brings, talk it through."
        description="From an overloaded schedule to a thought you want to unpack, clarity begins with a simple conversation."
      >
        <ConversationDemo />
      </Section>
    </div>
  );
}

export function FeatureSection() {
  return (
    <Section
      id="how-it-works"
      title="The simplest way to get things done"
      description="No prompts to engineer. No new habits to learn. Just your voice."
    >
      <Grid>
        {[
          {
            title: "Pick up the phone",
            description:
              "No apps to navigate or menus to search. Just place a quick call whenever you need a hand, wherever your day takes you.",
            badge: "Connection",
            cardTheme: "cyan",
          },
          {
            title: "Speak naturally",
            description:
              "Talk through details, change your mind, or think out loud. Vox follows the nuance of conversation effortlessly.",
            badge: "Conversation",
            cardTheme: "violet",
          },
          {
            title: "Turn talk into action",
            description:
              "Vox connects the dots across your schedule, tasks, and notes, turning spoken thoughts into clear, reliable follow-through.",
            badge: "Continuity",
            cardTheme: "amber",
          },
        ].map(({ title, description, badge, cardTheme }, index) => (
          <article
            className="feature-card"
            key={title}
            data-card-theme={cardTheme}
          >
            <Badge>{badge}</Badge>
            <div className="feature-visual" aria-hidden="true">
              <Image
                src={`/artwork/${["connection", "conversation", "continuity"][index]}.svg`}
                alt=""
                width={360}
                height={300}
              />
            </div>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </Grid>
    </Section>
  );
}

export function StorySection() {
  return (
    <Section>
      <div className="story">
        <div className="story-copy">
          <Badge>Made for real life</Badge>
          <h2>
            Don’t manage your day.
            <br />
            Command it.
          </h2>
          <p>
            No apps to click. No endless menus to scroll. Just pick up, speak
            your mind, and let your assistant turn the chaos into clear
            follow-through.
          </p>
          <p>
            Vox remembers your context across conversations, quietly taking care
            of the details so you can focus on what actually matters.
          </p>
          <LinkButton href="#principles" variant="secondary">
            What guides us
          </LinkButton>
        </div>
        <div className="story-art">
          <div className="note-card">
            <Badge tone="accent">Continuous clarity</Badge>
            <h3>Always in your corner.</h3>
            <div className="note-line">
              <Check size={16} aria-hidden="true" />
              Clears mental clutter
            </div>
            <div className="note-line">
              <Check size={16} aria-hidden="true" />
              Remembers your context
            </div>
            <div className="note-line">
              <Check size={16} aria-hidden="true" />
              Keeps priorities front and center
            </div>
            <small>Designed for the flow of daily life</small>
          </div>
        </div>
      </div>
    </Section>
  );
}

export function PrinciplesSection() {
  return (
    <Section id="principles" title="Designed around your trust">
      <div className="principles">
        <div className="principles-art" aria-hidden="true">
          <Fingerprint />
        </div>
        <div>
          {[
            [
              "You’re always in control",
              "Important decisions always require your confirmation. You will always know what Vox is doing, why, and how your information is used.",
            ],
            [
              "Context, handled with care",
              "Understanding your routine comes with deep responsibility. Your data is strictly private, encrypted, and never shared or sold.",
            ],
            [
              "Helpful, without the noise",
              "A great assistant lightens your day instead of competing for your attention. Vox gives you time back rather than another screen to check.",
            ],
          ].map(([title, body], index) => (
            <article className="principle" key={title} data-principle-index={index}>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}

export function ClosingSection() {
  return (
    <Section>
      <div className="closing">
        <h2>
          The most natural interface
          <br />
          is still a simple hello.
        </h2>
        <p>We’re building Vox for everything life calls for.</p>
        <Sparkles size={30} strokeWidth={1.2} aria-hidden="true" />
        <Badge>Coming soon</Badge>
      </div>
    </Section>
  );
}
