import Link from "next/link";
import { Brand, LinkButton } from "@/components/ui";

export function SiteHeader() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-5 md:px-6">
      <div className="pointer-events-auto flex w-full max-w-[920px] items-center gap-3 rounded-lg border border-border-edge bg-[rgba(7,8,10,0.72)] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-[48px] md:gap-6 md:px-4">
        <Brand animated size={20} />
        <nav
          className="hidden flex-1 items-center justify-center gap-5 text-[13px] font-medium lg:flex"
          aria-label="Main navigation"
        >
          <Link
            className="text-ash transition-colors hover:text-pure-white"
            href="/#follow-through"
          >
            How it works
          </Link>
          <Link
            className="text-ash transition-colors hover:text-pure-white"
            href="/#capabilities"
          >
            Capabilities
          </Link>
          <Link
            className="text-ash transition-colors hover:text-pure-white"
            href="/pipeline"
          >
            Pipeline
          </Link>
          <Link
            className="text-ash transition-colors hover:text-pure-white"
            href="/#principles"
          >
            Our principles
          </Link>
          <Link
            className="text-ash transition-colors hover:text-pure-white"
            href="/changelog"
          >
            Changelog
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <LinkButton href="/request-access">Request access</LinkButton>
          <LinkButton
            href={
              process.env.NODE_ENV === "production"
                ? "https://app.voxagent.in/sign-in"
                : "/app/sign-in"
            }
            variant="secondary"
          >
            Sign in
          </LinkButton>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-border-edge bg-void-black">
      <div className="mx-auto grid max-w-[1200px] gap-12 px-6 py-20 md:grid-cols-[minmax(0,1fr)_auto] md:px-8">
        <div className="max-w-sm space-y-4">
          <Brand animated={false} size={28} />
          <p className="text-base leading-relaxed text-ash">
            Your chief of staff, on speed dial.
          </p>
        </div>
        <div className="grid gap-10 sm:grid-cols-2">
          <div className="flex flex-col gap-2.5">
            <small className="mb-1 font-mono text-[10px] uppercase tracking-[0.08em] text-smoke">
              Discover
            </small>
            <Link
              className="text-sm text-ash hover:text-pure-white"
              href="/#follow-through"
            >
              How it works
            </Link>
            <Link
              className="text-sm text-ash hover:text-pure-white"
              href="/#capabilities"
            >
              Capabilities
            </Link>
            <Link
              className="text-sm text-ash hover:text-pure-white"
              href="/pipeline"
            >
              Pipeline Architecture
            </Link>
            <Link
              className="text-sm text-ash hover:text-pure-white"
              href="/#principles"
            >
              Our principles
            </Link>
            <Link
              className="text-sm text-ash hover:text-pure-white"
              href="/changelog"
            >
              Changelog
            </Link>
            <Link
              className="text-sm text-ash hover:text-pure-white"
              href="/request-access"
            >
              Request access
            </Link>
          </div>
          <div className="flex flex-col gap-2.5">
            <small className="mb-1 font-mono text-[10px] uppercase tracking-[0.08em] text-smoke">
              Vox
            </small>
            <Link
              className="text-sm text-ash hover:text-pure-white"
              href="/privacy"
            >
              Privacy
            </Link>
            <Link
              className="text-sm text-ash hover:text-pure-white"
              href={
                process.env.NODE_ENV === "production"
                  ? "https://app.voxagent.in/sign-in"
                  : "/app/sign-in"
              }
            >
              Sign in
            </Link>
            <Link
              className="text-sm text-ash hover:text-pure-white"
              href={
                process.env.NODE_ENV === "production"
                  ? "https://admin.voxagent.in/login"
                  : "/admin/login"
              }
            >
              Administration
            </Link>
            <Link
              className="text-sm text-ash hover:text-pure-white"
              href="/#main"
            >
              Back to top
            </Link>
          </div>
        </div>
      </div>
      <div
        className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t border-border-edge px-6 py-4 font-mono text-xs text-ash"
        aria-label="Build and runtime specifications"
      >
        <span>v1.104.21</span>
        <span className="text-smoke" aria-hidden="true">
          |
        </span>
        <span>PSTN Telephony &amp; WhatsApp</span>
        <span className="text-smoke" aria-hidden="true">
          |
        </span>
        <span>&lt; 180ms Duplex Latency</span>
        <span className="text-smoke" aria-hidden="true">
          |
        </span>
        <span>curl -fsSL https://voxagent.in/install.sh</span>
      </div>
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 border-t border-border-edge px-6 py-6 text-sm text-ash md:px-8">
        <span>
          &copy; {new Date().getFullYear()} Vox Inc. All rights reserved.
        </span>
        <span>Less screen time. More human.</span>
      </div>
    </footer>
  );
}
