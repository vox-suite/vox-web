import Link from "next/link";
import { Brand, LinkButton } from "@/components/ui";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-nav">
        <Brand animated={true} size={26} />
        <nav aria-label="Main navigation">
          <Link href="/#follow-through">How it works</Link>
          <Link href="/#capabilities">Capabilities</Link>
          <Link href="/pipeline">Pipeline</Link>
          <Link href="/#principles">Our principles</Link>
          <Link href="/changelog">Changelog</Link>
        </nav>
        <div className="site-nav-ctas">
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
    <footer className="site-footer">
      <div className="footer-top">
        <div>
          <Brand animated={false} size={28} />
          <p>Your chief of staff, on speed dial.</p>
        </div>
        <div className="footer-links">
          <div>
            <small>Discover</small>
            <Link href="/#follow-through">How it works</Link>
            <Link href="/#capabilities">Capabilities</Link>
            <Link href="/pipeline">Pipeline Architecture</Link>
            <Link href="/#principles">Our principles</Link>
            <Link href="/changelog">Changelog</Link>
            <Link href="/request-access">Request access</Link>
          </div>
          <div>
            <small>Vox</small>
            <Link href="/privacy">Privacy</Link>
            <Link
              href={
                process.env.NODE_ENV === "production"
                  ? "https://app.voxagent.in/sign-in"
                  : "/app/sign-in"
              }
            >
              Sign in
            </Link>
            <Link
              href={
                process.env.NODE_ENV === "production"
                  ? "https://admin.voxagent.in/login"
                  : "/admin/login"
              }
            >
              Administration
            </Link>
            <Link href="/#main">Back to top</Link>
          </div>
        </div>
      </div>
      <div className="footer-meta-strip" aria-label="Build and runtime specifications">
        <span>v1.104.21</span>
        <span className="footer-meta-pipe" aria-hidden="true">|</span>
        <span>PSTN Telephony &amp; WhatsApp</span>
        <span className="footer-meta-pipe" aria-hidden="true">|</span>
        <span>&lt; 180ms Duplex Latency</span>
        <span className="footer-meta-pipe" aria-hidden="true">|</span>
        <span>curl -fsSL https://voxagent.in/install.sh</span>
      </div>
      <div className="footer-bottom">
        <span>&copy; {new Date().getFullYear()} Vox Inc. All rights reserved.</span>
        <span>Less screen time. More human.</span>
      </div>
      <div className="footer-wordmark" aria-hidden="true">
        vox
      </div>
    </footer>
  );
}
