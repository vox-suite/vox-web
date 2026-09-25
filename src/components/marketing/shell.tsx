import Link from "next/link";
import { Menu } from "lucide-react";
import { Brand } from "@/components/ui";

const navLinks = [
  { href: "/#follow-through", label: "How it works" },
  { href: "/#capabilities", label: "Capabilities" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/#principles", label: "Principles" },
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
            href="/request-access"
            className="btn-primary-mist inline-flex h-8 items-center px-3.5 text-[13px]"
          >
            Request access
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
              {navLinks.map(({ href, label }) => (
                <Link
                  key={label}
                  href={href}
                  className="flex min-h-10 items-center rounded-lg px-3 text-[14px] text-ash transition-colors hover:bg-white/[0.04] hover:text-pure-white"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

const footerColumns = [
  {
    title: "Discover",
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
    title: "Vox",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/#main", label: "Back to top" },
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
              Your chief of staff, on speed dial.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-12 gap-y-10">
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
          <span>&copy; {new Date().getFullYear()} Vox</span>
          <span>Less screen time. More human.</span>
        </div>
        <div
          aria-hidden="true"
          className="select-none pb-4 text-center font-display text-[clamp(6rem,26vw,20rem)] font-bold leading-[0.9] tracking-[-0.06em] text-[#0d0e10] transition-colors duration-500 hover:text-transparent hover:[background:linear-gradient(135deg,#0d0e10_0%,#ff6363_45%,#452324_75%,#0d0e10_100%)] hover:bg-clip-text"
        >
          vox
        </div>
      </div>
    </footer>
  );
}
