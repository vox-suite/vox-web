import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Notice({
  title,
  children,
  tone = "info",
}: {
  children: ReactNode;
  title: string;
  tone?: "info" | "error" | "success";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl p-4 shadow-subtle-3",
        tone === "info" && "bg-obsidian",
        tone === "error" && "bg-ember-hush",
        tone === "success" && "bg-obsidian",
      )}
      role={tone === "error" ? "alert" : "status"}
    >
      <strong
        className={cn(
          "block text-sm font-medium",
          tone === "error" && "text-coral-pulse",
          tone === "success" && "text-success-green",
          tone === "info" && "text-pure-white",
        )}
      >
        {title}
      </strong>
      <div className="mt-1 text-sm text-ash">{children}</div>
    </div>
  );
}
