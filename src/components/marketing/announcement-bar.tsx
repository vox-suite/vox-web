"use client";

import * as React from "react";
import Link from "next/link";
import { X } from "lucide-react";

export function AnnouncementBar() {
  const [open, setOpen] = React.useState(true);

  if (!open) return null;

  return (
    <div
      role="region"
      aria-label="Announcement"
      className="relative z-50 flex min-h-[40px] w-full items-center justify-between border-b border-black/20 bg-ink px-4 py-2 font-mono text-[13px] text-parchment sm:px-8 sm:text-[14px]"
    >
      <div className="mx-auto flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-center">
        <span className="inline-flex items-center rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-white border border-white/20">
          VOX INTEL
        </span>
        <span className="font-normal tracking-[-0.02em]">
          Vox Desktop and the dual-process Core are in the latest release notes.
        </span>
        <Link
          href="/changelog"
          className="ml-2 inline-flex items-center rounded-full border border-white bg-white px-3 py-0.5 text-[11px] font-medium uppercase tracking-wider text-black transition-all hover:bg-parchment hover:scale-105 active:scale-95"
        >
          Read more
        </Link>
      </div>

      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Dismiss announcement"
        className="ml-2 inline-flex size-6 shrink-0 items-center justify-center rounded-full text-white/60 hover:text-white transition-colors cursor-pointer"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
