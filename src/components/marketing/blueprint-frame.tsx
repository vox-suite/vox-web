import type { ReactNode } from "react";

// Continuous construction guides down both edges of the 1200px column,
// with a diagonal-hatch gutter beyond them — the architectural-blueprint
// framing the reference layout uses to read as a technical drawing.
export function BlueprintFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-[1200px] -translate-x-1/2 border-x border-[#1c1d1f] xl:block"
      />
      <div
        aria-hidden="true"
        className="bp-hatch pointer-events-none absolute inset-y-0 left-0 hidden w-[max(0px,calc(50%-600px))] opacity-70 xl:block"
      />
      <div
        aria-hidden="true"
        className="bp-hatch pointer-events-none absolute inset-y-0 right-0 hidden w-[max(0px,calc(50%-600px))] opacity-70 xl:block"
      />
      {children}
    </div>
  );
}

// Small crosshair ticks marking where a section boundary meets the
// construction guides. Place inside a `relative` max-w-[1200px] wrapper.
export function CornerTicks() {
  return (
    <>
      <span
        aria-hidden="true"
        className="bp-tick absolute left-0 top-0 hidden -translate-x-1/2 -translate-y-1/2 xl:block"
      >
        +
      </span>
      <span
        aria-hidden="true"
        className="bp-tick absolute right-0 top-0 hidden translate-x-1/2 -translate-y-1/2 xl:block"
      >
        +
      </span>
    </>
  );
}
