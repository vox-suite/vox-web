import { Laptop, Smartphone } from "lucide-react";
import { Header, Footer } from "@/components/home/home-page";
import { WaitlistForm } from "@/components/home/waitlist-form";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export function DownloadsPage() {
  return <div className="vox-home"><Header current="download" />
    <main className="h-wrap download-page" id="main" tabIndex={-1}>
      <Breadcrumbs current="Downloads" />
      <h1>Vox for your computer.<br/><em>And your phone.</em></h1>
      <p>Explore your Timeline, check the sources behind an answer and talk to Vox from Windows, Mac or Android.</p>
      <div className="download-platform-list">
        <div><Laptop size={24} aria-hidden="true"/><h2>Windows</h2><p>Keep your day and connected information in view on your PC.</p></div>
        <div><Laptop size={24} aria-hidden="true"/><h2>Mac</h2><p>Open the bigger picture and speak with Vox from your desktop.</p></div>
        <div><Smartphone size={24} aria-hidden="true"/><h2>Android</h2><p>Check your Timeline and reach Vox while you’re out.</p></div>
      </div>
      <section className="download-signup"><h2>Get download availability updates.</h2><p>Installer links are not listed here yet. Join the waitlist and we’ll email you when Vox is ready.</p><WaitlistForm source="hero" /></section>
    </main><Footer /></div>;
}
