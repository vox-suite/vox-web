import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import { MOCKS } from "./mocks";
import { ReplicaSvg } from "./replica-svg";

const SIZES = {
  window: { width: 3840, height: 2160 },
  phone: { width: 1080, height: 2400 },
} as const;

const TRIMMED: Record<string, [number, number]> = {
  "timeline-day": [3328, 840],
  "voice-filter": [3328, 1320],
};

const COMPOSED = new Set(["timeline-month"]);

const REPLICAS = new Set([
  "timeline-day",
  "event-detail",
  "voice-filter",
  "connected-apps",
  "insights",
  "plans",
  "project",
  "home",
]);

const FULL: [number, number, number, number] = [0, 0, 1920, 1080];
const CROP: [number, number, number, number] = [256, 0, 1664, 1080];
const TRIM: Record<string, [number, number, number, number]> = {
  "timeline-day": [256, 0, 1664, 420],
  "voice-filter": [256, 0, 1664, 660],
};

export function replicaExists(name: string) {
  return REPLICAS.has(name) && fs.existsSync(path.join(process.cwd(), "public", "replicas", `${name}.svg`));
}

export function shotExists(name: string) {
  return fs.existsSync(path.join(process.cwd(), "public", "shots", `${name}.webp`));
}

export function ProductShot({
  name,
  alt,
  kind = "window",
  priority = false,
  crop = false,
  trim = false,
}: {
  name: string;
  alt: string;
  label?: string;
  kind?: keyof typeof SIZES;
  priority?: boolean;
  crop?: boolean;
  trim?: boolean;
}) {
  const { width, height } = SIZES[kind];
  const Mock = MOCKS[name];
  const real = shotExists(name);
  if (kind === "window" && COMPOSED.has(name) && Mock) {
    return (
      <figure data-theme="dark" className={`h-shot h-shot-window${crop ? " h-shot-crop" : ""}`}>
        <div className="h-shot-mock">
          <Mock />
          <span className="h-preview">Preview</span>
        </div>
      </figure>
    );
  }
  if (kind === "window" && replicaExists(name)) {
    const box = trim && TRIM[name] ? TRIM[name] : crop ? CROP : FULL;
    return (
      <figure data-theme="dark" className={`h-shot h-shot-window h-shot-replica${crop || trim ? " h-shot-replicacrop" : ""}`}>
        <ReplicaSvg name={name} box={box} label={alt} />
      </figure>
    );
  }
  const trimmed = trim && real ? TRIMMED[name] : undefined;
  if (trimmed) {
    return (
      <figure data-theme="dark" className="h-shot h-shot-window h-shot-real">
        <Image
          src={`/shots/cropped/${name}.webp`}
          alt={alt}
          width={trimmed[0]}
          height={trimmed[1]}
          sizes="(min-width: 1200px) 560px, 100vw"
        />
      </figure>
    );
  }
  return (
    <figure data-theme="dark" className={`h-shot h-shot-${kind}${crop ? " h-shot-crop" : ""}${real ? " h-shot-real" : ""}`}>
      {real ? (
        <Image
          src={`/shots/${name}.webp`}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          sizes={kind === "phone" ? "(min-width: 900px) 240px, 60vw" : "(min-width: 1200px) 1100px, 100vw"}
        />
      ) : (
        Mock && (
          <div className="h-shot-mock">
            <Mock />
            <span className="h-preview">Preview</span>
          </div>
        )
      )}
    </figure>
  );
}
