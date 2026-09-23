import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-md border border-transparent bg-white/5 px-3 py-2 text-base text-pure-white transition-colors outline-none placeholder:text-ash focus-visible:border-border-edge focus-visible:ring-2 focus-visible:ring-ash/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-coral-pulse aria-invalid:ring-coral-pulse/20",
        className
      )}
      {...props}
    />
  );
}

export { Input };
