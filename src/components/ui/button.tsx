import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg text-[13px] font-medium whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-2 focus-visible:ring-ash/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-mist px-3 py-2 text-iron shadow-[rgba(0,0,0,0.03)_0px_7px_3px_0px,rgba(0,0,0,0.25)_0px_4px_4px_0px] hover:bg-pure-white",
        primary:
          "bg-mist px-3 py-2 text-iron shadow-[rgba(0,0,0,0.03)_0px_7px_3px_0px,rgba(0,0,0,0.25)_0px_4px_4px_0px] hover:bg-pure-white",
        secondary:
          "border border-border-edge bg-transparent px-3 py-2 text-ash hover:border-ash hover:text-pure-white",
        outline:
          "border border-border-edge bg-transparent px-3 py-2 text-ash hover:border-ash hover:text-pure-white",
        ghost: "bg-transparent px-3 py-2 text-ash hover:text-pure-white",
        destructive:
          "bg-ember-hush px-3 py-2 text-coral-pulse hover:bg-ember-hush/80",
        danger:
          "bg-ember-hush px-3 py-2 text-coral-pulse hover:bg-ember-hush/80",
        link: "text-ash underline-offset-4 hover:text-pure-white hover:underline",
      },
      size: {
        default: "h-9",
        xs: "h-6 gap-1 px-2 text-xs",
        sm: "h-8 gap-1.5 px-2.5",
        lg: "h-10 gap-2 px-4",
        icon: "size-9 px-0",
        "icon-xs": "size-6 px-0",
        "icon-sm": "size-7 px-0",
        "icon-lg": "size-10 px-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "primary",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
