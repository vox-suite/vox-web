"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ChevronDown,
  Menu,
  Phone,
  X,
  CalendarDays,
  Bell,
  Monitor,
  Smartphone,
  ShieldCheck,
} from "lucide-react";
import { HeroCanvas } from "./hero-canvas";
import { VoxLogo } from "@/components/ui/vox-logo";

const chapters = [
  {
    label: "You call",
    title: "A little less on your mind.",
    text: "Dial Vox while you’re walking between meetings. Say what needs doing, in your own words.",
    quote:
      "Tomorrow is packed. Protect two hours for the proposal and move anything that can wait.",
    speaker: "You",
    status: "Listening",
    icon: Phone,
  },
  {
    label: "You decide",
    title: "A plan you can say yes to.",
    text: "Vox works through the details with you. Review the proposed changes before they happen.",
    quote:
      "Keep the client review. Move the internal sync to Thursday and hold 9 to 11 for the proposal. Shall I apply that?",
    speaker: "Vox",
    status: "Waiting for your approval",
    icon: ShieldCheck,
  },
  {
    label: "Work continues",
    title: "Hang up. Keep the momentum.",
    text: "Tasks, reminders and follow-ups have a life beyond the conversation. Come back to their status whenever you need.",
    quote: "Yes, do it. And remind me to send the launch brief on Friday.",
    speaker: "You",
    status: "Follow-up scheduled",
    icon: CalendarDays,
  },
  {
    label: "Vox reaches back",
    title: "The next move finds you.",
    text: "A scheduled call or WhatsApp message brings the follow-up back to you, without another dashboard to check.",
    quote:
      "Your proposal time is protected. Here’s what’s still open before Friday’s launch.",
    speaker: "Vox",
    status: "Morning briefing",
    icon: Bell,
  },
];

function SectionLine({ children }: { children: ReactNode }) {
  return (
    <div className="section-line">
      <span aria-hidden="true">◇</span>
      <span>{children}</span>
      <i aria-hidden="true" />
    </div>
  );
}

function Geometry({ kind }: { kind: "orbit" | "pyramid" | "overlap" }) {
  return (
    <svg
      className="geometry"
      viewBox="0 0 300 220"
      fill="none"
      aria-hidden="true"
    >
      {kind === "orbit" && (
        <>
          {[83, 65, 47, 29].map((r) => (
            <circle key={r} cx="150" cy={185 - r} r={r} />
          ))}
          <path d="M145 158h10m-5-5v10M145 90h10m-5-5v10M145 33h10" />
        </>
      )}
      {kind === "pyramid" && (
        <>
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <path key={n} d={`M150 ${28 + n * 24} 58 186h184Z`} />
          ))}
          <path d="M150 28v158M58 186l92-25 92 25" />
        </>
      )}
      {kind === "overlap" && (
        <>
          <circle cx="150" cy="79" r="53" />
          <circle cx="115" cy="137" r="53" />
          <circle cx="185" cy="137" r="53" />
          <path d="m140 119 21-12m-26 22 36-21m-37 30 40-23m-36 31 36-21m-29 27 27-16" />
        </>
      )}
    </svg>
  );
}

function CallDemo() {
  const [active, setActive] = useState(0);
  const [timerKey, setTimerKey] = useState(0);
  const [paused, setPaused] = useState(false);

  function selectChapter(index: number) {
    setActive(index);
    setTimerKey((key) => key + 1);
  }

  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(() => {
      setActive((index) => (index + 1) % chapters.length);
      setTimerKey((key) => key + 1);
    }, 8000);
    return () => window.clearTimeout(timer);
  }, [active, timerKey, paused]);

  const chapter = chapters[active];
  const Icon = chapter.icon;
  return (
    <section id="follow-through" className="landing-section">
      <SectionLine>A call, with somewhere to go</SectionLine>
      <div className="section-intro">
        <h2>
          A conversation ends.
          <br />A commitment shouldn’t.
        </h2>
        <p>
          You shouldn’t have to turn a good conversation into another to-do
          list. Give Vox the loose end. Keep your day.
        </p>
      </div>
      <div className="chapter-playback">
        <button
          type="button"
          className="text-button"
          onClick={() => {
            setPaused(!paused);
            if (paused) setTimerKey((key) => key + 1);
          }}
          aria-pressed={paused}
        >
          {paused ? "Resume autoplay" : "Pause autoplay"}
        </button>
      </div>
      <div className="call-demo cut-panel">
        <div className="chapter-tabs" role="tablist" aria-label="Follow a call">
          {chapters.map((item, i) => (
            <button
              key={item.label}
              type="button"
              role="tab"
              id={`chapter-${i}`}
              aria-selected={active === i}
              aria-controls="chapter-content"
              tabIndex={active === i ? 0 : -1}
              onClick={() => selectChapter(i)}
              onKeyDown={(event) => {
                let next = i;
                if (event.key === "ArrowRight")
                  next = (i + 1) % chapters.length;
                else if (event.key === "ArrowLeft")
                  next = (i + chapters.length - 1) % chapters.length;
                else if (event.key === "Home") next = 0;
                else if (event.key === "End") next = chapters.length - 1;
                else return;
                event.preventDefault();
                selectChapter(next);
                document.getElementById(`chapter-${next}`)?.focus();
              }}
            >
              <span>0{i + 1}</span>
              {item.label}
              {active === i && (
                <i
                  key={timerKey}
                  className={`chapter-timer${paused ? " paused" : ""}`}
                  aria-hidden="true"
                />
              )}
            </button>
          ))}
        </div>
        <div
          id="chapter-content"
          role="tabpanel"
          aria-labelledby={`chapter-${active}`}
          className="chapter-content"
          tabIndex={0}
        >
          <div className="chapter-copy">
            <Icon size={25} aria-hidden="true" />
            <h3>{chapter.title}</h3>
            <p>{chapter.text}</p>
            <button
              className="text-button"
              type="button"
              onClick={() => selectChapter((active + 1) % chapters.length)}
            >
              {active === 3 ? "Replay the call" : "Next part"}
              <ArrowUpRight size={17} aria-hidden="true" />
            </button>
          </div>
          <div className="transcript">
            <div className="transcript-top">
              <span>{chapter.speaker}</span>
              <span>Illustrative conversation</span>
            </div>
            <blockquote>“{chapter.quote}”</blockquote>
            <div className="demo-status">
              <span className="status-dot" />
              {chapter.status}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    title: "Make room.",
    kind: "orbit" as const,
    quote: "“Protect my morning.”",
    text: "Turn competing priorities into a plan for your calendar, tasks and focus time.",
  },
  {
    title: "Close the loop.",
    kind: "pyramid" as const,
    quote: "“Follow up on Friday.”",
    text: "Give reminders and commitments a next step that survives the end of your call.",
  },
  {
    title: "Keep the context.",
    kind: "overlap" as const,
    quote: "“What’s still open?”",
    text: "Return to your timeline and ongoing work without retelling the whole story.",
  },
];

function Features() {
  return (
    <section id="use-cases" className="landing-section">
      <SectionLine>Less to carry</SectionLine>
      <div className="feature-grid">
        {features.map((feature, i) => (
          <article
            key={feature.title}
            className={`feature-tile cut-panel${i === 0 ? " feature-coral" : ""}`}
          >
            <div className="feature-top">
              <h2>{feature.title}</h2>
              <ArrowUpRight size={20} aria-hidden="true" />
            </div>
            <div className="geometry-frame">
              <Geometry kind={feature.kind} />
            </div>
            <div className="feature-bottom">
              <h3>{feature.quote}</h3>
              <p>{feature.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Surfaces() {
  return (
    <section id="surfaces" className="landing-section">
      <SectionLine>One Vox. Your way in.</SectionLine>
      <div className="surface-panel cut-panel">
        <div className="surface-heading">
          <h2>
            On the phone.
            <br />
            In your corner.
          </h2>
          <p>Start with your voice. Get a wider view when you want one.</p>
        </div>
        <div className="surface-grid">
          <article>
            <Phone aria-hidden="true" />
            <h3>Phone & WhatsApp</h3>
            <p>
              A real call for the conversation. A message for the follow-up.
            </p>
          </article>
          <article>
            <Monitor aria-hidden="true" />
            <h3>Desktop</h3>
            <p>
              A home for your agent, with a map, timeline and a view of ongoing
              work.
            </p>
          </article>
          <article>
            <Smartphone aria-hidden="true" />
            <h3>Android</h3>
            <p>
              Your timeline on the move, with optional location and SMS context.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

function Trust() {
  return (
    <section id="trust" className="landing-section">
      <SectionLine>Useful enough to act. Careful enough to trust.</SectionLine>
      <div className="trust-layout">
        <div>
          <h2>
            Your assistant.
            <br />
            Your say.
          </h2>
          <p>
            Connecting an account shouldn’t mean handing over control. Access,
            approvals and actions have their own boundaries.
          </p>
          <Link href="#faq" className="text-button">
            A few good questions
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
        <div className="trust-list">
          {[
            [
              "Permission comes first",
              "You choose which connected accounts and actions your agent can use.",
            ],
            [
              "Approve the actual details",
              "Consequential actions need a specific approval. A changed proposal needs a new decision.",
            ],
            [
              "A clear account of what happened",
              "Work has a recorded status. An uncertain result stays uncertain until it can be checked.",
            ],
          ].map(([title, text]) => (
            <article key={title}>
              <ShieldCheck size={20} aria-hidden="true" />
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="horizon cut-panel">
        <span>On the horizon</span>
        <h3>More of life, with the same boundaries.</h3>
        <p>
          Travel, purchases and specialist agents are the direction ahead.
          Provider availability and real-world execution will determine what you
          can use.
        </p>
        <span className="horizon-note">
          Future capabilities · Not a booking service today
        </span>
      </div>
    </section>
  );
}

const faqs = [
  [
    "What happens after I hang up?",
    "Your saved tasks and scheduled follow-ups remain in Vox. The conversation is one way to manage the work; it isn’t the only place that work lives.",
  ],
  [
    "Do I need another app?",
    "You can reach Vox by phone or WhatsApp. Desktop, Android and web provide additional views and controls when you want them. Access depends on your Vox setup.",
  ],
  [
    "Can Vox act without my permission?",
    "Account access and permission to act are separate. Consequential external actions require approval of the specific proposal. Connecting an account doesn’t grant unlimited authority.",
  ],
  [
    "Does Vox use my voice as a password?",
    "No. Vox does not use voice biometrics or voiceprints. Calling and account identity are handled separately from the sound of your voice.",
  ],
  [
    "Can it book travel or make purchases today?",
    "Those are future capabilities. This page illustrates the follow-through experience; it does not promise a live travel, shopping or payment integration.",
  ],
];

function FAQ() {
  return (
    <section id="faq" className="landing-section">
      <SectionLine>Before you call</SectionLine>
      <div className="faq-layout">
        <h2>
          A few good
          <br />
          questions.
        </h2>
        <div>
          {faqs.map(([question, answer]) => (
            <details key={question} className="landing-faq">
              <summary>
                {question}
                <ChevronDown size={18} aria-hidden="true" />
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [
    ["#follow-through", "The experience"],
    ["#surfaces", "Your way in"],
    ["#trust", "Trust"],
  ];
  return (
    <div className="vox-landing">
      <header className="landing-header">
        <Link className="landing-brand" href="/" aria-label="Vox home">
          <VoxLogo size={40} className="header-logo" />
          <span>vox</span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map(([href, label]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link className="landing-button small" href="#follow-through">
            Explore Vox
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
          <button
            type="button"
            className="mobile-menu-button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {menuOpen && (
          <nav
            id="mobile-navigation"
            className="mobile-nav"
            aria-label="Mobile navigation"
          >
            {links.map(([href, label]) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)}>
                {label}
              </Link>
            ))}
          </nav>
        )}
      </header>
      <main id="main">
        <section className="landing-hero">
          <div className="hero-fluid" aria-hidden="true">
            <HeroCanvas />
          </div>
          <div className="hero-heading">
            <h1>
              Call once.
              <br />
              Work keeps moving.
            </h1>
            <div className="hero-bottom">
              <p>
                Say what’s on your mind. Vox turns the conversation into tasks,
                plans and follow-ups, then reaches back when it’s time for the
                next move.
              </p>
              <div className="hero-actions">
                <button
                  type="button"
                  className="landing-button"
                  disabled
                  title="Access request destination is being set up"
                >
                  Request access
                </button>
              </div>
            </div>
          </div>
        </section>
        <CallDemo />
        <Features />
        <Surfaces />
        <Trust />
        <FAQ />
        <section className="landing-closing cut-panel">
          <VoxLogo size={50} className="landing-closing-logo" />
          <h2>
            Make one call.
            <br />
            Leave with less to carry.
          </h2>
          <p>
            A little more room in your day.
            <br />A little less left in your head.
          </p>
          <Link className="landing-button" href="#follow-through">
            Experience Vox
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </section>
      </main>
      <footer className="landing-footer">
        <Link className="landing-brand" href="/" aria-label="Vox home">
          <VoxLogo size={25} />
          <span>vox</span>
        </Link>
        <p>Work keeps moving.</p>
        <Link href="#trust">Your control & privacy</Link>
        <Link href="/privacy-policy">Privacy policy</Link>
        <Link href="/terms-of-service">Terms of service</Link>
        <span>© {new Date().getFullYear()} Vox</span>
      </footer>
    </div>
  );
}
