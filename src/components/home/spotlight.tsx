"use client";

import type { ReactNode, PointerEvent } from "react";

export function Spotlight({
  children,
  className = "",
  as: Tag = "div",
  href,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "li" | "a";
  href?: string;
}) {
  function move(event: PointerEvent<HTMLElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", `${event.clientX - box.left}px`);
    event.currentTarget.style.setProperty("--my", `${event.clientY - box.top}px`);
  }
  const props = { className: `h-spot ${className}`, onPointerMove: move };
  if (Tag === "a") return <a {...props} href={href}>{children}</a>;
  if (Tag === "article") return <article {...props}>{children}</article>;
  if (Tag === "li") return <li {...props}>{children}</li>;
  return <div {...props}>{children}</div>;
}
