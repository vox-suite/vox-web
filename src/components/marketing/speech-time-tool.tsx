import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { VoxLogo } from "@/components/ui/vox-logo";
import { SpeechTimeCalculator } from "./speech-time-calculator";
import { COMMON_LENGTHS, FAQ, PACES } from "@/lib/speech-time";

export function SpeechTimeTool() {
  return (
    <div className="vox-landing">
      <header className="landing-header">
        <Link className="landing-brand" href="/" aria-label="Vox home">
          <VoxLogo size={40} className="header-logo" />
          <span>vox</span>
        </Link>
      </header>
      <main id="main" className="tool-main">
        <nav className="tool-crumbs" aria-label="Breadcrumb">
          <Link href="/">Vox</Link> / <span>Speech time calculator</span>
        </nav>
        <h1>Speech time calculator</h1>
        <p className="tool-lede">
          Paste your script and see how long it takes to speak. Free, instant,
          no signup.
        </p>
        <SpeechTimeCalculator />

        <section>
          <h2>How many words for a speech of every length</h2>
          <div className="tool-table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Speech length</th>
                  {PACES.map((p) => (
                    <th key={p.id} scope="col">
                      {p.label} ({p.wpm} wpm)
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMMON_LENGTHS.map((min) => (
                  <tr key={min}>
                    <th scope="row">{min} min</th>
                    {PACES.map((p) => (
                      <td key={p.id}>{(min * p.wpm).toLocaleString()} words</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="tool-cta">
          <h2>Practise it out loud, on a phone call</h2>
          <p>
            Call Vox, talk through your speech, and let it set the reminders
            and follow-ups so your prep keeps moving after you hang up.
          </p>
          <Link className="landing-button" href="/#follow-through">
            Try Vox
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </section>

        <section>
          <h2>Speech time questions</h2>
          {FAQ.map(({ q, a }) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </section>

        <p className="tool-note">
          Learn how <Link href="/">Vox works</Link> or read the{" "}
          <Link href="/privacy-policy">privacy policy</Link>.
        </p>
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
