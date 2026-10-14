"use client";
import { useRef } from "react";
import { ChevronDown } from "lucide-react";
export function MobileMenu({ links }: { links: string[][] }) {
  const disclosure = useRef<HTMLDetailsElement>(null);
  return (
    <details className="h-mobile-menu" ref={disclosure}>
      <summary>
        Explore
        <ChevronDown size={13} aria-hidden="true" />
      </summary>
      <nav aria-label="Mobile section navigation">
        {links.map(([href, label]) => (
          <a
            key={href}
            href={href}
            onClick={() => {
              if (disclosure.current) disclosure.current.open = false;
            }}
          >
            {label}
          </a>
        ))}
      </nav>
    </details>
  );
}
