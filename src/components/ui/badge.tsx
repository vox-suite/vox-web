import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-wider whitespace-nowrap transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-ash dark:border-[#2c2a27] bg-white/60 dark:bg-white/5 text-off-black dark:text-[#f6f3f1]",
        secondary:
          "border-ash/60 dark:border-white/10 bg-parchment dark:bg-card text-graphite dark:text-[#aba7a2]",
        outline:
          "border-ash dark:border-[#2c2a27] bg-transparent text-graphite dark:text-[#aba7a2]",
        destructive:
          "border-crimson/30 bg-crimson/10 text-crimson",
        ghost:
          "border-transparent bg-transparent text-smoke",
        link:
          "border-transparent text-lake-blue underline-offset-4 hover:underline",
        neutral:
          "border-ash dark:border-[#2c2a27] bg-white/60 dark:bg-white/5 text-off-black dark:text-[#f6f3f1]",
        positive:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
        accent:
          "border-lake-blue/30 bg-lake-blue/10 text-lake-blue dark:text-[#7ba2ff]",
        warning:
          "border-[#ecda98] bg-[#ecda98]/20 text-[#f37a0a]",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

function Badge({
  className,
  variant = "neutral",
  tone,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean;
    tone?:
      | "neutral"
      | "positive"
      | "accent"
      | "warning"
      | "error"
      | "destructive";
  }) {
  const Comp = asChild ? Slot.Root : "span";
  const toneMapped = tone === "error" ? "destructive" : tone;
  const resolved = toneMapped ?? variant;

  return (
    <Comp
      data-slot="badge"
      data-variant={resolved}
      className={cn(badgeVariants({ variant: resolved }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
