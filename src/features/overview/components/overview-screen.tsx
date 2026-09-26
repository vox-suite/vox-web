"use client";

import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { PageHeader, Tag } from "@/components/app";
import { useAccount } from "@/components/app-shell/account-context";
import { useAppHref } from "@/components/app-shell/app-paths";
import { NAV_ITEMS } from "@/components/app-shell/navigation";

export function OverviewScreen() {
  const account = useAccount();
  const href = useAppHref();
  const queryClient = useQueryClient();
  const destinations = NAV_ITEMS.filter((item) => item.path !== "/");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={<Tag tone="positive">Signed in</Tag>}
        title={`Welcome${account.name ? `, ${account.name}` : ""}.`}
        description={account.email}
      />
      <section aria-labelledby="overview-areas" className="space-y-3">
        <h2 id="overview-areas" className="text-sm font-medium text-mist">
          Your account
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {destinations.map((item) => {
            const Icon = item.icon;
            const warm = item.prefetch
              ? () => item.prefetch?.(queryClient)
              : undefined;
            return (
              <li key={item.path} className="min-w-0">
                <Link
                  href={href(item.path)}
                  prefetch
                  onMouseEnter={warm}
                  onFocus={warm}
                  className="group flex h-full flex-col gap-3 rounded-xl border border-border-edge bg-ink p-5 no-underline shadow-subtle-3 transition-colors hover:border-slate hover:bg-obsidian"
                >
                  <span className="flex items-center justify-between">
                    <span className="flex size-8 items-center justify-center rounded-md border border-border-edge bg-obsidian text-mist">
                      <Icon size={16} aria-hidden="true" />
                    </span>
                    <ArrowUpRight
                      size={16}
                      aria-hidden="true"
                      className="text-smoke transition-colors group-hover:text-pure-white"
                    />
                  </span>
                  <span className="space-y-1">
                    <span className="block text-sm font-medium text-pure-white">
                      {item.label}
                    </span>
                    <span className="block text-[13px] leading-relaxed text-smoke">
                      {item.description}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
      <p className="font-mono text-xs text-smoke">
        Vox account · Canonical identity and authority protected by Core
      </p>
    </div>
  );
}
