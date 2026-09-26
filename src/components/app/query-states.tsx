import type { ReactNode } from "react";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui";
import { Skeleton } from "@/components/ui";
import { errorMessage } from "@/lib/api/http";
import { Callout } from "./callout";

export function ErrorState({
  error,
  title = "This could not be loaded",
  onRetry,
  retrying = false,
}: {
  error: unknown;
  title?: string;
  onRetry?: () => void;
  retrying?: boolean;
}) {
  return (
    <Callout
      tone="danger"
      title={title}
      live="assertive"
      actions={
        onRetry ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={onRetry}
            disabled={retrying}
          >
            <RotateCw
              aria-hidden="true"
              className={retrying ? "animate-spin" : undefined}
            />
            {retrying ? "Retrying…" : "Try again"}
          </Button>
        ) : null
      }
    >
      <p>{errorMessage(error)}</p>
    </Callout>
  );
}

export function ListSkeleton({
  rows = 3,
  label = "Loading",
}: {
  rows?: number;
  label?: string;
}) {
  return (
    <div role="status" aria-label={label} className="space-y-3">
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="space-y-3 rounded-lg border border-border-edge bg-obsidian/40 p-4"
        >
          <Skeleton className="h-4 w-1/3 bg-graphite" />
          <Skeleton className="h-3 w-2/3 bg-graphite/70" />
        </div>
      ))}
      <span className="sr-only">{label}…</span>
    </div>
  );
}

export function EmptyMessage({
  title,
  children,
  action,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-lg border border-dashed border-border-edge px-5 py-6">
      <p className="text-sm font-medium text-mist">{title}</p>
      {children ? (
        <p className="max-w-xl text-[13px] leading-relaxed text-smoke">
          {children}
        </p>
      ) : null}
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}
