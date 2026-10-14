"use client";
import { useEffect } from "react";

export function HeaderScroll() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".h-header");
    if (!header) return;
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      header.dataset.scrolled = String(y > 8);
      if (Math.abs(y - last) < 6) return;
      header.dataset.hidden = String(y > last && y > 120 && !header.contains(document.activeElement));
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return null;
}
