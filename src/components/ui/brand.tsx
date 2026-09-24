import Link from "next/link";
import { cn } from "@/lib/utils";
import { VoxLogo } from "./vox-logo";

export function Brand({
  href = "/",
  animated = false,
  size = 28,
  className,
}: {
  href?: string;
  animated?: boolean;
  size?: number;
  className?: string;
}) {
  return (
    <Link
      className={cn(
        "inline-flex items-center gap-2 text-pure-white no-underline hover:text-pure-white",
        className,
      )}
      href={href}
      aria-label="Vox home"
    >
      <span
        className="flex size-3.5 shrink-0 items-center justify-center"
        aria-hidden="true"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <rect
            x="5"
            y="0.5"
            width="6"
            height="6"
            rx="1"
            transform="rotate(45 5 0.5)"
            fill="#ff6363"
          />
        </svg>
      </span>
      <span data-brand-mark className="inline-flex shrink-0">
        <VoxLogo animated={animated} size={size} />
      </span>
      <span className="text-[13px] font-medium tracking-tight">vox</span>
    </Link>
  );
}
