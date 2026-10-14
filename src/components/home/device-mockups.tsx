import { VoxOrbSvg } from "@/components/ui/vox-logo";
import { PhoneFrame } from "./phone-frame";
import { ProductShot, replicaExists } from "./product-shot";
import { ReplicaSvg } from "./replica-svg";

export function MacMockup() {
  const label = "The Vox desktop home screen with its city map, on a laptop";
  return (
    <div className="h-mac">
      <div className="h-mac-lid">
        <div className="h-mac-screen">
          {replicaExists("home") ? (
            <ReplicaSvg name="home" box={[0, 0, 1728, 1080]} label={label} />
          ) : (
            <ProductShot name="home" alt={label} />
          )}
        </div>
      </div>
      <div className="h-mac-base" aria-hidden="true" />
    </div>
  );
}

const ICON = { fill: "none", strokeLinecap: "round", strokeLinejoin: "round" } as const;

export function AndroidMockup() {
  return (
    <PhoneFrame
      id="android"
      label="Vox on Android: the home screen with the map, shortcuts for the timeline and connected apps, and a Talk button"
    >
      <defs>
        <linearGradient id="android-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.55" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="android-bottom" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="android-avatar" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4a4b52" />
          <stop offset="1" stopColor="#25262a" />
        </linearGradient>
      </defs>
      <rect x="18" y="18" width="608" height="1320" fill="#0b0c0e" />
      <image href="/shots/android-home-map.jpg" x="18" y="18" width="608" height="1320" preserveAspectRatio="xMidYMid slice" />
      <rect x="18" y="18" width="608" height="140" fill="url(#android-top)" />
      <rect x="18" y="1100" width="608" height="238" fill="url(#android-bottom)" />

      <text x="52" y="66" className="h-android-t" fontSize="28" fontWeight="500" fill="#fff">
        6:34
      </text>
      <circle cx="322" cy="58" r="12" fill="#000" />
      <circle cx="322" cy="58" r="12" fill="none" stroke="#1d1e21" strokeWidth="2" />
      <g fill="#fff">
        <text x="424" y="62" className="h-android-t" fontSize="17" fontWeight="600">5G+</text>
        <rect x="470" y="60" width="5" height="8" rx="1" opacity="0.5" />
        <rect x="478" y="55" width="5" height="13" rx="1" opacity="0.7" />
        <rect x="486" y="50" width="5" height="18" rx="1" />
        <rect x="494" y="45" width="5" height="23" rx="1" />
      </g>
      <g {...ICON} stroke="#fff" strokeWidth="2.6">
        <path d="M513 52a20 20 0 0 1 28 0" />
        <path d="M518 58a13 13 0 0 1 18 0" />
        <path d="M523 64a6 6 0 0 1 8 0" />
        <circle cx="581" cy="58" r="10" />
      </g>

      <rect x="44" y="1216" width="206" height="76" rx="38" fill="#101113" fillOpacity="0.9" stroke="#fff" strokeOpacity="0.08" />
      <g style={{ color: "#e4e4e7" }}>
        <VoxOrbSvg size={56} x={64} y={1226} />
      </g>
      <g transform="translate(129 1236) scale(1.4)" {...ICON} stroke="#a1a1aa" strokeWidth="1.6">
        <path d="M8 2v4M16 2v4M3 10h18" />
        <rect x="3" y="4" width="18" height="18" rx="2" />
      </g>
      <g transform="translate(192 1236) scale(1.4)" {...ICON} stroke="#a1a1aa" strokeWidth="1.6">
        <path d="M12 22v-5M9 8V2M15 8V2" />
        <path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z" />
      </g>

      <rect x="364" y="1216" width="144" height="76" rx="38" fill="#101113" fillOpacity="0.9" stroke="#fff" strokeOpacity="0.08" />
      <g transform="translate(396 1240) scale(1.2)" {...ICON} stroke="#fff" strokeWidth="1.8">
        <path d="M12 19v3M19 10v2a7 7 0 0 1-14 0v-2" />
        <rect x="9" y="2" width="6" height="13" rx="3" />
      </g>
      <text x="440" y="1264" className="h-android-t" fontSize="27" fontWeight="500" fill="#fff">
        Talk
      </text>

      <circle cx="568" cy="1254" r="38" fill="#101113" fillOpacity="0.9" stroke="#fff" strokeOpacity="0.1" />
      <circle cx="568" cy="1254" r="31" fill="url(#android-avatar)" />
      <text x="568" y="1264" textAnchor="middle" className="h-android-t" fontSize="26" fontWeight="500" fill="#e4e4e7">
        AM
      </text>

      <rect x="214" y="1316" width="216" height="6" rx="3" fill="#fff" fillOpacity="0.8" />
    </PhoneFrame>
  );
}
