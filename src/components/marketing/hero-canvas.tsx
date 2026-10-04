"use client";

import { useEffect, useRef } from "react";

const ramp: [number, number, number][] = [
  [11, 15, 20],
  [16, 30, 50],
  [34, 62, 104],
  [78, 112, 178],
  [138, 168, 242],
  [168, 230, 207],
  [240, 247, 250],
];

const lut = Array.from({ length: 256 }, (_, i) => {
  const t = (i / 255) * (ramp.length - 1);
  const k = Math.min(ramp.length - 2, Math.floor(t));
  const f = t - k;
  const a = ramp[k];
  const b = ramp[k + 1];
  return `rgb(${(a[0] + (b[0] - a[0]) * f) | 0},${(a[1] + (b[1] - a[1]) * f) | 0},${(a[2] + (b[2] - a[2]) * f) | 0})`;
});

const hash = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

const noise = (x: number, y: number) => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};

const fbm = (x: number, y: number) => {
  let s = 0;
  let a = 0.5;
  for (let i = 0; i < 3; i++) {
    s += a * noise(x, y);
    x = x * 2.03 + 17;
    y = y * 2.03 + 31;
    a *= 0.5;
  }
  return s;
};

export function HeroCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 640;
    const cw = small ? 5 : 6;
    const ch = small ? 11 : 13;
    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let visible = true;
    let raf = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / cw);
      rows = Math.ceil(h / ch);
    };

    const draw = (time: number) => {
      const t = time / 2000;
      const amp =
        0.2 + 0.5 * Math.max(0, Math.sin(t * 1.9) * Math.sin(t * 0.63 + 1) + 0.3 * Math.sin(t * 5.3));
      const breathe = 1 + Math.sin(t * 1.1) * 0.05 + amp * 0.12;

      const cx = w * 0.5 + Math.sin(t * 0.5) * w * 0.02;
      const cy = h * 0.4 + Math.cos(t * 0.37) * h * 0.02;
      const sx = Math.max(w * 0.34, h * 0.5) * breathe;
      const sy = h * 0.58 * breathe;
      const wide = 2.4 / Math.min(w, h);
      const tick = Math.floor(time / 140);

      ctx.fillStyle = "#0b0f14";
      ctx.fillRect(0, 0, w, h);

      for (let j = 0; j < rows; j++) {
        let shift = 0;
        const g = hash(j, tick);
        if (g > 0.985) shift = (g - 0.985) * 3000 * (hash(j, 9) > 0.5 ? 1 : -1);
        shift += Math.sin(j * 0.35 + t * 2) * amp * 3;
        const y = j * ch + ch / 2;
        const py = (y - cy) / sy;
        for (let i = 0; i < cols; i++) {
          const x = i * cw + cw / 2 + shift;
          const px = (x - cx) / sx;
          const d2 = px * px + py * py * (py < 0 ? 0.7 : 1);
          if (d2 > 3) continue;

          const nx = (x - cx) * wide;
          const ny = (y - cy) * wide;
          const warp = 2.6 + amp * 1.6;
          const qx = fbm(nx + t * 0.32, ny - t * 0.2);
          const qy = fbm(nx + 5.2 - t * 0.2, ny + 1.3 + t * 0.26);
          const r = fbm(nx + warp * qx, ny + warp * qy + t * 0.18);

          const env = Math.exp(-d2 * 1.5);
          const core = Math.exp(-d2 * 6) * (0.45 + amp * 0.5);
          const v = env * (0.08 + 2.2 * r * r * 1.6) + core;
          if (v < 0.06) continue;
          const k = Math.min(255, (v * 255) | 0);
          ctx.fillStyle = lut[k];
          ctx.fillRect(x - cw / 2, y - ch / 2, cw - 1, ch - 1);
        }
      }

      const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
      vig.addColorStop(0, "rgba(11,15,20,0)");
      vig.addColorStop(1, "rgba(11,15,20,0.9)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);
    };

    const loop = (time: number) => {
      if (visible) draw(time);
      raf = requestAnimationFrame(loop);
    };

    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (still) draw(6000);
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(canvas);

    if (still) {
      draw(6000);
    } else {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return <canvas ref={ref} className="hero-canvas" aria-hidden="true" />;
}
