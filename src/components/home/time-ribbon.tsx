import Image from "next/image";

type Ev = {
  id: string;
  x: number;
  lane: -2 | -1 | 1 | 2;
  title: string;
  meta: string;
  tone: string;
};

const EVENTS: Ev[] = [
  {
    id: "gmail",
    x: 90,
    lane: -1,
    title: "Blue Tokai Coffee",
    meta: "₹320 · 09:42",
    tone: "fin",
  },
  {
    id: "google-calendar",
    x: 330,
    lane: 1,
    title: "Design review",
    meta: "10:00 – 11:00",
    tone: "work",
  },
  {
    id: "spotify",
    x: 560,
    lane: -2,
    title: "Deep Focus",
    meta: "54 min · 12 tracks",
    tone: "ent",
  },
  {
    id: "google-maps",
    x: 800,
    lane: 2,
    title: "Cubbon Park",
    meta: "Visit · 07:40",
    tone: "act",
  },
  {
    id: "swiggy",
    x: 1040,
    lane: -1,
    title: "Order delivered",
    meta: "₹486 · 20:51",
    tone: "act",
  },
  {
    id: "playstation",
    x: 1280,
    lane: 1,
    title: "God of War Ragnarök",
    meta: "1h 20m",
    tone: "ent",
  },
  {
    id: "youtube",
    x: 1520,
    lane: -2,
    title: "Watched",
    meta: "12 min · 21:10",
    tone: "ent",
  },
  {
    id: "gmail",
    x: 1720,
    lane: 2,
    title: "Electricity bill",
    meta: "Due Oct 14",
    tone: "fin",
  },
  {
    id: "google-calendar",
    x: 1960,
    lane: -1,
    title: "Brunch with Maya",
    meta: "13:00",
    tone: "per",
  },
  {
    id: "spotify",
    x: 2180,
    lane: 1,
    title: "Evening mix",
    meta: "38 min",
    tone: "ent",
  },
];

const AXIS = 196;
const CHIP = 54;
const STEP = 62;
const WIDTH = 2400;

function Set({ hidden }: { hidden?: boolean }) {
  return (
    <div className="h-rb-set" aria-hidden={hidden || undefined}>
      <div className="h-rb-axis" />
      {Array.from({ length: WIDTH / 160 }, (_, i) => (
        <span key={i} className="h-rb-hour" style={{ left: i * 160 }}>
          {String((i + 5) % 24).padStart(2, "0")}:00
        </span>
      ))}
      {EVENTS.map((e) => {
        const up = e.lane < 0;
        const reach = Math.abs(e.lane) * STEP;
        const top = up ? AXIS - reach - CHIP : AXIS + reach;
        return (
          <div
            key={e.title}
            className="h-rb-ev"
            data-tone={e.tone}
            data-side={up ? "up" : "down"}
            style={{ left: e.x, top }}
          >
            <span
              className="h-rb-dot"
              style={{ top: up ? CHIP + reach - 4 : -reach - 4 }}
            />
            <span
              className="h-rb-stem"
              style={{ height: reach, top: up ? CHIP : -reach }}
            />
            <div className="h-rb-card">
              <Image
                src={`/brands/${e.id}.svg`}
                alt=""
                width={22}
                height={22}
                unoptimized
              />
              <div>
                <strong>{e.title}</strong>
                <span>{e.meta}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function TimeRibbon() {
  return (
    <div
      className="h-ribbon"
      role="img"
      aria-label="Events from connected accounts pinned to the hours of a day"
    >
      <div className="h-rb-track">
        <Set />
        <Set hidden />
      </div>
      <div className="h-rb-now" aria-hidden="true">
        <span>Now</span>
      </div>
    </div>
  );
}
