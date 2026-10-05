import Link from "next/link";
import { VoxLogo } from "@/components/ui/vox-logo";

export interface LegalSection {
  heading: string;
  paragraphs: string[];
  items?: string[];
}

export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <div className="vox-landing">
      <header className="landing-header">
        <Link className="landing-brand" href="/" aria-label="Vox home">
          <VoxLogo size={40} className="header-logo" />
          <span>vox</span>
        </Link>
      </header>
      <main id="main" className="legal-main">
        <h1>{title}</h1>
        <p className="legal-updated">Last updated {updated}</p>
        <p>{intro}</p>
        {sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((text) => (
              <p key={text}>{text}</p>
            ))}
            {section.items && (
              <ul>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </main>
      <footer className="landing-footer">
        <Link className="landing-brand" href="/" aria-label="Vox home">
          <VoxLogo size={25} />
          <span>vox</span>
        </Link>
        <p>Work keeps moving.</p>
        <Link href="/privacy-policy">Privacy policy</Link>
        <Link href="/terms-of-service">Terms of service</Link>
        <span>© {new Date().getFullYear()} Vox</span>
      </footer>
    </div>
  );
}
