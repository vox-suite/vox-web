import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import { buttonVariants } from "@/components/ui";
import { cn } from "@/lib/utils";

/** Opens a provider in a new tab. Used for labelled handoffs, which never claim completion. */
export function ExternalLinkButton({
  href,
  children,
  "aria-label": ariaLabel,
}: {
  href: string;
  children: ReactNode;
  "aria-label"?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className={cn(
        buttonVariants({ variant: "secondary", size: "sm" }),
        "no-underline",
      )}
    >
      {children}
      <ExternalLink aria-hidden="true" />
    </a>
  );
}
