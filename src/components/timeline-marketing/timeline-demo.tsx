"use client";

import { useState } from "react";
import { CalendarDays, Music2, MapPin, Receipt, ArrowUpRight, Check } from "lucide-react";

const events = [
  { time: "09:00", title: "Design review", detail: "Product team · 45 minutes", source: "Google Calendar", category: "Work", icon: CalendarDays },
  { time: "10:12", title: "Coffee at Verve", detail: "$6.50 · Confirmed purchase", source: "Gmail receipt", category: "Finance", icon: Receipt },
  { time: "12:30", title: "Computer History Museum", detail: "Mountain View · Imported visit", source: "Maps history import", category: "Activity", icon: MapPin },
  { time: "16:40", title: "Kind of Blue", detail: "Miles Davis · Recent play", source: "Spotify", category: "Entertainment", icon: Music2 },
];

export function TimelineDemo() {
  const [view, setView] = useState("Day");
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(1);
  const shown = events.filter(event => filter === "All" || event.category === filter);
  const event = events[selected];
  return (
    <div className="tl-demo" id="example">
      <div className="tl-demo-top">
        <div><strong>October 2026</strong><p>Monday, October 12 · Pacific time</p></div>
        <div className="tl-view-switch" role="group" aria-label="Example timeline view">
          {["Day", "Week", "Month"].map(name => <button key={name} type="button" aria-pressed={view === name} onClick={() => setView(name)}>{name}</button>)}
        </div>
      </div>
      <div className="tl-demo-body">
        <div className="tl-demo-content">
          <div className="tl-filter" role="group" aria-label="Filter illustrative events">
            {["All", "Finance", "Work", "Activity", "Entertainment"].map(name => <button key={name} type="button" aria-pressed={filter === name} onClick={() => { setFilter(name); setSelected(name === "All" ? 1 : events.findIndex(event => event.category === name)); }}>{name}</button>)}
          </div>
          {view === "Month" ? <div className="tl-month" aria-label="Illustrative month grid">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => <span key={day}>{day}</span>)}
            {Array.from({length: 35}, (_, i) => { const day = i - 3; return day > 0 && day <= 31 ? <button key={i} type="button" className={day === 12 ? "tl-month-active" : ""} onClick={() => setView("Day")} aria-label={`October ${day}, illustrative day preview`}><span>{day}</span>{day === 12 && <small>4 events</small>}</button> : <span key={i} />; })}
          </div> : <>
            {view === "Week" && <div className="tl-week" aria-label="Example week"><span>Sun 11</span><strong>Mon 12</strong><span>Tue 13</span><span>Wed 14</span><span>Thu 15</span><span>Fri 16</span><span>Sat 17</span></div>}
            <div className="tl-events">
              {shown.map(item => { const Icon = item.icon; const index = events.indexOf(item); return <button key={item.title} type="button" className="tl-event" data-category={item.category} aria-pressed={selected === index} onClick={() => setSelected(index)}><time>{item.time}</time><Icon size={20} aria-hidden="true"/><span><strong>{item.title}</strong><small>{item.detail}</small></span><ArrowUpRight size={16} aria-hidden="true"/></button>; })}
            </div>
          </>}
          <p className="tl-example-note">Illustrative data. View previews share the same example day.</p>
        </div>
        <aside className="tl-detail" aria-label="Selected example entry" aria-live="polite">
          <span className="tl-detail-label">Entry details</span><h3>{event.title}</h3><p>{event.detail}</p>
          <dl><div><dt>When</dt><dd>Oct 12, 2026 · {event.time}</dd></div><div><dt>Category</dt><dd>{event.category}</dd></div><div><dt>Source</dt><dd>{event.source}</dd></div></dl>
          <p className="tl-source-note"><Check size={16} aria-hidden="true"/> Source attached to the entry</p>
        </aside>
      </div>
    </div>
  );
}
