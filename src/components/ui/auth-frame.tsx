import type { ReactNode } from "react";
import { Brand } from "./brand";

export function AuthFrame({
  children,
  brandHref = "/",
  footer = "Vox administration · Access by invitation",
}: {
  children: ReactNode;
  brandHref?: string;
  footer?: string;
}) {
  return (
    <main
      id="main"
      className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-8 px-6 py-16"
    >
      <Brand href={brandHref} />
      <div className="w-full rounded-2xl bg-ink p-6 shadow-subtle-3 md:p-8">
        {children}
      </div>
      <p className="font-mono text-xs text-smoke">{footer}</p>
    </main>
  );
}
