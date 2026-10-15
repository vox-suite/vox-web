import { FaqAccordion } from "@/components/ui/faq-accordion";
import { MobileMenu } from "./mobile-menu";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { VoxLogo } from "@/components/ui/vox-logo";
import { AutonomyPanel } from "./autonomy-panel";
import { AutomateFlow } from "./automate-flow";
import { Orbit } from "./orbit";
import { ProductShot } from "./product-shot";
import { TimeRibbon } from "./time-ribbon";
import { Spotlight } from "./spotlight";
import { WaitlistForm } from "./waitlist-form";
import { ThemeToggle } from "./theme-toggle";
import { HeaderScroll } from "./header-scroll";

const connectors = [
  "gmail",
  "google-calendar",
  "google-maps",
  "youtube",
  "spotify",
  "playstation",
];



const faqs = [
  [
    "Where can I reach Vox?",
    "By phone call, by message, and in the Vox app on Mac, Windows and Android, with more interfaces to follow. It is the same Vox everywhere, so you can start on one and continue on another.",
  ],
  [
    "Do I need the app or mobile data to call Vox?",
    "No. A phone call needs neither. The app is for when you want the full Timeline, charts and sources.",
  ],
  [
    "Who can access my Vox by phone?",
    "Access to your personal Vox is restricted to your registered number.",
  ],
  [
    "How much will Vox do without asking me?",
    "You decide, task by task: notify me, ask first, or act automatically within limits you set. Delivery is a separate choice, such as a phone call or a message.",
  ],
  [
    "What does Vox read?",
    "Only the accounts you connect. Each has separate switches for Timeline and for the assistant, and you can pause or disconnect any time. Disconnecting deletes the stored credentials.",
  ],
  [
    "Can I check an answer?",
    "Yes. Every entry shows the email, statement or file it came from.",
  ],
  [
    "When can I use it?",
    "Vox is in development. Join the waitlist to shape it, and we'll email you once, when it's ready.",
  ],
];

function Grain({ id }: { id: string }) {
  return (
    <svg className="h-noise" width="100%" height="100%" aria-hidden="true">
      <filter id={id} x="0" y="0" width="100%" height="100%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.9"
          numOctaves="2"
          stitchTiles="stitch"
        />
        <feColorMatrix
          type="matrix"
          values="1.8 1.8 1.8 0 -2.2 1.8 1.8 1.8 0 -2.2 1.8 1.8 1.8 0 -2.2 0 0 0 0 1"
        />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${id})`} />
    </svg>
  );
}

function Brand({ size = 34 }: { size?: number }) {
  return (
    <Link href="/" className="h-brand" aria-label="Vox home">
      <VoxLogo size={size} />
      <span className="h-brand-name">vox</span>
    </Link>
  );
}

function Head({
  children,
  lead,
}: {
  children: React.ReactNode;
  lead?: string;
}) {
  return (
    <div className="h-head">
      <h2>{children}</h2>
      {lead && <p className="h-lead">{lead}</p>}
    </div>
  );
}

export function Header({ current }: { current?: string }) {
  return (
    <header className="h-header">
      <HeaderScroll />
      <div className="h-header-inner">
        <Brand size={46} />
        <nav className="h-nav" aria-label="Main navigation">
          <Link href="/timeline" aria-current={current === "timeline" ? "page" : undefined}>Timeline</Link>
          <span className="h-nav-pending" title="Insights page coming soon">Insights <small>Soon</small></span>
          <Link href="/projects" aria-current={current === "projects" ? "page" : undefined}>Projects</Link>
          <Link href="/download" aria-current={current === "download" ? "page" : undefined}>Downloads</Link>
        </nav>
        <MobileMenu links={[["/timeline", "Timeline"], ["/projects", "Projects"], ["/download", "Downloads"]]} current={current} />
        <ThemeToggle />
        <Link href="/#waitlist" className="h-btn h-btn-small">
          <span className="h-join-full">Join the waitlist</span><span className="h-join-short">Join waitlist</span>
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="h-hero">
      <div className="h-wash" aria-hidden="true">
        <div className="h-glow" />
        <Grain id="grain-hero" />
      </div>
      <div className="h-wrap h-hero-copy">
        <a href="#waitlist" className="h-badge">
          <b>Soon</b>
          <span>Vox is in development. Join the waitlist to shape it.</span>
          <ArrowRight size={14} aria-hidden="true" />
        </a>
        <h1>
          Your chief of staff,
          <br />
          <em>on speed dial.</em>
        </h1>
        <p className="h-lead">
          Vox is a personal AI assistant you can call. It brings together the details of your life, helps you make sense of
          them, and follows through on tasks you hand over.{" "}
          <em>Call, message or open the app.</em>
        </p>
        <WaitlistForm source="hero" />
      </div>
      <TimeRibbon />
    </section>
  );
}

function Shot({ name, alt }: { name: string; alt: string }) {
  return (
    <div className="h-bento-shot">
      <ProductShot name={name} crop alt={alt} />
    </div>
  );
}

function Track() {
  return (
    <section className="h-section" id="track">
      <div className="h-wrap">
        <Head lead="Connect the accounts you choose. Vox brings your plans, spending and everyday activity together, ready when you need it.">
          A little context.
          <br />
          <em>A lot less explaining.</em>
        </Head>
        <div className="h-bento">
          <Spotlight className="h-card h-b-a">
            <h3>Your day, brought together.</h3>
            <p>Meetings, purchases, places, music and games—in one timeline.</p>
            <Shot name="timeline-month" alt="Timeline month view" />
          </Spotlight>
          <Spotlight className="h-card h-b-b">
            <h3>Your questions. Clear answers.</h3>
            <p>
              “How much did I spend this week?” Get numbers, comparisons and the
              details behind them.
            </p>
            <Shot
              name="insights"
              alt="Insights charts comparing the week with the previous one"
            />
          </Spotlight>
          <Spotlight className="h-card h-b-c">
            <p className="h-row-no">Your accounts</p>
            <h3>Start with what you already use.</h3>
            <p>
              Connect your chosen accounts to give Vox the context it needs.
            </p>
            <div className="h-marquee" aria-label="Supported accounts">
              <div className="h-account-track">
                {[0, 1].map((copy) => (
                  <ul key={copy} aria-hidden={copy === 1 || undefined}>
                    {connectors.map((c) => (
                      <li key={c}>
                        <Image
                          src={`/brands/${c}.svg`}
                          alt={copy === 0 ? c.replaceAll("-", " ") : ""}
                          width={40}
                          height={40}
                          unoptimized
                        />
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </div>
          </Spotlight>
          <Spotlight className="h-card h-b-d">
            <p className="h-row-no">Sources</p>
            <h3>See what’s behind the answer.</h3>
            <p>
              Open an entry to check the email, statement or file it came from.
            </p>
            <Shot
              name="event-detail"
              alt="An entry with its amount, merchant and sources"
            />
          </Spotlight>
        </div>
      </div>
    </section>
  );
}

function Automate() {
  return (
    <section className="h-section" id="automate" aria-label="Automate">
      <div className="h-wrap">
        <AutomateFlow>
          <Image
            className="h-reminder-art"
            src="/illustrations/dithered-clock-transparent.png"
            alt=""
            width={88}
            height={88}
            sizes="88px"
            aria-hidden="true"
          />
          <Head lead="Set a reminder, arrange a check-in or turn on an alert. Vox follows through—and calls when you’ve asked it to.">
            Something to do? <em>Leave it with Vox.</em>
          </Head>
        </AutomateFlow>
      </div>
    </section>
  );
}

function Autonomy() {
  return (
    <section className="h-section" id="autonomy">
      <div className="h-wrap">
        <AutonomyPanel>
          <Head lead="For each kind of task, choose whether Vox simply notifies you, asks for approval or acts within your limits. Choose how it reaches you separately.">
            A helping hand. <em>On your terms.</em>
          </Head>
        </AutonomyPanel>
      </div>
    </section>
  );
}

function Channels() {
  return (
    <section className="h-section" id="channels">
      <div className="h-wrap h-two">
        <div>
          <Head lead="Call when your hands are full. Message when you’d rather type. Open the app when you want the bigger picture. Your context and permissions stay with you.">
            One Vox. <em>However you reach it.</em>
          </Head>
        </div>
        <Orbit />
      </div>
    </section>
  );
}

function Security() {
  return (
    <section className="h-section h-trust-summary" id="security">
      <div className="h-wrap">
        <div className="h-trust-band">
          <Image
            className="h-trust-art"
            src="/illustrations/dithered-key-transparent.png"
            alt=""
            width={180}
            height={180}
            aria-hidden="true"
          />
          <Head lead="Choose what each connected account shares with Vox. Check the sources behind its answers, pause access or disconnect any time.">
            Your accounts. <em>Your rules.</em>
          </Head>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="h-section" id="faq">
      <div className="h-wrap h-faq">
        <Head>
          A few things <em>you might be wondering.</em>
        </Head>
        <FaqAccordion items={faqs} name="home-faq" />
      </div>
    </section>
  );
}

function Waitlist() {
  return (
    <section className="h-section" id="waitlist">
      <div className="h-wrap">
        <div className="h-final">
          <div className="h-wash h-wash-card" aria-hidden="true">
            <div className="h-glow" />
            <Grain id="grain-band" />
          </div>
          <div className="h-final-copy">
            <Image
              className="h-waitlist-art"
              src="/illustrations/dithered-envelope-transparent.png"
              alt=""
              width={100}
              height={100}
              sizes="100px"
              aria-hidden="true"
            />
            <h2>
              What would you take <em>off your plate?</em>
            </h2>
            <p className="h-lead">
              Vox is in development. Join the waitlist and tell us the first
              thing you’d hand over.
            </p>
            <ul className="h-final-list">
              <li>One email when Vox is ready</li>
              <li>Early say in what we build</li>
              <li>No spam, ever</li>
            </ul>
          </div>
          <WaitlistForm source="final" />
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="h-footer">
      <div className="h-wrap h-footer-grid">
        <div>
          <Brand size={30} />
          <p>Your chief of staff, on speed dial.</p>
        </div>
        <nav aria-label="Product">
          <h3>Product</h3>
          <Link href="/timeline">Timeline</Link>
          <Link href="/speech-time-calculator">Speech time calculator</Link>
          <span className="h-footer-pending">Insights <small>Coming soon</small></span>
          <Link href="/projects">Projects</Link>
          <Link href="/download">Downloads</Link>
        </nav>
        <nav aria-label="Legal">
          <h3>Legal</h3>
          <Link href="/privacy-policy">Privacy policy</Link>
          <Link href="/terms-of-service">Terms of service</Link>
        </nav>
        <div className="h-footer-bottom"><span>© {new Date().getFullYear()} Vox</span><Link href="/#waitlist">Join the waitlist</Link></div>
      </div>
      <div className="h-wordmark" aria-hidden="true">
        vox
      </div>
    </footer>
  );
}

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(([q, a]) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

export function HomePage() {
  return (
    <div className="vox-home">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <Header />
      <main id="main">
        <Hero />
        <Track />
        <Automate />
        <Autonomy />
        <Channels />
        <Security />
        <Faq />
        <Waitlist />
      </main>
      <Footer />
    </div>
  );
}
