import Link from "next/link";
import { VoxLogo } from "@/components/ui/vox-logo";
import { ACCESS_HREF } from "@/lib/site";

const navLinks = [
  { href: "#follow-through", label: "How it works" },
  { href: "#use-cases", label: "Use cases" },
  { href: "#surfaces", label: "Surfaces" },
  { href: "#connections", label: "Connections" },
  { href: "#faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-4 z-40 flex justify-center px-4">
      <div className="pointer-events-auto flex h-16 w-full max-w-[1080px] items-center justify-between rounded-full border border-white/10 bg-background/40 pl-6 pr-3 shadow-[0_10px_40px_rgb(0_0_0/0.4)] backdrop-blur-xl backdrop-saturate-150">
        <Link href="/" className="flex items-center gap-3" aria-label="Vox home">
          <VoxLogo animated size={26} aria-hidden="true" />
          <span className="font-serif text-[22px] tracking-[-0.02em]">Vox</span>
        </Link>

        <nav
          className="hidden items-center gap-7 font-mono text-[13px] uppercase tracking-[-0.02em] text-fg-muted lg:flex"
          aria-label="Main navigation"
        >
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} className="transition-colors hover:text-fg">
              {label}
            </Link>
          ))}
        </nav>

        <Link href={ACCESS_HREF} className="btn-pill-primary !px-5 !py-2.5 !text-[12px]">
          Request access
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1432px] flex-wrap items-center justify-between gap-6 px-6 py-10 md:px-12">
        <div className="flex items-center gap-3">
          <VoxLogo size={24} aria-hidden="true" />
          <span className="font-serif text-[20px]">Vox</span>
        </div>
        <p className="font-mono text-[12px] uppercase tracking-wider text-fg-dim">
          &copy; {new Date().getFullYear()} Vox · Phone &amp; WhatsApp
        </p>
      </div>
    </footer>
  );
}
