"use client";

import { useEffect, useRef } from "react";

const ramp: [number, number, number][] = [
  [11, 15, 20],
  [18, 32, 52],
  [40, 70, 110],
  [90, 125, 185],
  [157, 184, 240],
  [168, 230, 207],
  [238, 245, 248],
];

function color(v: number) {
  const t = Math.min(0.999, Math.max(0, v)) * (ramp.length - 1);
  const i = Math.floor(t);
  const f = t - i;
  const a = ramp[i];
  const b = ramp[i + 1];
  return `rgb(${(a[0] + (b[0] - a[0]) * f) | 0},${(a[1] + (b[1] - a[1]) * f) | 0},${(a[2] + (b[2] - a[2]) * f) | 0})`;
}

export function HeroCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cell = window.innerWidth < 640 ? 7 : 9;
    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let dpr = 1;
    let visible = true;
    let raf = 0;
    const mouse = { x: 0.62, y: 0.46, tx: 0.62, ty: 0.46, flare: 0 };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / cell);
      rows = Math.ceil(h / cell);
    };

    const voice = (t: number) =>
      0.5 +
      0.5 *
        Math.max(0, Math.sin(t * 1.9) * Math.sin(t * 0.63 + 1) + 0.35 * Math.sin(t * 5.3));

    const draw = (time: number) => {
      const t = time / 2200;
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;
      mouse.flare *= 0.95;
      const amp = Math.min(1, voice(t) * 0.8 + mouse.flare);

      const wide = w > 820;
      const cx = (wide ? mouse.x : 0.5) * w;
      const cy = (wide ? mouse.y : 0.34) * h;
      const R = Math.min(w, h) * (wide ? 0.3 : 0.27) * (1 + amp * 0.05);

      ctx.fillStyle = "#0b0f14";
      ctx.fillRect(0, 0, w, h);

      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const x = i * cell + cell / 2;
          const y = j * cell + cell / 2;
          const dx = x - cx;
          const dy = y - cy;
          const r = Math.hypot(dx, dy);
          const n =
            Math.sin(x * 0.011 + t * 0.7) * Math.cos(y * 0.014 - t * 0.5) +
            0.5 * Math.sin((x + y) * 0.02 + t * 1.1);
          const ang = Math.atan2(dy, dx);

          let v: number;
          if (r < R) {
            const nz = Math.sqrt(1 - (r / R) ** 2);
            const light = (-dx * 0.55 - dy * 0.7) / R + nz * 0.75;
            v = 0.12 + Math.max(0, light) * 0.62 + n * 0.1 + amp * 0.1;
            v *= 0.55 + nz * 0.6;
          } else {
            const k = (r - R) / R;
            const halo = Math.exp(-k * 2.6) * (0.5 + amp * 0.35);
            const rays = Math.max(0, Math.sin(ang * 5 - t * 0.5 + n)) * Math.exp(-k * 1.4) * 0.5;
            const ring = Math.max(0, Math.sin((r - t * (60 + amp * 90)) * 0.045)) * Math.exp(-k * 1.8) * amp * 0.45;
            v = halo * 0.6 + rays * 0.45 + ring + n * 0.04 * Math.exp(-k);
          }

          if (v < 0.05) continue;
          const size = cell * Math.min(0.96, 0.3 + v * 0.75);
          ctx.fillStyle = color(v);
          ctx.fillRect(x - size / 2, y - size / 2, size, size);
        }
      }

      const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.25, w / 2, h / 2, Math.max(w, h) * 0.75);
      vig.addColorStop(0, "rgba(11,15,20,0)");
      vig.addColorStop(1, "rgba(11,15,20,0.9)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);
    };

    const loop = (time: number) => {
      if (visible) draw(time);
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.tx = 0.5 + ((e.clientX - r.left) / r.width - 0.5) * 0.35 + 0.12;
      mouse.ty = 0.46 + ((e.clientY - r.top) / r.height - 0.5) * 0.25;
      mouse.flare = Math.min(1, mouse.flare + 0.08);
    };

    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (still) draw(4000);
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(canvas);

    if (still) {
      draw(4000);
    } else {
      window.addEventListener("pointermove", onMove);
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={ref} className="hero-canvas" aria-hidden="true" />;
}
