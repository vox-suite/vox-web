"use client";

import { useEffect } from "react";

export function InteractiveEffects() {
  useEffect(() => {
    let rafId: number;
    let mouseX = -1000;
    let mouseY = -1000;
    let targetX = -1000;
    let targetY = -1000;

    const spotlightEl = document.getElementById("vox-cursor-spotlight");

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;

      document.documentElement.style.setProperty("--cursor-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--cursor-y", `${e.clientY}px`);

      // Find relevant section or interactive element
      const target = (e.target as HTMLElement)?.closest(
        ".hero, .feature-card, .demo, .story, .story-art, .principles-art, .closing, .footer-wordmark, .capability-line"
      ) as HTMLElement | null;

      if (target) {
        const rect = target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        target.style.setProperty("--card-mouse-x", `${x}px`);
        target.style.setProperty("--card-mouse-y", `${y}px`);
        target.style.setProperty(
          "--card-mouse-percent-x",
          `${((x / rect.width) * 100).toFixed(1)}%`
        );
        target.style.setProperty(
          "--card-mouse-percent-y",
          `${((y / rect.height) * 100).toFixed(1)}%`
        );
      }
    };

    const updateCursor = () => {
      mouseX += (targetX - mouseX) * 0.18;
      mouseY += (targetY - mouseY) * 0.18;

      if (spotlightEl && mouseX > -500) {
        spotlightEl.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
        spotlightEl.style.opacity = "1";
      }

      rafId = requestAnimationFrame(updateCursor);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    rafId = requestAnimationFrame(updateCursor);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      id="vox-cursor-spotlight"
      className="cursor-spotlight-follower"
      aria-hidden="true"
    />
  );
}
