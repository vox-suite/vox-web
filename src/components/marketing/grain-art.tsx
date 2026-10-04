"use client";

import { useEffect, useRef } from "react";

type Blob = { x: number; y: number; s: number; a: number; c: 0 | 1 };

export function GrainArt({
  colors,
  blobs,
  seed = 1,
}: {
  colors: [string, string];
  blobs: Blob[];
  seed?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const rgb = colors.map((hex) => [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16),
    ]);

    const paint = () => {
      const px = 2;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
      let s = seed * 9301 + 49297;
      const rand = () => {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
      };
      ctx.clearRect(0, 0, w, h);
      for (let y = 0; y < h; y += px) {
        for (let x = 0; x < w; x += px) {
          const u = x / w;
          const v = y / h;
          let val = 0;
          let mix = 0;
          for (const b of blobs) {
            const dx = (u - b.x) * (w / h);
            const dy = v - b.y;
            const g = b.a * Math.exp(-(dx * dx + dy * dy) / (b.s * b.s));
            val += g;
            mix += g * b.c;
          }
          if (val < 0.02) continue;
          if (val < rand() * 1.15) continue;
          const m = mix / val;
          const k = Math.min(1, 0.55 + val * 0.6);
          const r = (rgb[0][0] * (1 - m) + rgb[1][0] * m) * k;
          const g2 = (rgb[0][1] * (1 - m) + rgb[1][1] * m) * k;
          const b2 = (rgb[0][2] * (1 - m) + rgb[1][2] * m) * k;
          ctx.fillStyle = `rgb(${r | 0},${g2 | 0},${b2 | 0})`;
          ctx.fillRect(x, y, px, px);
        }
      }
    };

    paint();
    const ro = new ResizeObserver(paint);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [colors, blobs, seed]);

  return <canvas ref={ref} className="grain-art" aria-hidden="true" />;
}
