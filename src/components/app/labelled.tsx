import type { ReactNode } from "react";

/**
 * Shows compact visual text while giving assistive technology a fuller
 * description. Use instead of `aria-label` on non-interactive elements,
 * where the attribute is not reliably announced.
 */
export function Labelled({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <>
      <span aria-hidden="true">{children}</span>
      <span className="sr-only">{label}</span>
    </>
  );
}
