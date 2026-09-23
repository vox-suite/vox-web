"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  Blocks,
  Database,
  LayoutDashboard,
  Menu,
  Palette,
  ShieldCheck,
  Workflow,
  X,
} from "lucide-react";
import { Badge, Brand, Button } from "@/components/ui";
import { adminModules, adminHref } from "@/lib/admin-modules";
import type { AdminUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { SignOutButton } from "./auth-controls";

const icons = {
  overview: LayoutDashboard,
  health: Activity,
  database: Database,
  design: Palette,
  module: Blocks,
  pipeline: Workflow,
};

function AdminNav({
  basePath,
  pathname,
  onNavigate,
}: {
  basePath: string;
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Administration" className="flex flex-1 flex-col gap-0.5 px-3 py-4">
      <p className="px-3 pb-2 font-mono text-[11px] font-medium uppercase tracking-wider text-smoke">
        Workspace
      </p>
      {adminModules.map((module) => {
        const Icon = icons[module.icon];
        const href = adminHref(module.slug, basePath);
        const active =
          pathname === href ||
          (module.slug && pathname.startsWith(`${href}/`)) ||
          pathname === (module.slug ? `/${module.slug}` : "/");
        return (
          <Link
            key={module.slug}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-ash no-underline transition-colors duration-150 hover:bg-graphite hover:text-pure-white",
              active &&
                "bg-graphite text-pure-white shadow-subtle-3 hover:bg-graphite hover:text-pure-white",
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={16} aria-hidden="true" className="shrink-0" />
            <span className="min-w-0 flex-1 truncate">{module.title}</span>
            {active ? (
              <span
                className="size-1.5 shrink-0 rounded-full bg-coral-pulse"
                aria-hidden="true"
              />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({
  children,
  user,
  email,
}: {
  children: React.ReactNode;
  user?: AdminUser | null;
  email?: string;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isClean = !pathname.startsWith("/admin");
  const basePath = isClean ? "" : "/admin";

  const emailStr = user?.email || email || "";
  const rawFirst = user?.name?.trim()
    ? user.name.trim().split(/\s+/)[0]
    : emailStr.split("@")[0].split(".")[0];
  const firstName =
    rawFirst && rawFirst.length > 0
      ? rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1)
      : "Admin";
  const avatarUrl = user?.image;

  return (
    <div className="flex min-h-screen bg-void-black">
      <aside className="hidden w-[260px] shrink-0 flex-col border-r border-border-edge bg-ink shadow-subtle-3 md:flex">
        <div className="border-b border-border-edge px-5 py-5">
          <Brand href={basePath || "/"} />
        </div>
        <AdminNav basePath={basePath} pathname={pathname} />
        <div className="mt-auto flex flex-col gap-3 border-t border-border-edge p-4">
          <Badge tone="accent">
            <ShieldCheck size={12} aria-hidden="true" />
            Superuser cockpit
          </Badge>
          <div className="flex flex-col gap-1 font-mono text-[10px] leading-relaxed text-smoke">
            <span>v1.104.21 · Raycast Engine</span>
            <span>Zero-trust perimeter</span>
          </div>
        </div>
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-void-black/70"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 flex h-full w-[280px] flex-col border-r border-border-edge bg-ink shadow-subtle-3">
            <div className="flex items-center justify-between border-b border-border-edge px-5 py-4">
              <Brand href={basePath || "/"} />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Close navigation"
                onClick={() => setMobileOpen(false)}
              >
                <X size={16} />
              </Button>
            </div>
            <AdminNav
              basePath={basePath}
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border-edge bg-ink px-4 py-3 shadow-subtle-3 md:px-6">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="md:hidden"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={16} />
            </Button>
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <span className="font-medium text-pure-white">vox</span>
              <span className="text-smoke">/</span>
              <span className="text-ash">admin</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <div
              className="flex items-center gap-2 rounded-md border border-border-edge bg-obsidian px-2.5 py-1 font-mono text-[11px] text-ash"
              title="Perimeter active"
            >
              <span
                className="size-1.5 rounded-full bg-success-green shadow-[0_0_6px_var(--color-success-green)]"
                aria-hidden="true"
              />
              <span>Live System</span>
            </div>
            <div
              className="flex items-center gap-2 rounded-md px-1 py-0.5"
              title={emailStr}
            >
              <div
                className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border-edge bg-graphite font-mono text-xs font-medium text-mist"
                aria-hidden="true"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={firstName}
                    className="size-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  firstName.slice(0, 1).toUpperCase()
                )}
              </div>
              <span className="hidden text-sm text-mist sm:inline">{firstName}</span>
            </div>
            <SignOutButton />
          </div>
        </header>
        <main id="main" className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
