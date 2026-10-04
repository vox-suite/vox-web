import Link from "next/link";
import { ACCESS_HREF } from "@/lib/site";
import { HeroAura } from "./hero-aura";

const manifesto =
  "You shouldn’t need another app to run your day. Say what’s on your mind. Vox makes it durable — tasks, calendar changes, reminders, follow-ups — and keeps it moving after you hang up.";

export function Hero() {
  return (
    <section className="hero-track">
      <div className="hero-pin">
        <div className="hero-zoom">
          <HeroAura />
        </div>
        <div className="grain" aria-hidden="true" />
        <div className="hero-bars" aria-hidden="true" />

        <div className="hero-ui">
          <div className="hero-card-slot">
            <div className="aura-card">
              <div className="aura-card-line">
                <span className="aura-plus">+</span>
                <span>Move my 3 PM to Thursday</span>
                <span className="aura-send">↗</span>
              </div>
              <div className="aura-pills">
                <span>Calendar updated</span>
                <span>Follow-up scheduled</span>
              </div>
              <p className="aura-note">Illustrative</p>
            </div>
            <span className="aura-label" aria-hidden="true">V O X</span>
          </div>
          <div className="hero-copy">
            <div>
              <h1 className="text-[clamp(2.75rem,7.5vw,7rem)] leading-[0.96] tracking-[-0.045em]">
                <span className="ln">
                  <span style={{ "--i": 0 } as React.CSSProperties}>Call once.</span>
                </span>
                <span className="ln">
                  <span style={{ "--i": 1 } as React.CSSProperties}>
                    Work <em className="italic text-coral">keeps moving.</em>
                  </span>
                </span>
              </h1>
              <div
                className="fade-in mt-8 flex flex-wrap items-center gap-4"
                style={{ "--i": 3 } as React.CSSProperties}
              >
                <Link href={ACCESS_HREF} className="btn-pill-primary">
                  Request access ▸
                </Link>
                <Link href="#follow-through" className="btn-pill-ghost">
                  Watch a call unfold
                </Link>
              </div>
            </div>
            <p
              className="fade-in max-w-[380px] text-[15px] leading-[1.5]"
              style={{ "--i": 2 } as React.CSSProperties}
            >
              A chief of staff you reach on a real phone call. It turns what you say into tasks,
              calendar changes and follow-ups, and calls you back when something needs you.
            </p>
          </div>
        </div>

        <div className="title-card" aria-hidden="true">
          <span>VOX</span>
        </div>
      </div>

      <div className="manifesto-stage">
        <p>
          {manifesto.split(" ").map((word, i) => (
            <span className="w" key={i} style={{ "--i": i } as React.CSSProperties}>
              {word}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
