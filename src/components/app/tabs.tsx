"use client";

import type { ComponentProps } from "react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

/** Accessible tabs (arrow-key navigation, roving focus) styled for the app. */
export const Tabs = TabsPrimitive.Root;

export function TabsList({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        "flex max-w-full gap-1 overflow-x-auto border-b border-border-edge",
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "-mb-px shrink-0 border-b-2 border-transparent px-3 py-2 text-[13px] font-medium whitespace-nowrap text-smoke transition-colors outline-none hover:text-mist focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ash/50 data-[state=active]:border-mist data-[state=active]:text-pure-white",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn("pt-5 outline-none", className)}
      {...props}
    />
  );
}
