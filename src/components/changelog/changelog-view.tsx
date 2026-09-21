"use client";

import { ArrowUp, Sparkles } from "lucide-react";
import { Badge, LinkButton } from "@/components/ui";
import { CHANGELOG_DATA } from "./changelog-data";

export function ChangelogView() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="changelog-page">
      <header className="changelog-hero">
        <Badge tone="accent">Platform Evolution & Changelog</Badge>
        <h1>Every milestone, measured.</h1>
        <p>
          Follow the engineering progress of Vox from zero-latency voice
          telephony and edge signal processing to autonomous multi-agent
          cognition and biometric security.
        </p>

        <div
          className="changelog-metrics"
          aria-label="Key Performance Indicators"
        >
          <div className="changelog-metric-card">
            <div className="changelog-metric-val">&lt; 1ms</div>
            <div className="changelog-metric-label">Task Audio TTFA</div>
          </div>
          <div className="changelog-metric-card">
            <div className="changelog-metric-val">&lt; 50ms</div>
            <div className="changelog-metric-label">Edge VAD Barge-In</div>
          </div>
          <div className="changelog-metric-card">
            <div className="changelog-metric-val">ResNet-34</div>
            <div className="changelog-metric-label">
              Neural Voice Biometrics
            </div>
          </div>
          <div className="changelog-metric-card">
            <div className="changelog-metric-val">200ms</div>
            <div className="changelog-metric-label">STT Endpoint Silence</div>
          </div>
          <div className="changelog-metric-card">
            <div className="changelog-metric-val">10+</div>
            <div className="changelog-metric-label">Autonomous DB Tools</div>
          </div>
          <div className="changelog-metric-card">
            <div className="changelog-metric-val">Multi-Channel</div>
            <div className="changelog-metric-label">Phone + WhatsApp</div>
          </div>
        </div>
      </header>

      <div className="changelog-timeline">
        {CHANGELOG_DATA.map((item) => (
          <article key={item.id} className="changelog-item" id={item.id}>
            <div className="changelog-date-col">
              <div className="changelog-date">{item.formattedDate}</div>
              <div className="changelog-relative-time">{item.version}</div>
              <span className="changelog-dot" aria-hidden="true" />
            </div>

            <div className="changelog-card">
              <header className="changelog-card-header">
                <div className="changelog-tags">
                  <span className="ui-badge" data-tone="accent">
                    {item.version}
                  </span>
                  {item.subsystems.map((sub) => (
                    <span
                      key={sub}
                      className="changelog-subsystem-badge"
                      data-subsystem={sub}
                    >
                      {sub}
                    </span>
                  ))}
                  {item.metrics && (
                    <span
                      style={{
                        marginLeft: "auto",
                        fontFamily: "var(--font-button)",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        color: "#4f46e5",
                        background: "#f5f3ff",
                        padding: "0.2rem 0.6rem",
                        border: "1px solid #ddd6fe",
                        borderRadius: "4px",
                      }}
                    >
                      {item.metrics.label}: {item.metrics.value}
                    </span>
                  )}
                </div>

                <h2 className="changelog-title">{item.title}</h2>
                <p className="changelog-summary">{item.summary}</p>
              </header>

              {item.features.map((section, idx) => (
                <div key={idx} className="changelog-section-group">
                  <h3 className="changelog-section-title">
                    {section.category}
                  </h3>
                  <ul className="changelog-bullets">
                    {section.items.map((feat, fIdx) => (
                      <li key={fIdx} className="changelog-bullet">
                        <strong>{feat.title}</strong> — {feat.description}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {item.highlight && (
                <div className="changelog-highlight-banner">
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                  >
                    <Sparkles
                      size={14}
                      style={{ color: "#6366f1" }}
                      aria-hidden="true"
                    />
                    {item.highlight.title}
                  </span>
                  <p>{item.highlight.description}</p>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      <footer
        style={{
          marginTop: "5rem",
          paddingTop: "2.5rem",
          borderTop: "1px solid var(--color-line)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <LinkButton href="/" variant="secondary">
          ← Back to Vox home
        </LinkButton>
        <button
          type="button"
          onClick={scrollToTop}
          className="ui-button"
          data-variant="ghost"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          <ArrowUp size={14} aria-hidden="true" />
          Back to top
        </button>
      </footer>
    </div>
  );
}
