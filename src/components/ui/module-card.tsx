import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

export function ModuleCard({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-4 rounded-xl border border-border-edge bg-ink p-6 text-inherit no-underline shadow-subtle-3 transition-all hover:border-smoke/40 hover:bg-graphite/40"
    >
      <span className="flex size-11 items-center justify-center rounded-lg border border-border-edge/60 bg-obsidian text-mist">
        {icon}
      </span>
      <h2 className="text-subheading font-medium text-pure-white">{title}</h2>
      <p className="text-body text-ash">{description}</p>
      <span className="inline-flex items-center gap-1 text-[13px] font-medium text-ash group-hover:text-pure-white">
        Open {title.toLowerCase()} <ArrowUpRight size={16} aria-hidden="true" />
      </span>
    </Link>
  );
}
