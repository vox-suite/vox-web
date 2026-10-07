"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  Activity,
  CalendarDays,
  Check,
  ChevronDown,
  Link2,
  Menu,
  Mic,
  Monitor,
  Phone,
  ShieldCheck,
  Smartphone,
  Sparkles,
  X,
} from "lucide-react";
import { VoxLogo } from "@/components/ui/vox-logo";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { CityScene } from "./city-scene";
import {
  ProductPreview,
  SpanPreview,
  SpacePreview,
  PulsePreview,
  ConnectionsPreview,
} from "./product-preview";
import "./cinematic.css";

const chapters = [
  {
    id: "connections",
    name: "Connections",
    icon: Link2,
    title: "A little context.\nA much better assistant.",
    copy: "Your calendar, your gaming, the parts of life you choose to share. Bring them together so the next conversation starts with context.",
    note: "You choose the accounts. You control the access.",
    preview: ConnectionsPreview,
  },
  {
    id: "spans",
    name: "Spans",
    icon: CalendarDays,
    title: "Life happens.\nKeep the thread.",
    copy: "A meeting. A journey. Something you spent. Spans give the moments that use your time and resources a place in one timeline.",
    note: "A connected view of your days, with the source behind each moment.",
    preview: SpanPreview,
  },
  {
    id: "pulse",
    name: "Pulse",
    icon: Activity,
    title: "See what your\ndays are telling you.",
    copy: "Turn your own categories into visual boards. Explore where your time and money go, and find patterns worth paying attention to.",
    note: "Suggested charts. Your choice of what to keep.",
    preview: PulsePreview,
  },
  {
    id: "spaces",
    name: "Spaces",
    icon: Sparkles,
    title: "Give your next\nidea some space.",
    copy: "Start with an intention. Vox brings your context and research into a canvas of possibilities. Compare options, steer the thinking, then commit a plan when you’re ready.",
    note: "From “what if” to a considered next step.",
    preview: SpacePreview,
  },
];

function ProductStory() {
  const [active, setActive] = useState("connections");
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-25% 0px -45% 0px" },
    );
    chapters.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);
  return (
    <section
      className="product-story"
      id="experience"
      aria-label="How Vox fits together"
    >
      <nav className="story-nav" aria-label="Product chapters">
        {chapters.map(({ id, name, icon: Icon }) => (
          <a
            key={id}
            href={`#${id}`}
            aria-current={active === id ? "location" : undefined}
          >
            <Icon size={16} />
            {name}
          </a>
        ))}
      </nav>
      <div className="story-chapters">
        {chapters.map(
          (
            { id, name, title, copy, note, icon: Icon, preview: Preview },
            index,
          ) => (
            <article className={`story-chapter chapter-${id}`} id={id} key={id}>
              <div className="chapter-editorial">
                <span className="chapter-label">
                  <Icon size={18} />
                  {name}
                </span>
                <h2>{title}</h2>
                <p>{copy}</p>
                <span className="chapter-note">{note}</span>
                <span className="chapter-index" aria-hidden="true">
                  0{index + 1}
                </span>
              </div>
              <div className="chapter-visual">
                <Preview />
                <span className="illustration-note">
                  Illustrative product experience
                </span>
              </div>
            </article>
          ),
        )}
      </div>
    </section>
  );
}

const faqs = [
  [
    "What is Vox?",
    "Vox is a personal AI assistant designed to connect your context, help you think through decisions, and keep plans and follow-ups in view. You can interact through desktop, Android, and voice, depending on your setup.",
  ],
  [
    "How do Spans, Spaces, and Pulse fit together?",
    "Spans hold events and activities in your timeline. Pulse creates charts over that data. Spaces help you explore an intention, research options, and develop a plan before you choose to commit it.",
  ],
  [
    "What can I connect?",
    "The connection library includes Google Calendar and PlayStation, with other integrations in development. Availability depends on provider access and your Vox setup. A provider shown in an illustration is not a promise of availability for every account.",
  ],
  [
    "Do I choose what Vox can access?",
    "Yes. You choose your connected accounts. Timeline synchronization and assistant reads have separate controls. Android SMS and location capture are optional and permission-based. External actions that require approval remain separate from permission to read context.",
  ],
  [
    "Can Vox book the trip shown here?",
    "The trip is an illustration of research and planning in Spaces. It is not a live booking or payment demonstration. Travel booking and purchases remain part of the longer-term vision.",
  ],
  [
    "How can I get Vox?",
    "Vox is in active development. This site previews the product and its direction. Public download and access links will be added when they are ready.",
  ],
];

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [
    ["#experience", "The experience"],
    ["#everywhere", "Vox, everywhere"],
    ["#your-control", "Your control"],
  ];
  return (
    <div className="vox-cinema">
      <header className="cinema-header">
        <Link href="/" className="cinema-brand" aria-label="Vox home">
          <VoxLogo animated={false} size={35} />
          <span>vox</span>
        </Link>
        <nav className="cinema-nav" aria-label="Main navigation">
          {links.map(([href, label]) => (
            <a href={href} key={href}>
              {label}
            </a>
          ))}
        </nav>
        <a className="cinema-button header-cta" href="#explore">
          Explore Vox <ArrowUpRight size={15} />
        </a>
        <button
          className="cinema-menu"
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          aria-controls="cinema-mobile-nav"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
        {menuOpen && (
          <nav
            id="cinema-mobile-nav"
            className="cinema-mobile-nav"
            aria-label="Mobile navigation"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setMenuOpen(false);
                document
                  .querySelector<HTMLButtonElement>(".cinema-menu")
                  ?.focus();
              }
            }}
          >
            {links.map(([href, label]) => (
              <a href={href} key={href} onClick={() => setMenuOpen(false)}>
                {label}
              </a>
            ))}
          </nav>
        )}
      </header>
      <main id="main">
        <section className="cinema-hero">
          <div className="hero-city">
            <CityScene />
          </div>
          <div className="hero-copy">
            <span className="hero-intro">
              <i /> A personal AI, with your world in view.
            </span>
            <h1>
              Your life, understood.
              <br />
              Your next move,
              <br />
              clearer.
            </h1>
            <p>
              Bring your days, your ideas, and your connected world together. An
              assistant that helps you see the whole picture—and do something
              with it.
            </p>
            <div className="hero-action-row">
              <a className="cinema-button button-light" href="#explore">
                Step inside Vox <ArrowUpRight size={17} />
              </a>
              <span>Built around you.</span>
            </div>
          </div>
          <div className="hero-map-label">
            <span className="location-dot" />
            <div>
              <strong>Life doesn’t happen in tabs.</strong>
              <span>Neither should your context.</span>
            </div>
          </div>
          <div className="hero-foot">
            <span>One assistant. A continuous thread.</span>
            <a href="#explore">
              Discover the connection <ArrowDown size={14} />
            </a>
          </div>
        </section>
        <section className="cinema-introduction" id="explore">
          <div className="intro-heading">
            <span className="small-caption">Meet your wider view</span>
            <h2>
              All the pieces.
              <br />
              Finally, a picture.
            </h2>
            <p>
              What happened. What it means. What comes next.
              <br />A connected workspace for the life you’re actually living.
            </p>
          </div>
          <ContainerScroll>
            <ProductPreview />
          </ContainerScroll>
          <div className="preview-caption">
            <span>
              <Monitor size={15} /> Designed around the Vox desktop experience
            </span>
            <span>Explore the tabs above</span>
          </div>
        </section>
        <ProductStory />
        <section className="everywhere-section" id="everywhere">
          <div className="everywhere-copy">
            <span className="small-caption">With you, beyond the desk</span>
            <h2>
              Same Vox.
              <br />
              Wherever life goes.
            </h2>
            <p>
              A wider view on desktop. Your timeline in your pocket. A
              conversation when your hands are full.
            </p>
            <div className="surface-descriptions">
              <div>
                <Monitor size={20} />
                <span>
                  <strong>Room to think</strong>
                  <small>
                    Desktop brings your map, Spaces, timeline, and Pulse
                    together.
                  </small>
                </span>
              </div>
              <div>
                <Smartphone size={20} />
                <span>
                  <strong>Context on the move</strong>
                  <small>
                    Android keeps your timeline close, with optional SMS and
                    location capture.
                  </small>
                </span>
              </div>
              <div>
                <Phone size={20} />
                <span>
                  <strong>Just say it</strong>
                  <small>
                    Talk by phone or in the app. Return to the work beyond the
                    conversation.
                  </small>
                </span>
              </div>
            </div>
          </div>
          <div className="device-scene">
            <div className="device-orbit" />
            <div className="phone-preview">
              <div className="phone-status">
                <span>9:41</span>
                <span>••• ▰</span>
              </div>
              <div className="phone-brand">
                <VoxLogo animated={false} size={27} />
                <span>vox</span>
              </div>
              <span className="small-caption">Friday, in view</span>
              <h3>
                A day with
                <br />a little more room.
              </h3>
              <div className="phone-date">
                <span>05</span>
                <span>06</span>
                <span>07</span>
                <span>08</span>
                <strong>09</strong>
                <span>10</span>
                <span>11</span>
              </div>
              <SpanPreview />
              <div className="phone-voice">
                <Mic size={18} />
                <span>What’s on your mind?</span>
              </div>
              <div className="phone-home" />
            </div>
            <div className="voice-card">
              <span className="voice-card-icon">
                <Phone size={18} />
              </span>
              <div>
                <strong>“Let’s make a plan.”</strong>
                <span>One conversation. More context.</span>
              </div>
              <div className="voice-bars" aria-hidden="true">
                {[12, 25, 17, 34, 21, 13, 27].map((h, i) => (
                  <i key={i} style={{ height: h }} />
                ))}
              </div>
            </div>
            <span className="device-caption">
              Illustrative Android and voice experience
            </span>
          </div>
        </section>
        <section className="control-section" id="your-control">
          <div>
            <ShieldCheck size={26} />
            <h2>
              Personal means
              <br />
              you’re in control.
            </h2>
            <p>Understanding your world starts with your permission.</p>
          </div>
          <div className="control-points">
            {[
              [
                "Choose your context",
                "Connect the accounts you want. Control what’s synced and what your assistant can read.",
              ],
              [
                "Keep the final say",
                "Review consequential actions before they happen. An idea becomes a plan when you choose to commit.",
              ],
              [
                "Know where it came from",
                "Keep the source behind your activity in view. Illustrations and future capabilities stay clearly identified.",
              ],
            ].map(([title, body]) => (
              <div key={title}>
                <Check size={18} />
                <span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </span>
              </div>
            ))}
          </div>
        </section>
        <section className="cinema-faq" id="faq">
          <div>
            <span className="small-caption">A little clarity</span>
            <h2>Good questions.</h2>
          </div>
          <div>
            {faqs.map(([question, answer]) => (
              <details key={question}>
                <summary>
                  {question}
                  <ChevronDown size={17} />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="cinema-closing">
          <VoxLogo animated={false} size={70} />
          <h2>
            A little less scattered.
            <br />A little more possible.
          </h2>
          <p>This is the world we’re building with Vox.</p>
          <a className="cinema-button button-light" href="#explore">
            Explore the experience <ArrowUpRight size={17} />
          </a>
          <span className="closing-note">
            In active development. Public access is coming.
          </span>
        </section>
      </main>
      <footer className="cinema-footer">
        <Link href="/" className="cinema-brand" aria-label="Vox home">
          <VoxLogo animated={false} size={27} />
          <span>vox</span>
        </Link>
        <span>Your world. A continuous thread.</span>
        <div>
          <Link href="/privacy-policy">Privacy</Link>
          <Link href="/terms-of-service">Terms</Link>
          <span>© {new Date().getFullYear()} Vox</span>
        </div>
      </footer>
    </div>
  );
}
