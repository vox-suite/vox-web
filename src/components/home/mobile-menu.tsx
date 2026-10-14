"use client";
import { useRef } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
export function MobileMenu({ links, current }: { links: string[][]; current?: string }) {
  const disclosure = useRef<HTMLDetailsElement>(null);
  return (
    <details className="h-mobile-menu" ref={disclosure}>
      <summary>
        Explore
        <ChevronDown size={13} aria-hidden="true" />
      </summary>
      <nav aria-label="Mobile navigation">
        {links.map(([href, label]) => (
          <Link
            key={href}
            href={href}
            aria-current={href === `/${current}` ? "page" : undefined}
            onClick={() => {
              if (disclosure.current) disclosure.current.open = false;
            }}
          >
            {label}
          </Link>
        ))}
        <span className="h-nav-pending">Insights · Coming soon</span>
        <span className="h-nav-pending">Projects · Coming soon</span>
      </nav>
    </details>
  );
}
