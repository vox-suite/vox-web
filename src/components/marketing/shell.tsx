import Link from "next/link";
import { VoxLogo } from "@/components/ui/vox-logo";
import { ACCESS_HREF } from "@/lib/site";

const navLinks = [
  { href: "#follow-through", label: "How it works" },
  { href: "#anatomy", label: "Under the hood" },
  { href: "#surfaces", label: "Surfaces" },
  { href: "#connections", label: "Connections" },
  { href: "#faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 w-full max-w-[1432px] items-center justify-between px-6 md:px-12">
        <Link href="/" className="flex items-center gap-3" aria-label="Vox home">
          <VoxLogo animated size={28} aria-hidden="true" />
          <span className="font-serif text-[22px] tracking-[-0.02em]">Vox</span>
        </Link>

        <nav
          className="hidden items-center gap-8 font-mono text-[13px] uppercase tracking-[-0.02em] text-fg-muted lg:flex"
          aria-label="Main navigation"
        >
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} className="transition-colors hover:text-fg">
              {label}
            </Link>
          ))}
        </nav>

        <Link href={ACCESS_HREF} className="btn-pill-primary !px-6 !py-2.5 !text-[12px]">
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
