"use client";

import * as React from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  window.addEventListener("storage", callback);
  return () => {
    observer.disconnect();
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot() {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

function getServerSnapshot() {
  return false;
}

export function ThemeToggle({ className }: { className?: string }) {
  const isDark = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleTheme = () => {
    const nextDark = !isDark;
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("vox_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("vox_theme", "light");
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={cn(
        "group inline-flex h-9 items-center gap-2 rounded-full border border-ash dark:border-[#2c2a27] bg-parchment dark:bg-card px-3.5 font-mono text-[11px] uppercase tracking-wider text-graphite dark:text-[#aba7a2] hover:border-off-black dark:hover:border-[#f6f3f1] transition-all cursor-pointer shadow-sm active:scale-95",
        className
      )}
    >
      {isDark ? (
        <>
          <Moon className="size-3.5 text-lake-blue dark:text-[#7ba2ff]" />
          <span>Dark</span>
        </>
      ) : (
        <>
          <Sun className="size-3.5 text-[#f37a0a]" />
          <span>Parchment</span>
        </>
      )}
    </button>
  );
}
