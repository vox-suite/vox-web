import Link from "next/link";
import { Header, Footer } from "@/components/home/home-page";
import "./secondary-pages.css";

export interface LegalSection {
  heading: string;
  paragraphs: string[];
  items?: string[];
}

function sectionId(heading: string) {
  return heading.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function LegalPage({ title, updated, intro, sections }: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <div className="vox-home vx-secondary">
      <Header />
      <main id="main" className="h-wrap vx-legal" tabIndex={-1}>
        <div className="vx-legal-intro">
          <h1>{title}</h1>
          <p className="vx-updated">Last updated {updated}</p>
          <p>{intro}</p>
          <nav className="vx-legal-switch" aria-label="Legal documents">
            <Link href="/privacy-policy" aria-current={title === "Privacy policy" ? "page" : undefined}>Privacy policy</Link>
            <Link href="/terms-of-service" aria-current={title === "Terms of service" ? "page" : undefined}>Terms of service</Link>
          </nav>
        </div>
        <div className="vx-legal-layout">
          <nav className="vx-contents" aria-label="On this page">
            <p>On this page</p>
            {sections.map(section => <a key={section.heading} href={`#${sectionId(section.heading)}`}>{section.heading}</a>)}
          </nav>
          <article className="vx-legal-body" aria-label={title}>
            {sections.map(section => (
              <section key={section.heading} id={sectionId(section.heading)}>
                <h2>{section.heading}</h2>
                {section.paragraphs.map(text => <p key={text}>{text}</p>)}
                {section.items && <ul>{section.items.map(item => <li key={item}>{item}</li>)}</ul>}
              </section>
            ))}
            <a className="vx-back-top" href="#main">Back to top ↑</a>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
