"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  ArrowUp,
  Cpu,
  Fingerprint,
  Layers,
  Phone,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";
import { Badge, LinkButton } from "@/components/ui";
import { CHANGELOG_DATA, type ChangelogItem } from "./changelog-data";

export function ChangelogView() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = [
    { id: "all", label: "All updates", icon: Layers },
    { id: "voice", label: "Voice Telephony", icon: Phone },
    { id: "core", label: "Core AI & Tools", icon: Cpu },
    { id: "biometrics", label: "Voice Biometrics", icon: Fingerprint },
    { id: "web", label: "Web & Admin", icon: Activity },
    { id: "infra", label: "Infrastructure", icon: Zap },
  ];

  const filteredItems = useMemo(() => {
    return CHANGELOG_DATA.filter((item: ChangelogItem) => {
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const inTitle = item.title.toLowerCase().includes(q);
      const inSummary = item.summary.toLowerCase().includes(q);
      const inVersion = item.version.toLowerCase().includes(q);
      const inDate = item.date.toLowerCase().includes(q) || item.formattedDate.toLowerCase().includes(q);
      const inTags = item.tags.some((t) => t.toLowerCase().includes(q));
      const inSubsystems = item.subsystems.some((s) => s.toLowerCase().includes(q));
      const inFeatures = item.features.some((f) =>
        f.items.some(
          (sub) =>
            sub.title.toLowerCase().includes(q) ||
            sub.description.toLowerCase().includes(q)
        )
      );

      return inTitle || inSummary || inVersion || inDate || inTags || inSubsystems || inFeatures;
    });
  }, [selectedCategory, searchQuery]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="changelog-page">
      {/* Hero Header */}
      <header className="changelog-hero">
        <Badge tone="accent">Platform Evolution & Changelog</Badge>
        <h1>Every milestone, measured.</h1>
        <p>
          Follow the engineering progress of Vox from zero-latency voice telephony and edge
          signal processing to autonomous multi-agent cognition and biometric security.
        </p>

        {/* Global Key Latency & Architecture Highlights */}
        <div className="changelog-metrics" aria-label="Key Performance Indicators">
          <div className="changelog-metric-card">
            <div className="changelog-metric-val">&lt; 1ms</div>
            <div className="changelog-metric-label">Task Audio TTFA</div>
          </div>
          <div className="changelog-metric-card">
            <div className="changelog-metric-val">&lt; 50ms</div>
            <div className="changelog-metric-label">Edge VAD Barge-In</div>
          </div>
          <div className="changelog-metric-card">
            <div className="changelog-metric-val">192-dim</div>
            <div className="changelog-metric-label">Mel Voice Biometrics</div>
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

      {/* Filter and Search Bar */}
      <div className="changelog-controls" role="region" aria-label="Filter changelog">
        <div className="changelog-filter-tabs">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                className="changelog-tab-btn"
                aria-pressed={isSelected}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                  <Icon size={13} aria-hidden="true" />
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="changelog-search">
          <div style={{ position: "relative" }}>
            <input
              type="search"
              placeholder="Search features, VAD, TTFA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search changelog entries"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  right: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--color-muted)",
                  fontSize: "12px",
                  padding: "4px",
                }}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Timeline Entries */}
      {filteredItems.length === 0 ? (
        <div
          style={{
            padding: "4rem 2rem",
            textAlign: "center",
            border: "1px dashed var(--color-line)",
            background: "var(--color-soft)",
          }}
        >
          <Search size={32} style={{ color: "var(--color-muted)", margin: "0 auto 1rem" }} />
          <h2 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>No matching releases found</h2>
          <p style={{ color: "var(--color-muted)", fontSize: "0.9rem" }}>
            Try searching for other terms such as &ldquo;VAD&rdquo;, &ldquo;streaming&rdquo;, &ldquo;biometrics&rdquo;, or reset the category filter.
          </p>
          <button
            type="button"
            className="ui-button"
            data-variant="secondary"
            style={{ marginTop: "1.25rem" }}
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="changelog-timeline">
          {filteredItems.map((item) => (
            <article key={item.id} className="changelog-item" id={item.id}>
              {/* Left Date Rail */}
              <div className="changelog-date-col">
                <div className="changelog-date">{item.formattedDate}</div>
                <div className="changelog-relative-time">{item.version}</div>
                <span className="changelog-dot" aria-hidden="true" />
              </div>

              {/* Right Content Card */}
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

                {/* Feature Categories */}
                {item.features.map((section, idx) => (
                  <div key={idx} className="changelog-section-group">
                    <h3 className="changelog-section-title">{section.category}</h3>
                    <ul className="changelog-bullets">
                      {section.items.map((feat, fIdx) => (
                        <li key={fIdx} className="changelog-bullet">
                          <strong>{feat.title}</strong> — {feat.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {/* Optional Highlight Callout */}
                {item.highlight && (
                  <div className="changelog-highlight-banner">
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                      <Sparkles size={14} style={{ color: "#6366f1" }} aria-hidden="true" />
                      {item.highlight.title}
                    </span>
                    <p>{item.highlight.description}</p>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Footer Navigation Strip */}
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
          style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
        >
          <ArrowUp size={14} aria-hidden="true" />
          Back to top
        </button>
      </footer>
    </div>
  );
}
