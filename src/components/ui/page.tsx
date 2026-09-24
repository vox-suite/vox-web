import type { ReactNode } from "react";
import { Row, Stack } from "./stack";

export function Page({
  title,
  description,
  actions,
  children,
}: {
  children: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-2xl space-y-2">
          <p className="font-mono text-[10px] tracking-[0.05em] text-smoke uppercase">
            Vox workspace
          </p>
          <h1 className="text-heading font-normal tracking-tight text-pure-white">
            {title}
          </h1>
          {description ? (
            <p className="text-body text-ash">{description}</p>
          ) : null}
        </div>
        {actions ? <Row>{actions}</Row> : null}
      </header>
      <Stack gap="large">{children}</Stack>
    </div>
  );
}
