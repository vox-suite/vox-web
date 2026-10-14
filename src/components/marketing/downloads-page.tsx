import Image from "next/image";
import { Laptop, Smartphone, ArrowRight } from "lucide-react";
import { Header, Footer } from "@/components/home/home-page";
import { WaitlistForm } from "@/components/home/waitlist-form";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export function DownloadsPage() {
  return (
    <div className="vox-home">
      <Header current="download" />
      <main className="h-wrap download-page" id="main" tabIndex={-1}>
        <Breadcrumbs current="Downloads" />
        <section className="download-hero" aria-labelledby="download-heading">
          <div className="download-hero-copy">
            <h1 id="download-heading">Vox for your computer.<br /><em>And your phone.</em></h1>
            <p>Explore your Timeline, check the sources behind an answer and talk to Vox from Windows, Mac or Android.</p>
            <a className="h-btn" href="#download-waitlist">Get availability updates <ArrowRight size={16} aria-hidden="true" /></a>
          </div>
          <div className="download-hero-art" aria-hidden="true">
            <Image className="download-art-desktop" src="/illustrations/dithered-desktop-transparent.png" alt="" width={1254} height={1254} sizes="(max-width: 760px) 75vw, 440px" />
            <Image className="download-art-phone" src="/illustrations/dithered-mobile-transparent.png" alt="" width={1254} height={1254} sizes="(max-width: 760px) 38vw, 230px" />
          </div>
        </section>
        <section className="download-platform-list" aria-label="Vox platforms">
          <div><div className="download-platform-heading"><Laptop size={22} aria-hidden="true" /><h2>Windows</h2></div><p>Keep your day and connected information in view on your PC.</p></div>
          <div><div className="download-platform-heading"><Laptop size={22} aria-hidden="true" /><h2>Mac</h2></div><p>Open the bigger picture and speak with Vox from your desktop.</p></div>
          <div><div className="download-platform-heading"><Smartphone size={22} aria-hidden="true" /><h2>Android</h2></div><p>Check your Timeline and reach Vox while you’re out.</p></div>
        </section>
        <section className="download-signup" id="download-waitlist" aria-labelledby="download-signup-heading">
          <div><h2 id="download-signup-heading">Be there when<br /><em>Vox is ready.</em></h2><p>Installer links are not listed here yet. Join the waitlist and we’ll email you when Vox is ready.</p></div>
          <div className="download-signup-form"><WaitlistForm source="hero" /></div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
