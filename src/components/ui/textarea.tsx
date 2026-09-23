import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-24 w-full rounded-md border border-transparent bg-white/5 px-3 py-2 text-base text-pure-white transition-colors outline-none placeholder:text-ash focus-visible:border-border-edge focus-visible:ring-2 focus-visible:ring-ash/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-coral-pulse aria-invalid:ring-coral-pulse/20",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
