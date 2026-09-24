import Link from "next/link";
import { Menu } from "lucide-react";
import { Brand } from "@/components/ui";
import { cn } from "@/lib/utils";

const signInHref =
  process.env.NODE_ENV === "production"
    ? "https://app.voxagent.in/sign-in"
    : "/app/sign-in";

const navLinks = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#capabilities", label: "Capabilities" },
  { href: "/#principles", label: "Principles" },
  { href: "/changelog", label: "Changelog" },
];

export function CrimsonKey({
  href,
  children,
  size = "md",
  className,
}: {
  href: string;
  children: React.ReactNode;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "key-crimson inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-medium",
        size === "sm"
          ? "h-9 rounded-lg px-3.5 text-[13px]"
          : "h-12 rounded-xl px-6 text-[15px]",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 md:px-6">
      <div className="pointer-events-auto relative flex w-full max-w-[1040px] items-center gap-4 rounded-2xl bg-[rgba(13,13,16,0.72)] py-2 pl-4 pr-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_32px_-16px_rgba(0,0,0,0.8)] backdrop-blur-xl">
        <Brand animated size={20} />
        <nav
          className="hidden flex-1 items-center justify-center gap-7 text-sm lg:flex"
          aria-label="Main navigation"
        >
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              className="text-ash hover:text-pure-white"
              href={href}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <Link
            href={signInHref}
            className="hidden h-9 items-center px-3 text-sm text-ash hover:text-pure-white sm:inline-flex"
          >
            Sign in
          </Link>
          <CrimsonKey href="/request-access" size="sm">
            Request access
          </CrimsonKey>
          <details className="group lg:hidden">
            <summary
              className="key-graphite flex size-9 cursor-pointer list-none items-center justify-center rounded-lg [&::-webkit-details-marker]:hidden"
              aria-label="Open menu"
            >
              <Menu size={16} aria-hidden="true" />
            </summary>
            <nav
              className="plate absolute inset-x-0 top-[calc(100%+8px)] flex flex-col rounded-2xl bg-[rgba(13,13,16,0.96)] p-2 backdrop-blur-xl"
              aria-label="Mobile navigation"
            >
              {[...navLinks, { href: signInHref, label: "Sign in" }].map(
                ({ href, label }) => (
                  <Link
                    key={label}
                    href={href}
                    className="flex min-h-11 items-center rounded-lg px-3 text-[15px] text-mist hover:bg-white/[0.04] hover:text-pure-white"
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
      { href: "/#how-it-works", label: "How it works" },
      { href: "/#capabilities", label: "Capabilities" },
      { href: "/#principles", label: "Principles" },
      { href: "/request-access", label: "Request access" },
    ],
  },
  {
    title: "Build",
    links: [
      { href: "/changelog", label: "Changelog" },
      { href: "/pipeline", label: "Pipeline" },
      { href: "/privacy", label: "Privacy" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: signInHref, label: "Sign in" },
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
    <footer className="bg-void-black">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10">
        <div className="grid gap-12 border-t border-white/[0.06] py-16 md:grid-cols-[minmax(0,1fr)_auto] md:py-20">
          <div className="max-w-xs space-y-4">
            <Brand animated={false} size={24} />
            <p className="text-[15px] text-ash">
              Your chief of staff, on speed dial.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-12 gap-y-10 sm:grid-cols-3">
            {footerColumns.map(({ title, links }) => (
              <div key={title} className="flex flex-col">
                <p className="mb-2 text-[13px] font-medium text-pure-white">
                  {title}
                </p>
                {links.map(({ href, label }) => (
                  <Link
                    key={label}
                    href={href}
                    className="flex min-h-10 items-center text-sm text-ash hover:text-pure-white"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 pb-10 text-[13px] text-smoke">
          <span>&copy; {new Date().getFullYear()} Vox Inc.</span>
          <span>Less screen time. More human.</span>
        </div>
      </div>
    </footer>
  );
}
