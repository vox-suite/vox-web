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
} from "lucide-react";
import { Badge, Brand } from "@/components/ui";
import { adminModules, adminHref } from "@/lib/admin-modules";
import { SignOutButton } from "./auth-controls";
const icons = {
  overview: LayoutDashboard,
  health: Activity,
  database: Database,
  design: Palette,
  module: Blocks,
};
export function AdminShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email: string;
}) {
  const pathname = usePathname();
  const isClean = !pathname.startsWith("/admin");
  const basePath = isClean ? "" : "/admin";
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
                <Icon size={17} aria-hidden="true" />
                {module.title}
              </Link>
            );
          })}
        </nav>
        <div className="admin-sidebar-bottom">
          <Badge tone="accent">
            <ShieldCheck size={12} aria-hidden="true" />
            Superuser workspace
          </Badge>
          <small>
            One workspace.
            <br />
            Room to grow.
          </small>
        </div>
      </aside>
      <div>
        <header className="admin-topbar">
          <p>Vox / Administration</p>
          <div className="admin-user">
            <div className="admin-avatar" aria-hidden="true">
              {email.slice(0, 1).toUpperCase()}
            </div>
            <span>{email}</span>
          </div>
          <SignOutButton />
        </header>
        <main id="main">{children}</main>
      </div>
    </div>
  );
}
