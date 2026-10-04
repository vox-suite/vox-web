import type { ReactNode } from "react";

export function BlueprintFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-[1432px] -translate-x-1/2 border-x border-ash/40 dark:border-[#2c2a27] xl:block"
      />
      {children}
    </div>
  );
}

export function PageNoise() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[60] opacity-[0.035] dark:opacity-[0.05] mix-blend-multiply dark:mix-blend-screen"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: "160px 160px",
      }}
      aria-hidden="true"
    />
  );
}

export function CornerTicks() {
  return (
    <>
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 hidden -translate-x-1/2 -translate-y-1/2 font-mono text-[11px] text-ash dark:text-[#7b7773] select-none xl:block"
      >
        +
      </span>
      <span
        aria-hidden="true"
        className="absolute right-0 top-0 hidden translate-x-1/2 -translate-y-1/2 font-mono text-[11px] text-ash dark:text-[#7b7773] select-none xl:block"
      >
        +
      </span>
    </>
  );
}
