import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Header, Footer } from "@/components/home/home-page";
import "./secondary-pages.css";

export function NotFoundPage() {
  return <div className="vox-home vx-secondary">
    <Header />
    <main id="main" className="h-wrap vx-not-found" tabIndex={-1}>
      <div className="vx-missing-copy">
        <p className="vx-error-code">404 · Page not found</p>
        <h1>Wrong number.<br/><em>Let’s reconnect.</em></h1>
        <p>This page may have moved, or the address may be incomplete. Find your way back to Vox.</p>
        <div className="vx-missing-actions"><Link className="h-btn" href="/">Back to Vox <ArrowRight size={16} aria-hidden="true"/></Link><Link className="vx-text-link" href="/timeline">Explore Timeline</Link></div>
      </div>
      <picture className="vx-missing-picture">
        <source media="(prefers-reduced-motion: reduce)" srcSet="/illustrations/dithered-receiver-cutout.png" />
        <Image className="vx-missing-art" src="/illustrations/404-phone.gif" alt="" width={420} height={420} unoptimized priority aria-hidden="true" />
      </picture>
    </main>
    <Footer />
  </div>;
}
