"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Mail, PhoneCall, ShieldCheck, X } from "lucide-react";

function Sw({
  on,
  label,
  onToggle,
}: {
  on: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      className="h-sw-hit"
      onClick={onToggle}
    >
      <span className="h-sw" data-on={on || undefined} aria-hidden="true" />
    </button>
  );
}

const accounts = [
  { id: "gmail", name: "Gmail" },
  { id: "google-calendar", name: "Calendar" },
  { id: "google-maps", name: "Maps" },
  { id: "youtube", name: "YouTube" },
  { id: "spotify", name: "Spotify" },
];

export function ReadsVisual() {
  const [on, setOn] = useState(
    accounts.map((_, i) => [true, i !== 4 && i !== 3]),
  );
  const flip = (r: number, c: number) =>
    setOn(
      on.map((row, i) =>
        i === r ? row.map((v, j) => (j === c ? !v : v)) : row,
      ),
    );
  return (
    <div className="h-tv h-tv-reads">
      <div className="h-tv-cols">
        <span />
        <span>Timeline</span>
        <span>Assistant</span>
      </div>
      {accounts.map((r, i) => (
        <div key={r.id} className="h-tv-row">
          <span className="h-tv-name">
            <Image
              src={`/brands/${r.id}.svg`}
              alt=""
              width={20}
              height={20}
              unoptimized
            />
            {r.name}
          </span>
          <Sw
            on={on[i][0]}
            label={`${r.name} Timeline`}
            onToggle={() => flip(i, 0)}
          />
          <Sw
            on={on[i][1]}
            label={`${r.name} assistant`}
            onToggle={() => flip(i, 1)}
          />
        </div>
      ))}
      <p className="h-tv-hint">Try the switches</p>
    </div>
  );
}

export function RingsVisual() {
  const [on, setOn] = useState([true, true]);
  const flip = (i: number) => setOn(on.map((v, j) => (j === i ? !v : v)));
  const items = ["Reminders you set", "Bill alerts you turned on"];
  return (
    <div className="h-tv">
      <div className="h-tv-top">
        <span className="h-tv-ico">
          <PhoneCall size={16} />
        </span>
        <strong>Vox may call me for</strong>
      </div>
      {items.map((label, i) => (
        <div key={label} className="h-tv-row h-tv-row-2">
          <span className="h-tv-name">{label}</span>
          <Sw on={on[i]} label={label} onToggle={() => flip(i)} />
        </div>
      ))}
      <div className="h-tv-row h-tv-row-2">
        <span className="h-tv-name">Everything else</span>
        <span className="h-tv-tag">
          <X size={12} /> Never
        </span>
      </div>
    </div>
  );
}

export function NumberVisual() {
  return (
    <div className="h-tv" aria-hidden="true">
      <div className="h-tv-call h-tv-call-ok">
        <span className="h-tv-ico">
          <ShieldCheck size={16} />
        </span>
        <div>
          <strong>Your registered number</strong>
          <small>Verified, connected to your Vox</small>
        </div>
        <Check size={16} />
      </div>
      <div className="h-tv-call h-tv-call-no">
        <span className="h-tv-ico">
          <PhoneCall size={16} />
        </span>
        <div>
          <strong>Unknown number</strong>
          <small>Not allowed in</small>
        </div>
        <X size={16} />
      </div>
    </div>
  );
}

export function SourceVisual() {
  return (
    <div className="h-tv" aria-hidden="true">
      <div className="h-tv-top">
        <strong>Electricity bill</strong>
        <span className="h-tv-amount">$84.20</span>
      </div>
      <div className="h-tv-src">
        <Mail size={14} />
        <span>Email receipt</span>
        <small>Oct 12</small>
      </div>
      <div className="h-tv-src">
        <Mail size={14} />
        <span>Bank statement</span>
        <small>Oct 13</small>
      </div>
      <p className="h-tv-merge">Two sources, one entry</p>
    </div>
  );
}
