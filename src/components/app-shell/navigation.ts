import type { QueryClient } from "@tanstack/react-query";
import {
  BellRing,
  Blocks,
  LayoutDashboard,
  ListChecks,
  LockKeyhole,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { agentQueries } from "@/features/agents/queries";
import { connectionQueries } from "@/features/connections/queries";
import { extensionQueries } from "@/features/extensions/queries";
import { preferenceQueries } from "@/features/preferences/queries";
import { reminderQueries } from "@/features/reminders/queries";
import { skillQueries } from "@/features/skills/queries";

export type NavItem = {
  path: string;
  label: string;
  description: string;
  icon: LucideIcon;
  /** Warms the cache on hover/focus so the destination renders with data. */
  prefetch?: (queryClient: QueryClient) => void;
};

export type NavGroup = { label: string; items: NavItem[] };

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      {
        path: "/",
        label: "Overview",
        description: "Your account at a glance.",
        icon: LayoutDashboard,
      },
      {
        path: "/tasks",
        label: "Tasks",
        description:
          "Durable tasks that survive restarts, with Core-authoritative state.",
        icon: ListChecks,
      },
      {
        path: "/reminders",
        label: "Reminders",
        description:
          "Explicit-timezone reminders with verifiable delivery receipts.",
        icon: BellRing,
        prefetch: (qc) => void qc.prefetchQuery(reminderQueries.list()),
      },
      {
        path: "/approvals",
        label: "Approvals",
        description:
          "Inspect exact action details before anything consequential runs.",
        icon: ShieldCheck,
      },
    ],
  },
  {
    label: "Control",
    items: [
      {
        path: "/apps",
        label: "Apps & skills",
        description:
          "Connected accounts, apps you added, agent access, and skills.",
        icon: Blocks,
        prefetch: (qc) => {
          void qc.prefetchQuery(connectionQueries.list());
          void qc.prefetchQuery(extensionQueries.list());
          void qc.prefetchQuery(agentQueries.selected());
          void qc.prefetchQuery(skillQueries.list());
        },
      },
      {
        path: "/privacy",
        label: "Privacy & data",
        description:
          "Saved preferences, history deletion, and portable export.",
        icon: LockKeyhole,
        prefetch: (qc) => void qc.prefetchQuery(preferenceQueries.list()),
      },
      {
        path: "/account",
        label: "Account",
        description: "Email recovery, linked identities, and sessions.",
        icon: UserRound,
      },
    ],
  },
];

export const NAV_ITEMS = NAV_GROUPS.flatMap((group) => group.items);

export function isActivePath(itemPath: string, segment: string) {
  if (itemPath === "/") return segment === "/";
  return segment === itemPath || segment.startsWith(`${itemPath}/`);
}
