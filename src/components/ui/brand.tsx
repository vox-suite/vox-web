import Link from "next/link";
import { cn } from "@/lib/utils";
import { VoxLogo } from "./vox-logo";

export function Brand({
  href = "/",
  size = 28,
  animated = false,
  className,
}: {
  href?: string;
  animated?: boolean;
  size?: number;
  className?: string;
}) {
  const key = Math.max(24, size);
  return (
    <Link
      className={cn(
        "inline-flex items-center gap-2.5 text-pure-white no-underline hover:text-pure-white",
        className,
      )}
      href={href}
      aria-label="Vox home"
    >
      <span
        data-brand-mark
        className="flex shrink-0 items-center justify-center text-coral-pulse"
      >
        <VoxLogo animated={animated} size={key} aria-hidden="true" />
      </span>
      <span className="font-display text-[17px] font-semibold tracking-[-0.02em]">
        Vox
      </span>
    </Link>
  );
}
