import Link from "next/link";
import { Brand, LinkButton } from "@/components/ui";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-nav">
        <Brand animated={true} size={34} />
        <nav aria-label="Main navigation">
          <Link href="/#follow-through">How it works</Link>
          <Link href="/#capabilities">Capabilities</Link>
          <Link href="/#principles">Our principles</Link>
          <Link href="/changelog">Changelog</Link>
        </nav>
        <LinkButton
          href={
            process.env.NODE_ENV === "production"
              ? "https://admin.voxagent.in/login"
              : "/admin/login"
          }
          variant="secondary"
        >
          Sign in
        </LinkButton>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div>
          <Brand animated={false} size={36} />
          <p>Your chief of staff, on speed dial.</p>
        </div>
        <div className="footer-links">
          <div>
            <small>Discover</small>
            <Link href="/#follow-through">How it works</Link>
            <Link href="/#capabilities">Capabilities</Link>
            <Link href="/#principles">Our principles</Link>
            <Link href="/changelog">Changelog</Link>
          </div>
          <div>
            <small>Vox</small>
            <Link href="/changelog">Changelog</Link>
            <Link href="/privacy">Privacy</Link>
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
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Vox</span>
        <span>Less screen time. More human.</span>
      </div>
      <div className="footer-wordmark" aria-hidden="true">
        vox
      </div>
    </footer>
  );
}
