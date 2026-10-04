import Link from "next/link";
import { Menu } from "lucide-react";
import { Brand } from "@/components/ui";
import { AnnouncementBar } from "./announcement-bar";
import { ThemeToggle } from "./theme-toggle";

const navLinks = [
  { href: "/#follow-through", label: "How it works" },
  { href: "/#capabilities", label: "Capabilities" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/#principles", label: "Principles" },
  { href: "/changelog", label: "Changelog" },
];

export function SiteHeader() {
  return (
    <>
      <AnnouncementBar />
      <header className="sticky top-0 z-40 flex w-full justify-center border-b border-ash dark:border-[#2c2a27] bg-parchment/90 dark:bg-[#141312]/90 backdrop-blur-md transition-colors">
        <div className="mx-auto flex h-20 w-full max-w-[1432px] items-center justify-between px-6 md:px-12">
          {/* Logo & Mark */}
          <div className="flex items-center gap-3">
            <Brand animated size={24} />
            <div className="flex items-center gap-2">
              <span className="inline-block size-1.5 rounded-full bg-lake-blue dark:bg-[#3d6cf0]" aria-hidden="true" />
              <span className="font-mono text-[11px] uppercase tracking-wider text-smoke dark:text-[#7b7773]">
                v0.2.0
              </span>
            </div>
          </div>

          {/* Navigation Links in Mono Uppercase */}
          <nav
            className="hidden items-center gap-8 font-mono text-[13px] uppercase tracking-[-0.02em] font-medium text-graphite dark:text-[#aba7a2] lg:flex"
            aria-label="Main navigation"
          >
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                className="transition-colors hover:text-off-black dark:hover:text-[#f6f3f1]"
                href={href}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Action Area: Theme Toggle + Ghost + Lake Blue Pill */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            <Link
              href="/pipeline"
              className="hidden sm:inline-flex btn-pill-ghost !h-10 !px-5 !text-[12px]"
            >
              Pipeline
            </Link>

            <Link
              href="/request-access"
              className="btn-pill-lake !h-10 !px-6 !text-[12px] group"
            >
              <span>Get Access</span>
              <span className="ml-1 transition-transform group-hover:translate-x-0.5" aria-hidden="true">
                ▸
              </span>
            </Link>

            {/* Mobile Menu */}
            <details className="group relative lg:hidden">
              <summary
                className="flex size-10 cursor-pointer list-none items-center justify-center rounded-full border border-ash dark:border-[#2c2a27] bg-parchment dark:bg-card text-off-black dark:text-[#f6f3f1] [&::-webkit-details-marker]:hidden"
                aria-label="Open menu"
              >
                <Menu size={16} aria-hidden="true" />
              </summary>
              <nav
                className="absolute right-0 top-[calc(100%+8px)] flex w-56 flex-col rounded-[24px] border border-ash dark:border-[#2c2a27] bg-parchment dark:bg-[#1c1b19] p-3 shadow-xl backdrop-blur-xl"
                aria-label="Mobile navigation"
              >
                {navLinks.map(({ href, label }) => (
                  <Link
                    key={label}
                    href={href}
                    className="flex min-h-11 items-center rounded-xl px-3 font-mono text-[13px] uppercase tracking-[-0.02em] text-graphite dark:text-[#aba7a2] transition-colors hover:bg-black/5 dark:hover:bg-white/5 hover:text-off-black dark:hover:text-white"
                  >
                    {label}
                  </Link>
                ))}
                <div className="my-2 h-px bg-ash/50 dark:bg-white/10" />
                <Link
                  href="/request-access"
                  className="btn-pill-lake !h-10 !w-full justify-center !text-[12px]"
                >
                  Request Access ▸
                </Link>
              </nav>
            </details>
          </div>
        </div>
      </header>
    </>
  );
}

const footerColumns = [
  {
    title: "Intelligence",
    links: [
      { href: "/#follow-through", label: "How it works" },
      { href: "/#capabilities", label: "Capabilities" },
      { href: "/pipeline", label: "Pipeline architecture" },
      { href: "/#principles", label: "Our principles" },
      { href: "/changelog", label: "Changelog" },
      { href: "/request-access", label: "Request access" },
    ],
  },
  {
    title: "System",
    links: [
      { href: "/privacy-policy", label: "Privacy policy" },
      { href: "/terms-of-service", label: "Terms of service" },
      { href: "#main", label: "Back to top" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-ash dark:border-[#2c2a27] bg-parchment dark:bg-[#141312] transition-colors">
      <div className="mx-auto max-w-[1432px] px-6 md:px-12">
        <div className="grid gap-12 py-16 md:grid-cols-[minmax(0,1fr)_auto] md:py-24">
          <div className="max-w-sm space-y-4">
            <div className="flex items-center gap-3">
              <Brand animated={false} size={26} />
              <span className="font-serif text-[22px] text-off-black dark:text-[#f6f3f1]">
                Vox
              </span>
            </div>
            <p className="font-mono text-[14px] leading-relaxed text-graphite dark:text-[#aba7a2]">
              Your chief of staff, on speed dial. Natural voice communication, continuous memory, and proactive execution.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-ash dark:border-[#2c2a27] bg-white/40 dark:bg-white/5 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-graphite dark:text-[#aba7a2]">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                SYSTEM STATUS: OPTIMAL
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-16 gap-y-10">
            {footerColumns.map(({ title, links }) => (
              <div key={title} className="flex flex-col">
                <p className="mb-4 font-serif text-[18px] text-off-black dark:text-[#f6f3f1]">
                  {title}
                </p>
                {links.map(({ href, label }) => (
                  <Link
                    key={label}
                    href={href}
                    className="flex min-h-8 items-center font-mono text-[13px] uppercase tracking-[-0.02em] text-smoke dark:text-[#7b7773] transition-colors hover:text-off-black dark:hover:text-[#f6f3f1]"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-ash dark:border-[#2c2a27] py-8 font-mono text-[12px] uppercase tracking-wider text-smoke dark:text-[#7b7773]">
          <span>&copy; {new Date().getFullYear()} Vox Intelligence · Vox Architecture</span>
          <span className="hidden sm:inline">Typeset in Untitled Serif &amp; Diatype Mono</span>
          <span>Telephone &amp; WhatsApp Architecture</span>
        </div>
      </div>
    </footer>
  );
}
export { AnnouncementBar };
