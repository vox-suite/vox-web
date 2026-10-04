import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center font-mono font-medium uppercase transition-all duration-150 outline-none select-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 rounded-[100px]",
  {
    variants: {
      variant: {
        default:
          "bg-lake-blue dark:bg-[#3d6cf0] text-white hover:brightness-110 shadow-sm active:translate-y-px",
        primary:
          "bg-lake-blue dark:bg-[#3d6cf0] text-white hover:brightness-110 shadow-sm active:translate-y-px",
        secondary:
          "bg-off-black dark:bg-[#f6f3f1] text-[#f6f3f1] dark:text-[#242424] hover:bg-black dark:hover:bg-white active:translate-y-px",
        outline:
          "border border-ash dark:border-[#2c2a27] bg-transparent text-off-black dark:text-[#f6f3f1] hover:border-off-black dark:hover:border-white active:translate-y-px",
        ghost:
          "bg-transparent text-off-black dark:text-[#f6f3f1] hover:bg-black/5 dark:hover:bg-white/5 active:translate-y-px",
        destructive:
          "bg-crimson text-white hover:brightness-110 active:translate-y-px",
        danger:
          "bg-crimson text-white hover:brightness-110 active:translate-y-px",
        link:
          "text-off-black dark:text-[#f6f3f1] underline-offset-4 hover:underline rounded-none p-0",
      },
      size: {
        default: "h-11 px-7 text-[13px] tracking-[-0.02em] gap-2",
        xs: "h-7 px-3 text-[11px] tracking-[-0.033em] gap-1",
        sm: "h-9 px-5 text-[12px] tracking-[-0.033em] gap-1.5",
        lg: "h-13 px-9 text-[15px] tracking-[-0.02em] gap-2.5",
        icon: "size-10 px-0",
        "icon-xs": "size-7 px-0",
        "icon-sm": "size-8 px-0",
        "icon-lg": "size-12 px-0",
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
