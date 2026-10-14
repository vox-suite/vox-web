import type { ReactNode } from "react";

const C = {
  bg: "#0a0b0d",
  side: "#0d0e10",
  card: "#111214",
  line: "#232427",
  text: "#e9e9ea",
  muted: "#8d8e90",
  dim: "#5d5e60",
  fin: "#59d499",
  act: "#ff9f43",
  ent: "#a78bfa",
  work: "#63a1ff",
  per: "#ffbc33",
  coral: "#ff6363",
};

const NAV = ["Home", "Timeline", "Plans", "Projects", "Insights", "Updates"];

function Glyph({ x, y, active }: { x: number; y: number; active?: boolean }) {
  return <rect x={x} y={y} width={14} height={14} rx={4} fill="none" stroke={active ? C.text : C.muted} strokeWidth={1.5} />;
}

function Win({ active, children, label }: { active: string; children: ReactNode; label: string }) {
  return (
    <svg viewBox="0 0 1440 900" className="m-svg" role="img" aria-label={label}>
      <rect width="1440" height="900" rx="16" fill={C.bg} />
      <rect width="232" height="900" rx="16" fill={C.side} />
      <rect x="216" width="16" height="900" fill={C.side} />
      <line x1="232" x2="232" y1="0" y2="900" stroke={C.line} />
      <circle cx="24" cy="24" r="6" fill="#ff5f57" />
      <circle cx="44" cy="24" r="6" fill="#2a2b2d" />
      <circle cx="64" cy="24" r="6" fill="#2a2b2d" />
      <text x="22" y="76" className="m-t" fill={C.text} fontSize="18" fontWeight="500">Vox · 0.1.0</text>
      <text x="22" y="118" className="m-t" fill={C.dim} fontSize="13.2" letterSpacing="1.2">WORKSPACE</text>
      {NAV.map((n, i) => {
        const on = n === active;
        return (
          <g key={n}>
            {on && <rect x="12" y={134 + i * 38} width="208" height="34" rx="10" fill="#1d1e20" />}
            <Glyph x={26} y={144 + i * 38} active={on} />
            <text x="52" y={156 + i * 38} className="m-t" fill={on ? C.text : C.muted} fontSize="16.8">{n}</text>
          </g>
        );
      })}
      <text x="22" y="676" className="m-t" fill={C.dim} fontSize="13.2" letterSpacing="1.2">ASSISTANT</text>
      <rect x="12" y="690" width="208" height="46" rx="14" fill="#101113" stroke={C.line} />
      <circle cx="38" cy="713" r="10" fill="#2a2b2d" />
      <text x="58" y="718" className="m-t" fill={C.text} fontSize="15.6">Talk to Vox</text>
      <line x1="12" x2="220" y1="756" y2="756" stroke={C.line} />
      <text x="22" y="788" className="m-t" fill={C.text} fontSize="16.8">Terminal</text>
      <text x="22" y="824" className="m-t" fill={C.text} fontSize="16.8">Connected Apps</text>
      <circle cx="34" cy="868" r="14" fill="#2a2b2d" />
      <rect x="58" y="858" width="92" height="8" rx="4" fill="#3a3b3d" />
      <rect x="58" y="873" width="124" height="6" rx="3" fill="#2a2b2d" />
      <g transform="translate(232 0)">{children}</g>
      <rect x="0.5" y="0.5" width="1439" height="899" rx="15.5" fill="none" stroke={C.line} />
    </svg>
  );
}

function PageHead({ title, sub, right }: { title: string; sub: string; right?: ReactNode }) {
  return (
    <g>
      <rect x="28" y="22" width="40" height="40" rx="10" fill={C.card} stroke={C.line} />
      <text x="48" y="38" textAnchor="middle" className="m-m" fill={C.coral} fontSize="9.6" fontWeight="700">OCT</text>
      <text x="48" y="55" textAnchor="middle" className="m-m" fill={C.text} fontSize="18" fontWeight="700">12</text>
      <text x="84" y="40" className="m-t" fill={C.text} fontSize="22.8" fontWeight="500">{title}</text>
      <text x="84" y="58" className="m-m" fill={C.muted} fontSize="13.2">{sub}</text>
      {right}
      <line x1="0" x2="1208" y1="82" y2="82" stroke={C.line} />
    </g>
  );
}

function Tabs({ x, items, on }: { x: number; items: string[]; on: string }) {
  return (
    <g>
      <rect x={x} y="26" width={items.length * 64 + 8} height="34" rx="10" fill={C.card} stroke={C.line} />
      {items.map((t, i) => (
        <g key={t}>
          {t === on && <rect x={x + 4 + i * 64} y="30" width="60" height="26" rx="7" fill="#232427" />}
          <text x={x + 34 + i * 64} y="48" textAnchor="middle" className="m-t" fill={t === on ? C.text : C.muted} fontSize="14.4">{t}</text>
        </g>
      ))}
    </g>
  );
}

const GROUPS: [string, string][] = [["All", C.text], ["Finance", C.fin], ["Activity", C.act], ["Entertainment", C.ent], ["Work", C.work], ["Personal", C.per]];

function Chips({ on = "All" }: { on?: string }) {
  const widths = GROUPS.map(([g]) => g.length * 8 + 28);
  return (
    <g>
      {GROUPS.map(([g, col], i) => {
        const w = widths[i];
        const x = 28 + widths.slice(0, i).reduce((sum, n) => sum + n + 8, 0);
        return (
          <g key={g}>
            <rect x={x} y="98" width={w} height="30" rx="15" fill={g === on ? "#232427" : "none"} stroke={g === on ? "none" : C.line} />
            {g !== "All" && <circle cx={x + 14} cy="113" r="3.5" fill={col} />}
            <text x={x + (g === "All" ? w / 2 : 24)} y="117" textAnchor={g === "All" ? "middle" : "start"} className="m-t" fill={g === on ? C.text : C.muted} fontSize="14.4">{g}</text>
          </g>
        );
      })}
    </g>
  );
}

function Event({ x, y, w, title, meta, col }: { x: number; y: number; w: number; title: string; meta: string; col: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height="52" rx="10" fill={col} fillOpacity="0.1" stroke={col} strokeOpacity="0.35" />
      <rect x={x} y={y + 8} width="3" height="36" rx="1.5" fill={col} />
      <text x={x + 16} y={y + 23} className="m-t" fill={C.text} fontSize="15.6" fontWeight="500">{title}</text>
      <text x={x + 16} y={y + 40} className="m-m" fill={C.muted} fontSize="12.6">{meta}</text>
    </g>
  );
}

export function TimelineDay() {
  const hours = ["6 AM", "8 AM", "10 AM", "12 PM", "2 PM", "4 PM", "6 PM", "8 PM", "10 PM"];
  return (
    <Win active="Timeline" label="Vox Timeline, Day view, with a day of purchases, meetings, music, games and places">
      <PageHead title="October 2026" sub="Monday, Oct 12, 2026" right={<><Tabs x={1000} items={["Day", "Week", "Month"]} on="Day" /></>} />
      <Chips />
      {hours.map((h, i) => (
        <g key={h}>
          <line x1={28 + i * 132} x2={28 + i * 132} y1="152" y2="880" stroke={C.line} strokeDasharray="2 6" />
          <text x={36 + i * 132} y="168" className="m-m" fill={C.dim} fontSize="12.6">{h}</text>
        </g>
      ))}
      <Event x={48} y={196} w={196} title="Blue Tokai Coffee" meta="₹320 · Finance · Gmail" col={C.fin} />
      <Event x={196} y={276} w={300} title="Design review" meta="Calendar · 10:00 – 11:00" col={C.work} />
      <Event x={92} y={356} w={250} title="Cubbon Park" meta="Visit · 7:40 – 8:30 AM" col={C.act} />
      <Event x={420} y={436} w={280} title="Swiggy order delivered" meta="Order · ₹486" col={C.act} />
      <Event x={560} y={196} w={250} title="Spotify · Deep Focus" meta="54 min · 12 tracks" col={C.ent} />
      <Event x={700} y={516} w={330} title="God of War Ragnarök" meta="PlayStation · 1h 20m" col={C.ent} />
      <Event x={820} y={276} w={210} title="Electricity bill" meta="Bill · due Oct 14" col={C.fin} />
      <Event x={900} y={356} w={250} title="Brunch with Maya" meta="Calendar · 1:00 PM" col={C.per} />
      <line x1="640" x2="640" y1="140" y2="880" stroke={C.coral} strokeDasharray="4 4" />
      <circle cx="640" cy="140" r="4" fill={C.coral} />
    </Win>
  );
}

export function TimelineMonth() {
  const counts = [3, 5, 2, 7, 4, 1, 0, 6, 4, 8, 3, 2, 5, 3, 7, 9, 4, 5, 6, 2, 1, 4, 8, 3, 5, 6, 4, 2, 7, 5, 3, 4, 6, 8, 2, 3, 5, 4, 6, 7, 3, 2];
  const dots = [C.fin, C.act, C.ent, C.work, C.per];
  return (
    <Win active="Timeline" label="Vox Timeline, Month view, with event counts and category dots on each day">
      <PageHead title="October 2026" sub="Oct 1 – Nov 7, 2026" right={<Tabs x={1000} items={["Day", "Week", "Month"]} on="Month" />} />
      <Chips />
      {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d, i) => (
        <text key={d} x={28 + i * 164 + 12} y="166" className="m-m" fill={C.dim} fontSize="12.6">{d}</text>
      ))}
      {counts.map((n, i) => {
        const col = i % 7;
        const row = Math.floor(i / 7);
        const x = 28 + col * 164;
        const y = 180 + row * 114;
        return (
          <g key={i}>
            <rect x={x} y={y} width="156" height="106" rx="12" fill={i === 11 ? "#17181a" : C.card} stroke={i === 11 ? C.coral : C.line} strokeOpacity={i === 11 ? 0.6 : 1} />
            <text x={x + 14} y={y + 26} className="m-m" fill={C.muted} fontSize="14.4">{(i % 31) + 1}</text>
            {n > 0 && <text x={x + 14} y={y + 60} className="m-t" fill={C.text} fontSize="24" fontWeight="500">{n}</text>}
            {n > 0 && <text x={x + 14} y={y + 76} className="m-m" fill={C.dim} fontSize="12">events</text>}
            {Array.from({ length: Math.min(n, 5) }).map((_, k) => (
              <circle key={k} cx={x + 16 + k * 14} cy={y + 94} r="3.5" fill={dots[(i + k) % 5]} />
            ))}
          </g>
        );
      })}
    </Win>
  );
}

export function EventDetail() {
  return (
    <Win active="Timeline" label="A Vox timeline entry opened to show its details and the sources it came from">
      <g opacity="0.35">
        <PageHead title="October 2026" sub="Monday, Oct 12, 2026" />
        <Event x={48} y={196} w={260} title="Blue Tokai Coffee" meta="₹320" col={C.fin} />
        <Event x={380} y={276} w={300} title="Design review" meta="Calendar" col={C.work} />
        <Event x={120} y={356} w={260} title="Cubbon Park" meta="Visit" col={C.act} />
      </g>
      <rect x="0" y="0" width="1208" height="900" fill="#000" fillOpacity="0.45" />
      <rect x="304" y="120" width="600" height="660" rx="18" fill="#0f1012" stroke="#2f3031" />
      <text x="336" y="170" className="m-t" fill={C.text} fontSize="28.8" fontWeight="500">Blue Tokai Coffee</text>
      <text x="336" y="196" className="m-t" fill={C.muted} fontSize="15.6">Card payment at a café, confirmed by email.</text>
      <text x="336" y="230" className="m-m" fill={C.dim} fontSize="13.8">Oct 11, 9:42 AM · minute precision</text>
      <line x1="336" x2="872" y1="254" y2="254" stroke={C.line} />
      {[["amount", "320"], ["currency", "INR"], ["merchant", "Blue Tokai Coffee"], ["direction", "debit"], ["is spending", "true"], ["reference", "UPI 4821 7710"]].map(([k, v], i) => (
        <g key={k}>
          <text x="336" y={290 + i * 44} className="m-m" fill={C.dim} fontSize="13.2">{k}</text>
          <text x="336" y={308 + i * 44} className="m-t" fill={C.text} fontSize="16.8">{v}</text>
        </g>
      ))}
      <line x1="336" x2="872" y1="560" y2="560" stroke={C.line} />
      <text x="336" y="592" className="m-m" fill={C.coral} fontSize="13.2" letterSpacing="1.2">WHERE THIS CAME FROM</text>
      <rect x="336" y="608" width="536" height="52" rx="12" fill={C.card} stroke={C.line} />
      <circle cx="362" cy="634" r="9" fill="#2a2b2d" />
      <text x="384" y="630" className="m-t" fill={C.text} fontSize="15.6">Gmail</text>
      <text x="384" y="648" className="m-m" fill={C.muted} fontSize="12.6">receipt email · message 18f3a2c</text>
      <rect x="336" y="670" width="536" height="52" rx="12" fill={C.card} stroke={C.line} />
      <circle cx="362" cy="696" r="9" fill="#2a2b2d" />
      <text x="384" y="692" className="m-t" fill={C.text} fontSize="15.6">Bank statement PDF</text>
      <text x="384" y="710" className="m-m" fill={C.muted} fontSize="12.6">merged as a duplicate · statement-oct.pdf</text>
    </Win>
  );
}

export function VoiceFilter() {
  const rows = [["Blue Tokai Coffee", "Oct 11, 9:42 AM", "320"], ["Metro card top-up", "Oct 11, 8:05 AM", "500"], ["Swiggy · Truffles", "Oct 10, 8:51 PM", "486"], ["Electricity bill", "Oct 9, 6:00 PM", "1,240"], ["Cult.fit membership", "Oct 8, 7:30 AM", "1,899"], ["Blue Tokai Coffee", "Oct 7, 10:12 AM", "280"], ["Amazon · USB-C cable", "Oct 6, 3:22 PM", "649"]];
  return (
    <Win active="Timeline" label="Vox Timeline filtered by voice to last week's spending">
      <PageHead title="October 2026" sub="Monday, Oct 12, 2026" />
      <text x="28" y="124" className="m-m" fill={C.muted} fontSize="13.8">Spending · 10/5/2026 – 10/12/2026 · Asia/Kolkata</text>
      <text x="1180" y="124" textAnchor="end" className="m-t" fill={C.muted} fontSize="14.4">Clear filter</text>
      {rows.map(([t, d, a], i) => (
        <g key={t + i}>
          <line x1="28" x2="1180" y1={170 + i * 62} y2={170 + i * 62} stroke={C.line} />
          <text x="28" y={206 + i * 62} className="m-t" fill={C.text} fontSize="18">{t}</text>
          <text x="1180" y={206 + i * 62} textAnchor="end" className="m-m" fill={C.muted} fontSize="13.8">{d}</text>
          <text x="760" y={206 + i * 62} className="m-m" fill={C.fin} fontSize="14.4">₹{a}</text>
        </g>
      ))}
    </Win>
  );
}

export function ConnectedApps() {
  const apps: [string, string, string][] = [["gmail", "Gmail", "Receipts, bills and statements"], ["google-calendar", "Google Calendar", "Meetings and appointments"], ["google-maps", "Google Maps", "Places and trips (Takeout)"], ["youtube", "YouTube", "Likes, playlists, watch history"], ["spotify", "Spotify", "Recent listening"], ["playstation", "PlayStation", "Game sessions"], ["swiggy", "Swiggy", "Food orders"]];
  return (
    <Win active="Home" label="Vox Connected Apps, showing each account with separate switches for Timeline and assistant reads">
      <text x="28" y="56" className="m-t" fill={C.text} fontSize="26.4" fontWeight="500">Connected Apps</text>
      <text x="28" y="80" className="m-t" fill={C.muted} fontSize="15.6">Choose what feeds Timeline and what the assistant may read.</text>
      {apps.map(([id, name, text], i) => {
        const x = 28 + (i % 3) * 392;
        const y = 120 + Math.floor(i / 3) * 232;
        return (
          <g key={id}>
            <rect x={x} y={y} width="376" height="216" rx="18" fill={C.card} stroke={C.line} />
            <image href={`/brands/${id}.svg`} x={x + 24} y={y + 24} width="40" height="40" />
            <text x={x + 24} y={y + 100} className="m-t" fill={C.text} fontSize="21.6" fontWeight="500">{name}</text>
            <text x={x + 24} y={y + 122} className="m-t" fill={C.muted} fontSize="15">{text}</text>
            {["Timeline", "Assistant"].map((s, k) => (
              <g key={s}>
                <rect x={x + 24 + k * 170} y={y + 158} width="34" height="20" rx="10" fill={C.fin} fillOpacity="0.9" />
                <circle cx={x + 48 + k * 170} cy={y + 168} r="7" fill="#06130d" />
                <text x={x + 68 + k * 170} y={y + 172} className="m-t" fill={C.muted} fontSize="14.4">{s}</text>
              </g>
            ))}
          </g>
        );
      })}
      <rect x="420" y="584" width="376" height="216" rx="18" fill="none" stroke={C.line} strokeDasharray="6 6" />
      <text x="608" y="698" textAnchor="middle" className="m-t" fill={C.muted} fontSize="16.8">+ Connect another account</text>
    </Win>
  );
}

function Chart({ x, y, title, kind }: { x: number; y: number; title: string; kind: "bar" | "line" | "area" }) {
  const pts = [40, 62, 48, 80, 70, 96, 84, 110, 92, 124];
  const prev = [30, 44, 52, 50, 66, 62, 78, 74, 88, 84];
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="584" height="300" rx="18" fill={C.card} stroke={C.line} />
      <text x="24" y="38" className="m-t" fill={C.text} fontSize="18" fontWeight="500">{title}</text>
      <text x="24" y="58" className="m-m" fill={C.muted} fontSize="12.6">Last 30 days vs previous period</text>
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1="24" x2="560" y1={96 + i * 46} y2={96 + i * 46} stroke={C.line} />
      ))}
      {kind === "bar" &&
        pts.map((p, i) => (
          <rect key={i} x={36 + i * 53} y={236 - p} width="26" height={p} rx="5" fill={C.coral} fillOpacity={0.35 + i * 0.06} />
        ))}
      {kind !== "bar" && (
        <>
          <polyline points={prev.map((p, i) => `${36 + i * 56},${236 - p}`).join(" ")} fill="none" stroke={C.muted} strokeDasharray="4 5" strokeWidth="2" />
          {kind === "area" && <polygon points={`36,236 ${pts.map((p, i) => `${36 + i * 56},${236 - p}`).join(" ")} 540,236`} fill={C.work} fillOpacity="0.14" />}
          <polyline points={pts.map((p, i) => `${36 + i * 56},${236 - p}`).join(" ")} fill="none" stroke={kind === "area" ? C.work : C.fin} strokeWidth="2.5" strokeLinejoin="round" />
        </>
      )}
    </g>
  );
}

export function Insights() {
  return (
    <Win active="Insights" label="Vox Insights charts comparing this period with the previous one">
      <text x="28" y="56" className="m-t" fill={C.text} fontSize="26.4" fontWeight="500">Insights</text>
      <rect x="984" y="30" width="196" height="34" rx="10" fill={C.card} stroke={C.line} />
      <text x="1082" y="52" textAnchor="middle" className="m-t" fill={C.text} fontSize="14.4">Sep 12 – Oct 12 · compare</text>
      <line x1="0" x2="1208" y1="82" y2="82" stroke={C.line} />
      <Chart x={28} y={110} title="Spending" kind="bar" />
      <Chart x={612} y={110} title="Play time" kind="area" />
      <Chart x={28} y={430} title="Listening" kind="line" />
      <Chart x={612} y={430} title="Workouts and steps" kind="area" />
    </Win>
  );
}

function Node({ x, y, w = 200, title, role, col }: { x: number; y: number; w?: number; title: string; role: string; col: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height="84" rx="14" fill={C.card} stroke={col} strokeOpacity="0.55" />
      <text x={x + 16} y={y + 26} className="m-m" fill={col} fontSize="12" letterSpacing="1">{role}</text>
      <text x={x + 16} y={y + 52} className="m-t" fill={C.text} fontSize="16.8" fontWeight="500">{title}</text>
      <rect x={x + 16} y={y + 62} width={w - 60} height="6" rx="3" fill="#2a2b2d" />
    </g>
  );
}

function Edge({ d, col }: { d: string; col: string }) {
  return <path d={d} fill="none" stroke={col} strokeOpacity="0.5" strokeWidth="2" strokeDasharray="6 6" />;
}

export function Plans() {
  return (
    <Win active="Plans" label="A Vox plan shown as a graph of connected research, synthesis and plan nodes">
      <PageHead title="Plan a week in Lisbon" sub="6 of 6 tasks done" />
      <Edge d="M232 420 C 300 420 300 260 360 260" col={C.work} />
      <Edge d="M232 420 C 300 420 300 420 360 420" col={C.work} />
      <Edge d="M232 420 C 300 420 300 580 360 580" col={C.work} />
      <Edge d="M560 260 C 640 260 640 420 720 420" col={C.act} />
      <Edge d="M560 420 C 640 420 640 420 720 420" col={C.per} />
      <Edge d="M560 580 C 640 580 640 420 720 420" col={C.act} />
      <Edge d="M920 420 C 980 420 980 420 1000 420" col={C.ent} />
      <Node x={32} y={378} title="A week in Lisbon, relaxed" role="GOAL" col={C.work} />
      <Node x={360} y={218} title="Neighbourhoods and stays" role="WEB RESEARCH" col={C.act} />
      <Node x={360} y={378} title="Your past trips and budget" role="YOUR DATA" col={C.per} />
      <Node x={360} y={538} title="Flights from your city" role="WEB RESEARCH" col={C.act} />
      <Node x={720} y={378} title="What fits you best" role="SYNTHESIS" col={C.ent} />
      <rect x="1000" y="360" width="188" height="120" rx="14" fill={C.card} stroke={C.coral} strokeOpacity="0.7" />
      <text x="1016" y="388" className="m-m" fill={C.coral} fontSize="12" letterSpacing="1">FINAL PLAN</text>
      <text x="1016" y="414" className="m-t" fill={C.text} fontSize="16.8" fontWeight="500">Day-by-day plan</text>
      <rect x="1016" y="428" width="140" height="6" rx="3" fill="#2a2b2d" />
      <rect x="1016" y="444" width="110" height="6" rx="3" fill="#2a2b2d" />
      <rect x="28" y="800" width="1150" height="52" rx="16" fill={C.card} stroke={C.line} />
      <text x="52" y="832" className="m-t" fill={C.muted} fontSize="15.6">Ask for a different direction, or refine a step…</text>
    </Win>
  );
}

export function Project() {
  return (
    <Win active="Projects" label="A Vox project's context canvas showing repositories and how they relate">
      <PageHead title="Payments platform" sub="3 sources · context up to date" />
      {["Context", "Plans", "Sources", "Activity"].map((t, i) => (
        <g key={t}>
          <text x={28 + i * 96} y="118" className="m-t" fill={i === 0 ? C.text : C.muted} fontSize="15.6">{t}</text>
          {i === 0 && <line x1="28" x2="84" y1="130" y2="130" stroke={C.coral} strokeWidth="2" />}
        </g>
      ))}
      <Edge d="M300 300 C 420 300 420 220 520 220" col={C.work} />
      <Edge d="M300 300 C 420 300 420 400 520 400" col={C.work} />
      <Edge d="M720 220 C 820 220 820 300 900 300" col={C.act} />
      <Edge d="M720 400 C 820 400 820 300 900 300" col={C.act} />
      <Edge d="M720 400 C 780 400 780 560 840 560" col={C.ent} />
      <Node x={100} y={258} title="api-service" role="REPOSITORY" col={C.work} />
      <Node x={520} y={178} title="billing module" role="MODULE" col={C.act} />
      <Node x={520} y={358} title="ledger module" role="MODULE" col={C.act} />
      <Node x={900} y={258} title="Settlement flow" role="CONTEXT · FROM CODE" col={C.fin} />
      <Node x={840} y={518} title="Retry policy" role="CONTEXT · INFERRED" col={C.per} />
    </Win>
  );
}

export function Home() {
  const blocks = Array.from({ length: 150 }, (_, i) => {
    const r = (n: number) => Math.abs(Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1;
    return { x: r(1) * 1180, y: r(2) * 880, w: 18 + r(3) * 60, h: 14 + r(4) * 46 };
  });
  return (
    <Win active="Home" label="The Vox desktop home screen with a dark city map and a single pin">
      <rect width="1208" height="900" fill="#0b0c0e" />
      {blocks.map((b, i) => (
        <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx="2" fill="#17181a" stroke="#1f2022" />
      ))}
      <path d="M0 640 L1208 330" stroke="#202123" strokeWidth="14" />
      <path d="M380 0 L560 900" stroke="#202123" strokeWidth="10" />
      <rect x="560" y="396" width="86" height="28" rx="8" fill="#0f1012" stroke="#2f3031" />
      <text x="603" y="415" textAnchor="middle" className="m-m" fill={C.text} fontSize="13.2">Lisbon</text>
      <line x1="600" x2="600" y1="424" y2="470" stroke={C.text} />
      <rect x="590" y="470" width="20" height="30" rx="3" fill={C.coral} />
    </Win>
  );
}

export const MOCKS: Record<string, () => ReactNode> = {
  "timeline-day": TimelineDay,
  "timeline-month": TimelineMonth,
  "event-detail": EventDetail,
  "voice-filter": VoiceFilter,
  "connected-apps": ConnectedApps,
  insights: Insights,
  plans: Plans,
  project: Project,
  home: Home,
};
