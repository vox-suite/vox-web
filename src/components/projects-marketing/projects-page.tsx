import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { FaqAccordion } from "@/components/ui/faq-accordion";
import { Footer, Header } from "@/components/home/home-page";
import { WaitlistForm } from "@/components/home/waitlist-form";
import { ProjectStory } from "./project-story";
import "./projects.css";

const faq = [
  [
    "What is a Project?",
    "A long-lived place for one thing you are working on. You add your material, ask questions about it and keep a short list of context that stays true.",
  ],
  [
    "What can I add?",
    "One or more folders, or up to five individual text or code files. Common code and text formats are supported, including Markdown, JSON, YAML and CSV.",
  ],
  [
    "Can I add PDFs?",
    "Not yet. PDFs and other documents need converting to text first, which is planned.",
  ],
  [
    "Do my files get uploaded?",
    "No. Files and indexes stay on your computer. Only the short excerpts a question needs are sent to the model.",
  ],
  [
    "How do I know an answer is right?",
    "Open any part of a diagram to see the file and lines it came from. If something is not in your material, Vox says so instead of guessing.",
  ],
  [
    "What if my files change?",
    "Vox re-reads changed files before it draws, and flags context that relied on them so you can review it. Your own edits always win.",
  ],
  [
    "Does it work on my phone?",
    "You can read and edit context, create projects and start Plans. Reading your files and drawing diagrams happen on the desktop.",
  ],
  [
    "When can I use it?",
    "Vox is in development. Join the waitlist and we will email you once, when it is ready.",
  ],
];

export function ProjectsPage() {
  return (
    <div className="vox-home pj-page">
      <Header current="projects" />
      <main id="main" tabIndex={-1}>
        <section className="pj-hero h-wrap">
          <Breadcrumbs current="Projects" />
          <div className="pj-hero-grid">
            <div className="pj-hero-copy">
              <h1>
                Ask your work
                <br />
                <em>how it works.</em>
              </h1>
              <p className="pj-intro">
                Point Vox at a folder of code, specs or notes. Ask a question. Get a diagram that explains it, with the exact lines behind every box.
              </p>
              <div className="pj-join" id="join">
                <WaitlistForm source="projects" />
              </div>
            </div>
            <figure className="pj-art">
              <div className="pj-art-halo" aria-hidden="true" />
              <Image className="pj-art-img" src="/illustrations/dithered-pins-transparent.png" alt="Three cards pinned to a board and joined by a pink string" width={1254} height={1254} sizes="(max-width: 900px) 360px, 560px" priority />
              <span className="pj-callout pj-callout-a">server/session.ts · line 43</span>
              <span className="pj-callout pj-callout-b">Not in your files</span>
              <svg className="pj-leaders" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <path d="M16 22 L30 36" />
                <path d="M84 56 L67 69" />
              </svg>
            </figure>
          </div>
        </section>

        <ProjectStory />

        <section className="pj-scene h-wrap pj-trust">
          <h2>
            Built to be <em>checked.</em>
          </h2>
          <div>
            <article>
              <h3>Local first.</h3>
              <p>
                Your files and indexes stay on your device. Only short excerpts
                go to the model.
              </p>
            </article>
            <article>
              <h3>No made-up answers.</h3>
              <p>
                Nothing is invented or filled in from general knowledge. Gaps
                are shown as gaps.
              </p>
            </article>
            <article>
              <h3>You decide.</h3>
              <p>
                Your edits win over the model&rsquo;s suggestions, and every
                change keeps its history.
              </p>
            </article>
          </div>
        </section>

        <section className="pj-scene h-wrap pj-split pj-devices">
          <div>
            <h2>
              Build on the desktop.
              <br />
              <em>Carry it in your pocket.</em>
            </h2>
            <p>
              Read context on your phone, create projects, start Plans, or ask
              Vox by voice to open one. Your files and diagrams stay on the
              desktop.
            </p>
          </div>
          <div className="pj-device-art" aria-hidden="true">
            <Image
              src="/illustrations/dithered-mobile-transparent.png"
              alt=""
              width={1254}
              height={1254}
              sizes="(max-width: 700px) 120px, 170px"
            />
          </div>
        </section>

        <section className="pj-scene h-wrap pj-faq">
          <h2>A few things to know.</h2>
          <FaqAccordion items={faq} name="projects-faq" />
        </section>

        <section className="pj-scene h-wrap pj-final">
          <Image className="pj-final-art" src="/illustrations/dithered-lens-transparent.png" alt="" width={1254} height={1254} sizes="360px" aria-hidden="true" />
          <h2>
            Know your work <em>all the way down.</em>
          </h2>
          <p>
            Vox is in development. Join the waitlist and we will write once,
            when Projects is ready.
          </p>
          <Link className="h-btn" href="#join">
            Join the waitlist <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <small>
            <Check size={14} aria-hidden="true" /> One email. No spam.
          </small>
        </section>
      </main>
      <Footer />
    </div>
  );
}
