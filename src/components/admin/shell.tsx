"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Blocks,
  Database,
  LayoutDashboard,
  Palette,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { Badge, Brand } from "@/components/ui";
import { adminModules, adminHref } from "@/lib/admin-modules";
import type { AdminUser } from "@/lib/auth";
import { SignOutButton } from "./auth-controls";

const icons = {
  overview: LayoutDashboard,
  health: Activity,
  database: Database,
  design: Palette,
  module: Blocks,
  pipeline: Workflow,
};

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
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Brand href={basePath || "/"} />
        <nav aria-label="Administration">
          <p className="admin-nav-label">Workspace</p>
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
                className="admin-nav-link"
                aria-current={active ? "page" : undefined}
              >
                <Icon size={16} aria-hidden="true" />
                <span className="flex-1">{module.title}</span>
                {active && (
                  <span className="admin-nav-active-pill" aria-hidden="true" />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="admin-sidebar-bottom">
          <Badge tone="accent">
            <ShieldCheck size={12} aria-hidden="true" />
            Superuser cockpit
          </Badge>
          <div className="admin-sidebar-meta">
            <span>v1.104.21 · Raycast Engine</span>
            <span>Zero-trust perimeter</span>
          </div>
        </div>
      </aside>
      <div className="admin-main-wrap">
        <header className="admin-topbar">
          <div className="admin-breadcrumbs">
            <span className="admin-breadcrumb-brand">vox</span>
            <span className="admin-breadcrumb-sep">/</span>
            <span className="admin-breadcrumb-current">admin</span>
          </div>
          <div className="admin-topbar-right">
            <div className="admin-status-indicator" title="Perimeter active">
              <span className="admin-status-dot" aria-hidden="true" />
              <span>Live System</span>
            </div>
            <div className="admin-user" title={emailStr}>
              <div className="admin-avatar" aria-hidden="true">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt={firstName}
                    className="admin-avatar-image"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  firstName.slice(0, 1).toUpperCase()
                )}
              </div>
              <span className="admin-user-name">{firstName}</span>
            </div>
            <SignOutButton />
          </div>
        </header>
        <main id="main" className="admin-main">
          {children}
        </main>
      </div>
    </div>
  );
}
