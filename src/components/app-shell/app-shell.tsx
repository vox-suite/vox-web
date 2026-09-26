"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog } from "radix-ui";
import { LogOut, Menu, X } from "lucide-react";
import { Brand, Button } from "@/components/ui";
import { signOut } from "@/features/account/session";
import { cn } from "@/lib/utils";
import { useAccount } from "./account-context";
import { appSegment, useAppHref, useAppPaths } from "./app-paths";
import { NAV_GROUPS, isActivePath } from "./navigation";

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const segment = appSegment(pathname);
  const href = useAppHref();
  const queryClient = useQueryClient();

  return (
    <nav aria-label="Account" className="flex flex-col gap-6 px-3 py-5">
      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="flex flex-col gap-0.5">
          <p className="px-3 pb-1.5 font-mono text-[11px] font-medium uppercase tracking-wider text-smoke">
            {group.label}
          </p>
          {group.items.map((item) => {
            const active = isActivePath(item.path, segment);
            const Icon = item.icon;
            const warm = item.prefetch
              ? () => item.prefetch?.(queryClient)
              : undefined;
            return (
              <Link
                key={item.path}
                href={href(item.path)}
                onClick={onNavigate}
                onMouseEnter={warm}
                onFocus={warm}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-[13px] text-ash no-underline transition-colors hover:bg-graphite hover:text-pure-white",
                  active && "bg-graphite text-pure-white",
                )}
              >
                <Icon size={16} aria-hidden="true" className="shrink-0" />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {active ? (
                  <span
                    aria-hidden="true"
                    className="size-1.5 shrink-0 rounded-full bg-coral-pulse"
                  />
                ) : null}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function AccountCard() {
  const account = useAccount();
  const { signInHref } = useAppPaths();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);
  const initial = (account.name || account.email || "V")
    .charAt(0)
    .toUpperCase();

  return (
    <div className="flex items-center gap-3 border-t border-border-edge p-3">
      <div
        aria-hidden="true"
        className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border-edge bg-graphite font-mono text-xs text-mist"
      >
        {account.image ? (
          // eslint-disable-next-line @next/next/no-img-element -- OAuth avatar from an arbitrary provider host
          <img
            src={account.image}
            alt=""
            className="size-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          initial
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-mist">
          {account.name}
        </p>
        <p className="truncate text-xs text-smoke" title={account.email}>
          {account.email}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Sign out"
        title="Sign out"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          queryClient.clear();
          await signOut("local", signInHref);
        }}
      >
        <LogOut aria-hidden="true" />
      </Button>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const href = useAppHref();

  return (
    <div className="min-h-dvh bg-void-black lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-border-edge bg-ink lg:flex">
        <div className="flex h-14 shrink-0 items-center border-b border-border-edge px-5">
          <Brand href={href("/")} />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <SidebarNav />
        </div>
        <AccountCard />
      </aside>

      <div className="flex min-w-0 flex-col">
        <Dialog.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border-edge bg-ink/95 px-4 backdrop-blur lg:hidden">
            <Dialog.Trigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Open navigation"
              >
                <Menu aria-hidden="true" />
              </Button>
            </Dialog.Trigger>
            <Brand href={href("/")} size={24} />
          </header>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-40 bg-void-black/70 data-[state=open]:animate-in data-[state=open]:fade-in-0 lg:hidden" />
            <Dialog.Content className="fixed inset-y-0 left-0 z-50 flex w-[min(288px,85vw)] flex-col border-r border-border-edge bg-ink shadow-xl outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-left lg:hidden">
              <div className="flex h-14 shrink-0 items-center justify-between border-b border-border-edge px-5">
                <Dialog.Title className="sr-only">Navigation</Dialog.Title>
                <Dialog.Description className="sr-only">
                  Move between areas of your Vox account.
                </Dialog.Description>
                <Brand href={href("/")} />
                <Dialog.Close asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Close navigation"
                  >
                    <X aria-hidden="true" />
                  </Button>
                </Dialog.Close>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">
                <SidebarNav onNavigate={() => setDrawerOpen(false)} />
              </div>
              <AccountCard />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        <main
          id="main"
          tabIndex={-1}
          className="flex-1 px-4 py-6 outline-none sm:px-6 lg:px-10 lg:py-10"
        >
          <div className="mx-auto w-full max-w-[1200px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
