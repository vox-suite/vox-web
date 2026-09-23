import type { ReactNode } from "react";

export function DataTable({
  caption,
  headings,
  children,
}: {
  children: ReactNode;
  caption: string;
  headings: string[];
}) {
  return (
    <div
      className="w-full overflow-x-auto rounded-2xl shadow-subtle-3"
      tabIndex={0}
      role="region"
      aria-label={caption}
    >
      <table className="w-full min-w-[480px] border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-border-edge">
            {headings.map((h) => (
              <th
                key={h}
                scope="col"
                className="px-4 py-3 text-[13px] font-medium text-smoke"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-ash">{children}</tbody>
      </table>
    </div>
  );
}
