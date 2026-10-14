"use client";
import { Monitor, Moon, Sun } from "lucide-react";

const order = ["auto", "light", "dark"] as const;

export function ThemeToggle() {
  return (
    <button
      type="button"
      className="h-theme"
      title="Change theme"
      onClick={() => {
        const root = document.documentElement;
        const current = (root.dataset.themePref ?? "auto") as (typeof order)[number];
        const next = order[(order.indexOf(current) + 1) % order.length];
        root.dataset.themePref = next;
        root.dataset.theme =
          next === "auto" ? (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark") : next;
        try {
          localStorage.setItem("vox-theme", next);
        } catch {}
      }}
    >
      <span className="h-theme-auto"><Monitor size={16} aria-hidden="true" /><span className="h-sr">Theme: auto</span></span>
      <span className="h-theme-light"><Sun size={16} aria-hidden="true" /><span className="h-sr">Theme: light</span></span>
      <span className="h-theme-dark"><Moon size={16} aria-hidden="true" /><span className="h-sr">Theme: dark</span></span>
    </button>
  );
}
