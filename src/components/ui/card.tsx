import * as React from "react";
import { cn } from "@/lib/utils";

function CardRoot({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "flex flex-col gap-6 overflow-hidden rounded-[40px] border border-ash dark:border-[#2c2a27] bg-card p-8 sm:p-10 text-card-foreground transition-colors",
        size === "sm" && "gap-4 p-6 rounded-[28px]",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="card-title"
      className={cn("font-serif text-[24px] font-normal leading-[1.2] tracking-[-0.02em] text-off-black dark:text-[#f6f3f1]", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("font-mono text-[14px] leading-relaxed text-graphite dark:text-[#aba7a2]", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("self-start justify-self-end", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="card-content" className={cn("text-sm", className)} {...props} />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center gap-3 border-t border-ash/40 dark:border-white/10 pt-4",
        className,
      )}
      {...props}
    />
  );
}

export {
  CardRoot,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
