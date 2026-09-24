import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-md border border-transparent px-1.5 py-0.5 text-xs font-medium whitespace-nowrap transition-colors",
  {
    variants: {
      variant: {
        default: "bg-graphite text-pure-white",
        secondary: "bg-obsidian text-ash",
        outline: "border-border-edge text-ash",
        destructive: "bg-ember-hush text-coral-pulse",
        ghost: "text-ash",
        link: "text-ash underline-offset-4 hover:underline",
        neutral: "bg-graphite text-pure-white",
        positive: "bg-obsidian text-success-green",
        accent: "bg-ember-hush text-coral-pulse",
        warning: "bg-obsidian text-mist",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
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
    tone?: "neutral" | "positive" | "accent" | "warning" | "error" | "destructive";
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
