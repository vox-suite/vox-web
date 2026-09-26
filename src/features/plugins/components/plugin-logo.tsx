"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export type PluginLogoSize = "sm" | "md" | "lg" | "xl";

export interface PluginLogoProps {
  logoFile?: string | null;
  alt: string;
  size?: PluginLogoSize;
  className?: string;
  backgroundColor?: string;
}

const sizeConfig: Record<
  PluginLogoSize,
  {
    container: string;
    image: string;
    text: string;
  }
> = {
  sm: {
    container: "size-7 rounded-lg",
    image: "size-4",
    text: "text-[10px]",
  },
  md: {
    container: "size-10 rounded-xl",
    image: "size-6",
    text: "text-xs font-semibold",
  },
  lg: {
    container: "size-14 rounded-2xl",
    image: "size-8",
    text: "text-base font-bold",
  },
  xl: {
    container: "size-20 rounded-3xl",
    image: "size-12",
    text: "text-xl font-bold",
  },
};

export function PluginLogo({
  logoFile,
  alt,
  size = "md",
  className,
  backgroundColor,
}: PluginLogoProps) {
  const [hasError, setHasError] = useState(false);
  const config = sizeConfig[size] ?? sizeConfig.md;

  const src = logoFile
    ? logoFile.startsWith("/") || logoFile.startsWith("http")
      ? logoFile
      : `/plugins/logos/${logoFile}`
    : null;

  const showImage = Boolean(src) && !hasError;
  const fallbackInitials = alt
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || "P";

  return (
    <div
      data-slot="plugin-logo"
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden border border-border-edge bg-obsidian shadow-subtle-3 transition-colors",
        config.container,
        className,
      )}
      style={backgroundColor ? { backgroundColor } : undefined}
    >
      {showImage ? (
        // Standard HTML img for crisp SVG vector rendering without Next.js Image wrapper constraints
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src!}
          alt={alt}
          onError={() => setHasError(true)}
          className={cn("object-contain pointer-events-none select-none", config.image)}
          loading="lazy"
        />
      ) : (
        <span
          className={cn(
            "select-none uppercase text-mist font-medium tracking-tight",
            config.text,
          )}
          aria-label={alt}
        >
          {fallbackInitials}
        </span>
      )}
    </div>
  );
}
