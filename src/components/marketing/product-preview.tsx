"use client";

import { useState } from "react";
import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronRight,
  Compass,
  Gamepad2,
  Link2,
  MapPin,
  Mic,
  Plus,
  Sparkles,
  Wallet,
} from "lucide-react";
import { VoxLogo } from "@/components/ui/vox-logo";
import { CityScene } from "./city-scene";

const views = [
  { name: "Overview", icon: Compass },
  { name: "Spans", icon: CalendarDays },
  { name: "Spaces", icon: Sparkles },
  { name: "Pulse", icon: Activity },
  { name: "Connections", icon: Link2 },
] as const;
type View = (typeof views)[number]["name"];

export function SpanPreview() {
  return (
    <div className="span-preview">
      <div className="preview-section-heading">
        <span>Your day, in context</span>
        <span>Friday, 09 October</span>
      </div>
      {[
        {
          time: "09:00",
          title: "A little room to focus",
          detail: "Proposal · Calendar",
          icon: CalendarDays,
          color: "sky",
        },
        {
          time: "12:40",
          title: "Lunch at the usual place",
          detail: "₹340 · Spending",
          icon: Wallet,
          color: "gold",
        },
        {
          time: "17:30",
          title: "The way home",
          detail: "Indiranagar · Location",
          icon: MapPin,
          color: "mint",
        },
        {
          time: "20:15",
          title: "An evening well spent",
          detail: "Gaming · Illustrative activity",
          icon: Gamepad2,
          color: "coral",
        },
      ].map(({ time, title, detail, icon: Icon, color }) => (
        <div className="span-row" key={time}>
          <time>{time}</time>
          <span className={`span-icon tone-${color}`}>
            <Icon size={17} />
          </span>
          <div>
            <strong>{title}</strong>
            <small>{detail}</small>
          </div>
          <ChevronRight size={14} />
        </div>
      ))}
    </div>
  );
}

export function SpacePreview() {
  return (
    <div className="space-preview">
      <div className="space-intent">
        <Sparkles size={17} />
        <span>A quieter weekend, somewhere new.</span>
      </div>
      <div className="space-branches">
        <div>
          <CalendarDays size={18} />
          <strong>Your time</strong>
          <small>Saturday is open</small>
        </div>
        <div>
          <Wallet size={18} />
          <strong>Your budget</strong>
          <small>Keep it under ₹5,000</small>
        </div>
        <div>
          <Compass size={18} />
          <strong>Your options</strong>
          <small>Closer. Calmer. Greener.</small>
        </div>
      </div>
      <div className="space-result">
        <span className="tone-mint">
          <Check size={17} /> A plan to consider
        </span>
        <strong>A day in Nandi Hills</strong>
        <p>Leave early. Take the scenic route. Be home for dinner.</p>
        <span className="preview-pill">
          Review before committing <ArrowUpRight size={13} />
        </span>
      </div>
    </div>
  );
}

export function PulsePreview() {
  return (
    <div className="pulse-preview">
      <div className="preview-section-heading">
        <span>Where the week went</span>
        <span>This week</span>
      </div>
      <div className="pulse-metric">
        <strong>Room for a reset.</strong>
        <p>See the patterns behind your days.</p>
      </div>
      <div
        className="pulse-chart"
        role="img"
        aria-label="Illustrative weekly activity chart, with time divided between focus and other activities"
      >
        {[42, 65, 50, 86, 60, 33, 24].map((n, i) => (
          <div key={i}>
            <div className="pulse-bar" style={{ height: `${n}%` }}>
              <i />
            </div>
            <span>{["M", "T", "W", "T", "F", "S", "S"][i]}</span>
          </div>
        ))}
      </div>
      <div className="chart-key">
        <span>
          <i /> Focus
        </span>
        <span>
          <i /> Other activities
        </span>
      </div>
    </div>
  );
}

export function ConnectionsPreview() {
  return (
    <div className="connections-preview">
      <h3>Context starts with a connection.</h3>
      <p>Choose what Vox can read and what belongs in your timeline.</p>
      {[
        {
          name: "Google Calendar",
          detail: "Events & availability",
          icon: CalendarDays,
        },
        { name: "PlayStation", detail: "Gaming activity", icon: Gamepad2 },
      ].map(({ name, detail, icon: Icon }) => (
        <div className="connection-row" key={name}>
          <Icon size={22} />
          <div>
            <strong>{name}</strong>
            <small>{detail}</small>
          </div>
          <span className="preview-pill">Example</span>
        </div>
      ))}
      <div className="connection-permissions">
        <Check size={15} /> Timeline sync and assistant access have separate
        controls.
      </div>
    </div>
  );
}

export function ProductPreview() {
  const [view, setView] = useState<View>("Overview");
  return (
    <div className="product-window">
      <div className="window-titlebar">
        <div className="window-dots">
          <i />
          <i />
          <i />
        </div>
        <span>Vox Desktop</span>
        <span>Interactive product illustration</span>
      </div>
      <div className="product-body">
        <aside className="product-sidebar">
          <div className="preview-brand">
            <VoxLogo animated={false} size={25} /> vox
          </div>
          <div
            role="tablist"
            aria-label="Explore Vox features"
            aria-orientation="vertical"
          >
            {views.map(({ name, icon: Icon }, index) => (
              <button
                key={name}
                id={`preview-tab-${name}`}
                role="tab"
                aria-selected={view === name}
                aria-controls="product-panel"
                tabIndex={view === name ? 0 : -1}
                onClick={() => setView(name)}
                onKeyDown={(event) => {
                  let next = index;
                  if (event.key === "ArrowDown" || event.key === "ArrowRight")
                    next = (index + 1) % views.length;
                  else if (event.key === "ArrowUp" || event.key === "ArrowLeft")
                    next = (index + views.length - 1) % views.length;
                  else if (event.key === "Home") next = 0;
                  else if (event.key === "End") next = views.length - 1;
                  else return;
                  event.preventDefault();
                  setView(views[next].name);
                  document
                    .getElementById(`preview-tab-${views[next].name}`)
                    ?.focus();
                }}
              >
                <Icon size={16} />
                <span>{name}</span>
              </button>
            ))}
          </div>
          <div className="sidebar-bottom">
            <span className="avatar">Y</span>
            <span>Your personal space</span>
          </div>
        </aside>
        <div
          className="product-panel"
          id="product-panel"
          role="tabpanel"
          aria-labelledby={`preview-tab-${view}`}
          tabIndex={0}
        >
          {view === "Overview" ? (
            <div className="overview-preview">
              <CityScene compact />
              <div className="overview-copy">
                <span className="small-caption">Your world, connected</span>
                <h3>What’s on your mind?</h3>
              </div>
              <div className="map-marker">
                <span /> Indiranagar
              </div>
              <div className="map-context">
                <CalendarDays size={16} />
                <div>
                  <strong>A little breathing room</strong>
                  <small>Your afternoon, at a glance</small>
                </div>
              </div>
              <div className="voice-input">
                <Plus size={16} />
                <span>Plan a little escape this weekend</span>
                <Mic size={17} />
              </div>
            </div>
          ) : view === "Spans" ? (
            <SpanPreview />
          ) : view === "Spaces" ? (
            <SpacePreview />
          ) : view === "Pulse" ? (
            <PulsePreview />
          ) : (
            <ConnectionsPreview />
          )}
        </div>
      </div>
    </div>
  );
}
