import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardRoot,
  CardTitle,
} from "./card";

export function Card({
  children,
  title,
  description,
  tone = "plain",
  className,
}: {
  children: ReactNode;
  title?: string;
  description?: string;
  tone?: "plain" | "soft" | "subtle" | "contrast";
  className?: string;
}) {
  return (
    <CardRoot
      className={cn(
        tone === "soft" && "bg-ink",
        tone === "subtle" && "bg-obsidian",
        tone === "contrast" && "bg-graphite",
        tone === "plain" && "bg-transparent",
        className,
      )}
    >
      {title ? (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
        </CardHeader>
      ) : null}
      <CardContent>{children}</CardContent>
    </CardRoot>
  );
}
