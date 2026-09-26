import { Skeleton } from "@/components/ui";

/** Placeholder for a workspace page while its route payload is on the way. */
export function PageSkeleton() {
  return (
    <div role="status" aria-label="Loading page" className="space-y-6">
      <div className="space-y-3 border-b border-border-edge pb-6">
        <Skeleton className="h-7 w-64 bg-graphite" />
        <Skeleton className="h-4 w-full max-w-xl bg-graphite/70" />
      </div>
      <div className="space-y-3 rounded-xl border border-border-edge bg-ink p-5">
        <Skeleton className="h-4 w-40 bg-graphite" />
        <Skeleton className="h-20 w-full bg-graphite/60" />
        <Skeleton className="h-20 w-full bg-graphite/60" />
      </div>
    </div>
  );
}
