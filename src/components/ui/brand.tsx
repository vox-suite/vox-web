import Link from "next/link";
import { cn } from "@/lib/utils";

// Anodised crimson key: the single Vox mark. `animated` kept for call-site compatibility.
export function Brand({
  href = "/",
  size = 28,
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
        className="anodised flex shrink-0 items-center justify-center rounded-[8px]"
        style={{ width: key, height: key }}
        aria-hidden="true"
      >
        <svg
          width={key * 0.5}
          height={key * 0.5}
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M2 2.5 6 9.5 10 2.5"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="font-display text-[17px] font-semibold tracking-[-0.02em]">
        Vox
      </span>
    </Link>
  );
}
