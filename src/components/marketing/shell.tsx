import Link from "next/link";
import { Menu } from "lucide-react";
import { Brand } from "@/components/ui";
import { cn } from "@/lib/utils";

const signInHref =
  process.env.NODE_ENV === "production"
    ? "https://app.voxagent.in/sign-in"
    : "/app/sign-in";

const navLinks = [
  { href: "/#capabilities", label: "Capabilities" },
  { href: "/#workflow-automation", label: "Workflows" },
  { href: "/#security", label: "Security & Governance" },
  { href: "/#telemetry", label: "Telemetry" },
  { href: "/changelog", label: "Changelog" },
];

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center border-b border-[#232427] bg-[#040506]/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-[1200px] items-center justify-between px-6 md:px-10">
        <div className="flex items-center gap-3">
          <Brand animated size={22} />
          <span className="hidden font-mono text-[11px] text-smoke sm:inline-block">
            v0.1.0
          </span>
        </div>

        <nav
          className="hidden items-center gap-8 text-[13px] font-medium text-ash lg:flex"
          aria-label="Main navigation"
        >
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              className="transition-colors hover:text-pure-white"
              href={href}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href={signInHref}
            className="btn-secondary-obsidian hidden h-8 items-center px-3.5 text-[13px] sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/request-access"
            className="btn-primary-mist inline-flex h-8 items-center px-3.5 text-[13px]"
          >
            Book free Demo
          </Link>

          <details className="group relative lg:hidden">
            <summary
              className="btn-secondary-obsidian flex size-8 cursor-pointer list-none items-center justify-center rounded-lg p-0 [&::-webkit-details-marker]:hidden"
              aria-label="Open menu"
            >
              <Menu size={16} aria-hidden="true" />
            </summary>
            <nav
              className="absolute right-0 top-[calc(100%+8px)] flex w-48 flex-col rounded-xl border border-[#2f3031] bg-[#07080a] p-2 shadow-2xl backdrop-blur-xl"
              aria-label="Mobile navigation"
            >
              {[...navLinks, { href: signInHref, label: "Sign in" }].map(
                ({ href, label }) => (
                  <Link
                    key={label}
                    href={href}
                    className="flex min-h-10 items-center rounded-lg px-3 text-[14px] text-ash transition-colors hover:bg-white/[0.04] hover:text-pure-white"
                  >
                    {label}
                  </Link>
                ),
              )}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

const footerColumns = [
  {
    title: "Product",
    links: [
      { href: "/#capabilities", label: "Capabilities" },
      { href: "/#workflow-automation", label: "Workflows" },
      { href: "/#security", label: "Security & Governance" },
      { href: "/request-access", label: "Request Access" },
    ],
  },
  {
    title: "Platform",
    links: [
      { href: "/changelog", label: "Changelog" },
      { href: "/pipeline", label: "Pipeline" },
      { href: "/privacy", label: "Privacy Policy" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: signInHref, label: "Sign In" },
      {
        href:
          process.env.NODE_ENV === "production"
            ? "https://admin.voxagent.in/login"
            : "/admin/login",
        label: "Administration",
      },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[#232427] bg-[#040506]">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10">
        <div className="grid gap-12 py-16 md:grid-cols-[minmax(0,1fr)_auto] md:py-20">
          <div className="max-w-xs space-y-4">
            <Brand animated={false} size={24} />
            <p className="text-[14px] text-ash">
              Security & Approvals for AI-Driven Workflows. Built with Raycast design tokens on a dark command center canvas.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-12 gap-y-10 sm:grid-cols-3">
            {footerColumns.map(({ title, links }) => (
              <div key={title} className="flex flex-col">
                <p className="mb-3 font-mono text-[12px] uppercase tracking-wider text-pure-white">
                  {title}
                </p>
                {links.map(({ href, label }) => (
                  <Link
                    key={label}
                    href={href}
                    className="flex min-h-8 items-center text-[13px] text-ash transition-colors hover:text-pure-white"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#232427] py-8 font-mono text-[12px] text-smoke">
          <span>&copy; {new Date().getFullYear()} Vox Inc. All rights reserved.</span>
          <span>Tactical Command Center · v0.1.0</span>
        </div>
      </div>
    </footer>
  );
}
