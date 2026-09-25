import type { ReactNode } from "react";
import {
  ArrowRight,
  AudioLines,
  CalendarCheck,
  Check,
  CheckCheck,
  ListChecks,
  Phone,
  PhoneCall,
  ShieldCheck,
  Terminal,
  Activity,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { CHANGELOG_DATA } from "@/components/changelog/changelog-data";
import { cn } from "@/lib/utils";
import { ConversationDemo } from "./demo";
import { VoxLogo } from "@/components/ui/vox-logo";

const latestReleases = CHANGELOG_DATA.slice(0, 3);

function Block({
  id,
  children,
  className,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "relative mx-auto w-full max-w-[1200px] scroll-mt-24 px-6 md:px-10",
        className,
      )}
    >
      {children}
    </section>
  );
}

// ---------------------------------------------------------------------------
// 1. HERO SECTION (Selecta Layout on Raycast Dark Token System)
// ---------------------------------------------------------------------------

export function Hero() {
  return (
    <section className="relative overflow-x-clip border-b border-[#232427] pt-28 pb-20 md:pt-36 md:pb-28">
      {/* Background technical radial aura */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_40%_at_50%_35%,rgba(255,99,99,0.08)_0%,rgba(4,5,6,0)_70%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex max-w-[1200px] flex-col items-center px-6 text-center md:px-10">
        {/* Eyebrow Micro-Badge */}
        <div className="inline-flex items-center gap-2.5 rounded-md border border-[#2f3031] bg-[#07080a] px-2.5 py-1 shadow-sm">
          <span className="rounded bg-mist px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-iron">
            NEW
          </span>
          <span className="font-mono text-[11px] uppercase tracking-widest text-smoke">
            WORKFLOW AUTOMATION
          </span>
        </div>

        {/* Hero Headline */}
        <h1 className="mt-8 max-w-[900px] text-balance font-display text-[clamp(2.5rem,6vw,4.75rem)] font-semibold leading-[1.04] tracking-[-0.035em] text-pure-white">
          Security &amp; Approvals for{" "}
          <span className="bg-gradient-to-b from-pure-white via-mist to-ash/60 bg-clip-text text-transparent">
            AI-Driven Workflows
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-6 max-w-[620px] text-balance text-[17px] leading-relaxed text-ash md:text-[18px]">
          Centralize approvals, enforce security policies, and keep AI systems
          compliant across every operation.
        </p>

        {/* Dual CTA Button Pair */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/request-access"
            className="btn-primary-mist inline-flex h-11 items-center justify-center px-6 text-[14px] font-medium"
          >
            Book free Demo
          </Link>
          <Link
            href="#demo"
            className="btn-secondary-obsidian inline-flex h-11 items-center justify-center px-6 text-[14px] font-medium"
          >
            Try it now
          </Link>
        </div>

        {/* Focal Hero Graphic: Dithered Acoustic Wave & Dot-Matrix Sphere */}
        <div className="relative mt-16 w-full max-w-[820px]">
          {/* Construction border & crosshair ticks */}
          <div className="relative rounded-2xl border border-[#232427] bg-[#07080a]/60 p-4 backdrop-blur-sm md:p-8">
            {/* Top-Left & Top-Right Crosshairs */}
            <span className="absolute -left-2 -top-2 font-mono text-[12px] text-[#454647]">+</span>
            <span className="absolute -right-2 -top-2 font-mono text-[12px] text-[#454647]">+</span>
            <span className="absolute -bottom-2 -left-2 font-mono text-[12px] text-[#454647]">+</span>
            <span className="absolute -bottom-2 -right-2 font-mono text-[12px] text-[#454647]">+</span>

            {/* Live Activity Telemetry Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#232427] pb-4 text-left font-mono text-[12px]">
              <div className="flex items-center gap-2">
                <span className="inline-block size-2 rounded-full bg-success-green animate-pulse" />
                <span className="font-semibold uppercase tracking-wider text-pure-white">
                  ACTIVITY LOGS
                </span>
                <span className="text-smoke">live</span>
              </div>
              <div className="text-smoke">
                08:18:27 · Device bridge connected — remote control ready
              </div>
            </div>

            {/* Dithered Radial Halftone Waveform Container */}
            <div className="relative my-8 flex flex-col items-center justify-center overflow-hidden py-10">
              {/* Halftone concentric particle rings SVG */}
              <svg
                viewBox="0 0 600 240"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full max-w-[540px] text-mist/30"
              >
                <path
                  d="M50 200 C 150 40, 450 40, 550 200"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="4 6"
                  opacity="0.4"
                />
                <path
                  d="M80 200 C 170 70, 430 70, 520 200"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray="6 8"
                  opacity="0.6"
                />
                <path
                  d="M120 200 C 190 100, 410 100, 480 200"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray="4 10"
                  opacity="0.8"
                />
                <path
                  d="M160 200 C 220 125, 380 125, 440 200"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeDasharray="3 8"
                  opacity="0.9"
                />
                <path
                  d="M200 200 C 240 145, 360 145, 400 200"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray="2 6"
                  opacity="1"
                />
              </svg>

              {/* Center Dot-Matrix Animated Sphere */}
              <div className="absolute top-1/2 -translate-y-1/2">
                <VoxLogo size={96} animated state="composing" speed={0.5} />
              </div>

              {/* Tactile talk trigger overlay */}
              <div className="absolute bottom-2 flex items-center gap-2 rounded-full border border-[#2f3031] bg-[#111214]/90 px-4 py-1.5 shadow-md">
                <AudioLines size={15} className="text-coral-pulse" />
                <span className="font-mono text-[12px] text-pure-white">
                  Talk to Vox · &lt; 180ms duplex stream
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 2. SOCIAL PROOF & LOGO BAR (Reference Architecture)
// ---------------------------------------------------------------------------

export function SocialProofBar() {
  const partners = [
    { name: "Juicebox", glyph: "◇ Juicebox" },
    { name: "valley", glyph: "✱ valley" },
    { name: "Hadrius", glyph: "❖ Hadrius" },
    { name: "Sameday.", glyph: "Sameday." },
    { name: "BuySellAds", glyph: "BuySellAds" },
    { name: "intangible", glyph: "intangible" },
  ];

  return (
    <div className="border-b border-[#232427] bg-[#040506] py-14">
      <div className="mx-auto max-w-[1200px] px-6 text-center md:px-10">
        <p className="font-mono text-[12px] uppercase tracking-widest text-smoke">
          Trusted by industry leaders
        </p>
        <div className="mt-8 grid grid-cols-2 items-center justify-items-center gap-8 sm:grid-cols-3 md:grid-cols-6">
          {partners.map(({ name, glyph }) => (
            <div
              key={name}
              className="text-[16px] font-semibold tracking-tight text-ash/70 transition-colors duration-200 hover:text-pure-white"
            >
              {glyph}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. BENEFITS & 3-COLUMN BENTO GRID (Copied Layout Principles from Screenshot)
// ---------------------------------------------------------------------------

export function BenefitsGrid() {
  const cards = [
    {
      category: "WORKFLOW AUTOMATION",
      title: "Centralized approvals for AI workflows",
      description:
        "Submit, track, and approve requests across teams with clear ownership and full auditability.",
      // Isometric Dithered 3D Cube / Crystal
      icon: (
        <svg
          viewBox="0 0 100 100"
          className="size-24 text-mist"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Isometric top facet */}
          <polygon
            points="50,15 80,32 50,49 20,32"
            fill="currentColor"
            opacity="0.85"
          />
          {/* Isometric left facet with stipple dots */}
          <polygon
            points="20,32 50,49 50,85 20,68"
            fill="currentColor"
            opacity="0.45"
          />
          {/* Isometric right facet */}
          <polygon
            points="50,49 80,32 80,68 50,85"
            fill="currentColor"
            opacity="0.65"
          />
          {/* Floating stipple particles */}
          <circle cx="28" cy="22" r="1.5" fill="currentColor" opacity="0.4" />
          <circle cx="72" cy="78" r="1.5" fill="currentColor" opacity="0.5" />
          <circle cx="85" cy="42" r="1.5" fill="currentColor" opacity="0.3" />
        </svg>
      ),
    },
    {
      category: "SECURITY & GOVERNANCE",
      title: "Built-in security and policy enforcement",
      description:
        "Apply consistent security controls and approval rules across all AI-powered processes.",
      // Grooved Dithered Radar Disc / Cylinder
      icon: (
        <svg
          viewBox="0 0 100 100"
          className="size-24 text-mist"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Concentric grooved disc ellipses */}
          <ellipse cx="50" cy="40" rx="36" ry="18" fill="currentColor" opacity="0.85" />
          <ellipse cx="50" cy="40" rx="26" ry="13" fill="#07080a" />
          <ellipse cx="50" cy="40" rx="16" ry="8" fill="currentColor" opacity="0.7" />
          <ellipse cx="50" cy="40" rx="6" ry="3" fill="#07080a" />
          {/* Cylinder extrusion base */}
          <path
            d="M14 40 C 14 58, 86 58, 86 40 L 86 54 C 86 72, 14 72, 14 54 Z"
            fill="currentColor"
            opacity="0.5"
          />
        </svg>
      ),
    },
    {
      category: "VISIBILITY & CONTROL",
      title: "Real-time oversight across operations",
      description:
        "Monitor activity, surface risks, and maintain control as AI systems evolve and scale.",
      // 3D Dithered Crosshair / Plus Glyph
      icon: (
        <svg
          viewBox="0 0 100 100"
          className="size-24 text-mist"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Isometric crosshair block */}
          <rect x="42" y="16" width="16" height="68" rx="2" fill="currentColor" opacity="0.75" />
          <rect x="16" y="42" width="68" height="16" rx="2" fill="currentColor" opacity="0.75" />
          {/* Center highlight facet */}
          <rect x="42" y="42" width="16" height="16" fill="currentColor" opacity="0.95" />
          {/* Stipple dot ring */}
          <circle cx="50" cy="50" r="32" stroke="currentColor" strokeDasharray="2 4" strokeWidth="1.5" opacity="0.4" />
        </svg>
      ),
    },
  ];

  return (
    <section id="capabilities" className="border-b border-[#232427] py-24 md:py-32">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10">
        {/* Section Header */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 rounded border border-[#2f3031] bg-[#07080a] px-2.5 py-1 text-[11px] font-mono uppercase tracking-widest text-ash">
            <span className="size-1.5 bg-coral-pulse rounded-sm" />
            BENEFITS
          </div>
          <h2 className="mt-4 max-w-[680px] font-display text-[clamp(1.85rem,3.8vw,2.75rem)] font-semibold leading-tight tracking-[-0.025em] text-pure-white">
            Join modern teams managing AI operations with confidence
          </h2>
        </div>

        {/* 3-Column Architectural Matrix */}
        <div className="grid border border-[#232427] md:grid-cols-3">
          {cards.map((card, idx) => (
            <div
              key={card.category}
              className={cn(
                "relative flex flex-col justify-between bg-[#07080a] p-8 transition-colors duration-200 hover:bg-[#111214] md:p-10",
                idx !== 0 && "border-t border-[#232427] md:border-t-0 md:border-l",
              )}
            >
              {/* Category Pill Tag */}
              <div className="inline-flex items-center self-start rounded border border-[#2f3031] bg-[#111214] px-2.5 py-0.5 font-mono text-[10px] tracking-wider text-smoke">
                {card.category}
              </div>

              {/* Centered Dithered 3D Illustration */}
              <div className="my-12 flex h-36 items-center justify-center">
                {card.icon}
              </div>

              {/* Bottom Content Group */}
              <div>
                <h3 className="font-display text-[20px] font-semibold leading-snug tracking-[-0.015em] text-pure-white">
                  {card.title}
                </h3>
                <p className="mt-3 text-[14px] leading-relaxed text-ash">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 4. INTERACTIVE LIVE CONVERSATION DEMO
// ---------------------------------------------------------------------------

export function DemoSection() {
  return (
    <Block id="demo" className="border-b border-[#232427] py-20 md:py-28">
      <div className="mb-12 max-w-[34rem]">
        <div className="inline-flex items-center gap-2 rounded border border-[#2f3031] bg-[#07080a] px-2.5 py-1 text-[11px] font-mono uppercase tracking-widest text-ash">
          <span className="size-1.5 bg-success-green rounded-sm" />
          INTERACTIVE COCKPIT
        </div>
        <h2 className="mt-4 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold tracking-[-0.025em] text-pure-white">
          Talk naturally. Vox keeps the thread.
        </h2>
        <p className="mt-3 text-[16px] leading-relaxed text-ash">
          A conversation starts with spoken intent and ends with verified tasks,
          a durable record, and automatic follow-up.
        </p>
      </div>
      <div className="rounded-2xl border border-[#232427] bg-[#07080a] p-4 md:p-8">
        <ConversationDemo />
      </div>
    </Block>
  );
}

// ---------------------------------------------------------------------------
// 5. RELEASES & CHANGELOG SECTION
// ---------------------------------------------------------------------------

export function LatestSection() {
  return (
    <Block id="recently-shipped" className="border-b border-[#232427] py-20 md:py-28">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded border border-[#2f3031] bg-[#07080a] px-2.5 py-1 text-[11px] font-mono uppercase tracking-widest text-ash">
            TELEMETRY
          </div>
          <h2 className="mt-4 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold tracking-[-0.025em] text-pure-white">
            Built in public, release by release.
          </h2>
          <p className="mt-2 text-[15px] text-ash">
            Each version below is live on the bridge and desktop clients.
          </p>
        </div>
        <Link
          href="/changelog"
          className="btn-secondary-obsidian inline-flex h-10 items-center gap-2 px-4 text-[13px]"
        >
          Read the changelog
        </Link>
      </div>

      <div className="mt-10 divide-y divide-[#232427] border-y border-[#232427]">
        {latestReleases.map((release) => (
          <article
            key={release.id}
            className="grid gap-3 py-6 md:grid-cols-[140px_minmax(0,1fr)_auto] md:gap-10"
          >
            <div className="flex gap-3 font-mono text-[12px] text-smoke md:flex-col md:gap-0.5">
              <span className="font-semibold text-mist">{release.version}</span>
              <time dateTime={release.date}>{release.formattedDate}</time>
            </div>
            <div className="min-w-0">
              <h3 className="text-[16px] font-medium tracking-[-0.01em] text-pure-white">
                {release.title}
              </h3>
            </div>
            <Link
              href={`/changelog#${release.id}`}
              className="inline-flex h-8 items-center gap-1.5 self-start text-[13px] text-ash transition-colors hover:text-pure-white"
            >
              Release notes
              <ArrowRight size={13} aria-hidden="true" />
            </Link>
          </article>
        ))}
      </div>
    </Block>
  );
}

// ---------------------------------------------------------------------------
// 6. CLOSING CTA SECTION
// ---------------------------------------------------------------------------

export function ClosingSection() {
  return (
    <section className="relative overflow-x-clip py-24 md:py-32">
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-full bg-[radial-gradient(50%_60%_at_50%_100%,rgba(255,99,99,0.06),transparent_70%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto flex max-w-[1200px] flex-col items-center px-6 text-center md:px-10">
        <h2 className="max-w-[18ch] font-display text-[clamp(2.25rem,5vw,3.75rem)] font-semibold leading-[1.05] tracking-[-0.035em] text-pure-white text-balance">
          Centralize approvals. Automate with confidence.
        </h2>
        <p className="mt-5 text-[17px] text-ash">
          Vox connects conversation to autonomous workflow execution.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/request-access"
            className="btn-primary-mist inline-flex h-11 items-center justify-center px-6 text-[14px] font-medium"
          >
            Book free Demo
          </Link>
          <Link
            href="/changelog"
            className="btn-secondary-obsidian inline-flex h-11 items-center justify-center px-6 text-[14px] font-medium"
          >
            Follow the build
          </Link>
        </div>
      </div>
    </section>
  );
}

// Retaining exports for backward compatibility if referenced elsewhere
export const FollowThroughSection = BenefitsGrid;
export const FeatureSection = BenefitsGrid;
export const StorySection = DemoSection;
export const PrinciplesSection = BenefitsGrid;
