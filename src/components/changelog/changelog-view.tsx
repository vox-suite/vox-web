"use client";

import { ArrowUp, Sparkles } from "lucide-react";
import { Badge, Button, LinkButton } from "@/components/ui";
import { CHANGELOG_DATA } from "./changelog-data";

export function ChangelogView() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto max-w-[1200px] px-6 pb-24 pt-12 md:px-8">
      <header className="mb-16 max-w-3xl space-y-6">
        <Badge tone="accent">Platform Evolution & Changelog</Badge>
        <h1 className="text-heading-lg font-normal tracking-[0.22px] text-pure-white">
          Every milestone, measured.
        </h1>
        <p className="text-body-lg text-ash">
          Follow the engineering progress of Vox from zero-latency voice telephony and edge
          signal processing to autonomous multi-agent cognition and biometric security.
        </p>

        <div
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
          aria-label="Key Performance Indicators"
        >
          {[
            { val: "< 1ms", label: "Task Audio TTFA" },
            { val: "< 50ms", label: "Edge VAD Barge-In" },
            { val: "ResNet-34", label: "Neural Voice Biometrics" },
            { val: "200ms", label: "STT Endpoint Silence" },
            { val: "10+", label: "Autonomous DB Tools" },
            { val: "Multi-Channel", label: "Phone + WhatsApp" },
          ].map(({ val, label }) => (
            <div
              key={label}
              className="rounded-2xl border border-border-edge bg-ink p-4 shadow-subtle-3"
            >
              <div className="font-mono text-sm font-medium text-mist">{val}</div>
              <div className="mt-1 text-xs text-smoke">{label}</div>
            </div>
          ))}
        </div>
      </header>

      <div className="space-y-8">
        {CHANGELOG_DATA.map((item) => (
          <article key={item.id} id={item.id} className="scroll-mt-24">
            <div className="rounded-2xl border border-border-edge bg-ink p-6 shadow-subtle-3 md:p-8">
              <div className="mb-6 flex flex-wrap items-center gap-2">
                <Badge tone="accent">{item.version}</Badge>
                {item.subsystems.map((sub) => (
                  <Badge key={sub} variant="outline" className="font-mono">
                    {sub}
                  </Badge>
                ))}
                {item.metrics ? (
                  <Badge variant="secondary" className="ml-auto font-mono">
                    {item.metrics.label}: {item.metrics.value}
                  </Badge>
                ) : null}
              </div>

              <div className="mb-6 grid gap-4 md:grid-cols-[140px_1fr] md:items-start">
                <div className="relative space-y-1 border-l border-border-edge pl-4 font-mono text-xs">
                  <div className="text-mist">{item.formattedDate}</div>
                  <div className="changelog-relative-time text-smoke">{item.version}</div>
                  <span
                    className="absolute -left-1 top-1 size-2 rounded-full bg-coral-pulse"
                    aria-hidden="true"
                  />
                </div>
                <h2 className="text-heading-sm font-normal text-pure-white">{item.title}</h2>
              </div>

              <div className="space-y-6">
                <p className="text-ash">{item.summary}</p>

                {item.features.map((section, idx) => (
                  <div key={idx} className="space-y-3">
                    <h3 className="font-mono text-xs uppercase tracking-wide text-smoke">
                      {section.category}
                    </h3>
                    <ul className="space-y-2">
                      {section.items.map((feat, fIdx) => (
                        <li key={fIdx} className="text-sm text-ash">
                          <strong className="font-medium text-mist">{feat.title}</strong> —{" "}
                          {feat.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {item.highlight ? (
                  <div className="rounded-md border border-border-edge bg-obsidian px-4 py-4">
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-mist">
                      <Sparkles size={14} className="text-coral-pulse" aria-hidden="true" />
                      {item.highlight.title}
                    </span>
                    <p className="mt-2 text-sm text-ash">{item.highlight.description}</p>
                  </div>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>

      <footer className="mt-20 flex flex-wrap items-center justify-between gap-4 border-t border-border-edge pt-10">
        <LinkButton href="/" variant="secondary">
          ← Back to Vox home
        </LinkButton>
        <Button type="button" variant="ghost" onClick={scrollToTop}>
          <ArrowUp size={14} aria-hidden="true" />
          Back to top
        </Button>
      </footer>
    </div>
  );
}
