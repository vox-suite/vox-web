import { FaqAccordion } from "@/components/ui/faq-accordion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays, Mic, ShieldCheck, FileText, Laptop, Smartphone } from "lucide-react";
import { Header, Footer } from "@/components/home/home-page";
import { TimelineDemo } from "./timeline-demo";
import "./timeline.css";

const sources = [
  ["Gmail", "Receipts, bills, bank alerts and appointments. Supported PDF statements add transaction entries.", "Connected account"],
  ["Google Calendar", "Meetings and appointments, with their source times and status.", "Connected account"],
  ["Spotify", "Recent plays available from the provider. Coverage is limited to its recent-play window.", "Recent activity"],
  ["PlayStation", "Observed increases in game activity. Exact session start and end times are not provided.", "Activity observations"],
  ["YouTube", "Likes and playlist additions through the API. Watched videos come from uploaded Takeout history.", "Account + import"],
  ["Google Maps Timeline", "Visits and travel from an uploaded history export.", "History import"],
  ["Swiggy", "Supported order and delivery updates with provider timestamps.", "Connected account"],
];
const faq = [
  ["Does Timeline contain my complete history?", "It contains what supported sources provide. Spotify has a recent-play window, PlayStation reports cumulative activity, and uploaded exports reflect the data in that file."],
  ["Can I bring in older information?", "Review and import older Gmail messages from a chosen date range. Supported Google Takeout uploads add YouTube watch history and Google Maps Timeline history."],
  ["Will the same purchase appear twice?", "Matching financial records can be merged so an email and statement do not count the same purchase separately. Their source evidence stays attached."],
  ["Does disconnecting an account erase its entries?", "Disconnecting deletes its stored credentials. Existing Timeline entries are retained."],
  ["Where can I view Timeline?", "Timeline is available in Vox on Windows, Mac and Android. Visit Downloads to choose your platform."],
];

export function TimelinePage() {
  return <div className="vox-home tl-page">
    <Header current="timeline" />
    <main id="main" tabIndex={-1}>
      <section className="tl-hero h-wrap">
        <div className="tl-hero-composition">
        <div className="tl-hero-copy">
        <h1>Your days,<br/><em>brought together.</em></h1>
        <p className="tl-intro">Receipts, meetings, music and places become a day-by-day record from the accounts and files you connect. Browse what happened and see where each entry came from.</p>
        <div className="tl-hero-actions"><Link className="h-btn" href="/download">Download Vox <ArrowRight size={16} aria-hidden="true"/></Link><a className="tl-text-link" href="#example">See a day in Timeline <ArrowRight size={16} aria-hidden="true"/></a></div>
        </div>
        <div className="tl-hero-art" aria-label="Illustrative moments brought into one timeline">
          <div className="tl-art-axis" aria-hidden="true"><span>09:00</span><span>12:00</span><span>16:00</span></div>
          <Image className="tl-clock" src="/illustrations/dithered-clock-transparent.png" alt="" width={1254} height={1254} sizes="(max-width: 600px) 310px, (max-width: 900px) 420px, 520px" priority aria-hidden="true" />
          <div className="tl-art-entry tl-art-meeting"><CalendarDays size={18} aria-hidden="true"/><div><strong>Design review</strong><span>09:00 · Google Calendar</span></div></div>
          <div className="tl-art-entry tl-art-receipt"><FileText size={18} aria-hidden="true"/><div><strong>Coffee at Verve</strong><span>$6.50 · Gmail receipt</span></div></div>
          <p className="tl-art-caption">The moments add up.<br/>The sources stay attached.</p>
        </div>
        </div>
        <TimelineDemo />
      </section>
      <section className="tl-section h-wrap tl-split">
        <div><h2>A receipt becomes a purchase.<br/><em>A meeting keeps its time.</em></h2><p>Vox turns information from supported accounts into dated entries. Start with the accounts you want to connect, then bring in older information through supported imports.</p></div>
        <div className="tl-transform"><div><FileText size={22} aria-hidden="true"/><span>Gmail receipt</span><strong>Verve Coffee · $6.50</strong><p>Paid October 12 at 10:12 AM</p></div><ArrowRight size={24} aria-hidden="true"/><div><span>Timeline entry</span><strong>Coffee at Verve</strong><p>$6.50 · Confirmed purchase</p><small>Evidence: original receipt</small></div><p className="tl-example-note">Illustrative receipt and entry.</p></div>
      </section>
      <section className="tl-section h-wrap"><div className="tl-section-head"><CalendarDays size={24} aria-hidden="true"/><h2>Look back at an hour,<br/>a week or a month.</h2><p>Choose a date range or narrow the view to Finance, Activity, Entertainment, Work or Personal.</p></div><div className="tl-view-descriptions"><div><h3>Day</h3><p>Follow events through the hours. Entries show a duration when the source provides one.</p></div><div><h3>Week</h3><p>Review the days together and open the details that matter.</p></div><div><h3>Month</h3><p>See which days have events and which categories appear. Select a day to explore it.</p></div></div></section>
      <section className="tl-section h-wrap tl-split"><div><h2>Open an entry.<br/><em>Check the facts.</em></h2><p>Every entry keeps its source evidence. A purchase can show its amount and merchant; a visit can show its place and duration.</p><p>Matching bank transactions found in an email and a statement can be merged into one entry with their evidence kept together.</p></div><div className="tl-precision"><h3>The time is as precise as the source.</h3><dl><div><dt>Calendar meeting</dt><dd>9:00–9:45 AM <span>Known interval</span></dd></div><div><dt>Statement transaction</dt><dd>October 12 <span>Date only</span></dd></div><div><dt>PlayStation activity</dt><dd>Observed increase <span>Exact session time unknown</span></dd></div></dl><p className="tl-example-note">Illustrative timing examples.</p></div></section>
      <section className="tl-section h-wrap tl-voice"><Mic size={28} aria-hidden="true"/><h2>Say what you want to see.</h2><blockquote>“Show my spending last week.”</blockquote><p>Ask Vox to open Timeline filtered to spending and the dates you named. Narrow the request to a merchant when you need a closer look.</p><div className="tl-filter-example">Spending · Last week · Your time zone</div><p className="tl-example-note">Illustrative voice request. Charts, totals and comparisons live in Insights.</p></section>
      <section className="tl-section h-wrap"><div className="tl-section-head"><h2>Connect what you use.<br/><em>Know what it adds.</em></h2><p>Coverage depends on the source. Recent activity and uploaded exports may cover only part of your history.</p></div><div className="tl-sources">{sources.map(([name,description,mode])=><div className="tl-source" key={name}><h3>{name}</h3><p>{description}</p><span>{mode}</span></div>)}</div></section>
      <section className="tl-section h-wrap tl-split"><div><ShieldCheck size={26} aria-hidden="true"/><h2>Choose what enters Timeline.<br/><em>Choose what Vox can read.</em></h2><p>Each account has separate controls for adding information to Timeline and allowing assistant access. Pause either whenever you need to.</p><p>Disconnecting removes stored credentials. Entries already added to Timeline remain there.</p></div><div className="tl-permissions"><h3>Two independent permissions</h3><div><strong>Timeline sync</strong><p>Add information from this account to your day-by-day record.</p></div><div><strong>Assistant access</strong><p>Allow Vox to use this account’s information when helping you.</p></div><small>Pause either permission. Disconnect to remove account credentials.</small></div></section>
      <section className="tl-section h-wrap tl-faq"><h2>A few things to know.</h2><FaqAccordion items={faq} name="timeline-faq" /></section>
      <section className="tl-section h-wrap tl-download" id="downloads"><h2>Bring your days <em>into view.</em></h2><p>Get Vox for Windows, Mac or Android and connect the accounts you want in your Timeline.</p><div className="tl-platforms"><span><Laptop size={18} aria-hidden="true"/>Windows</span><span><Laptop size={18} aria-hidden="true"/>Mac</span><span><Smartphone size={18} aria-hidden="true"/>Android</span></div><Link className="h-btn" href="/download">Download Vox <ArrowRight size={16} aria-hidden="true"/></Link><div className="tl-download-art" aria-hidden="true"><Image className="tl-download-desktop" src="/illustrations/dithered-desktop-transparent.png" alt="" width={1254} height={1254} sizes="(max-width: 600px) 250px, 360px"/><Image className="tl-download-phone" src="/illustrations/dithered-mobile-transparent.png" alt="" width={1254} height={1254} sizes="(max-width: 600px) 140px, 200px"/></div></section>
    </main><Footer />
  </div>;
}
