"use client";

import { useEffect } from "react";
import { animate, useReducedMotion } from "framer-motion";

export function HeaderScroll() {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".h-header");
    if (!header) return;
    let last = window.scrollY;
    let hidden = false;
    let controls: { stop: () => void } | undefined;

    const setHidden = (next: boolean) => {
      header.dataset.hidden = String(next);
      if (next === hidden) return;
      hidden = next;
      controls?.stop();
      controls = animate(
        header,
        { y: next ? -120 : 0, opacity: next ? 0 : 1 },
        { duration: reduceMotion ? 0 : next ? 0.22 : 0.38, ease: [0.22, 1, 0.36, 1] },
      );
    };
    const onScroll = () => {
      const y = window.scrollY;
      header.dataset.scrolled = String(y > 8);
      if (y <= 8) setHidden(false);
      if (Math.abs(y - last) < 6) return;
      setHidden(y > last && y > 120 && !header.contains(document.activeElement));
      last = y;
    };
    const onFocus = () => setHidden(false);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    header.addEventListener("focusin", onFocus);
    return () => {
      controls?.stop();
      window.removeEventListener("scroll", onScroll);
      header.removeEventListener("focusin", onFocus);
    };
  }, [reduceMotion]);
  return null;
}
