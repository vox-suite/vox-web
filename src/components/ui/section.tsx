import type { ReactNode } from "react";

export function Section({
  title,
  description,
  children,
  id,
}: {
  children: ReactNode;
  title?: string;
  description?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className="mx-auto w-full max-w-[1200px] px-6 py-20 md:px-8 md:py-[80px] lg:py-[120px]"
    >
      {title ? (
        <header className="mb-10 max-w-2xl space-y-3">
          <h2 className="text-heading font-normal text-pure-white">{title}</h2>
          {description ? (
            <p className="text-body text-ash">{description}</p>
          ) : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}
