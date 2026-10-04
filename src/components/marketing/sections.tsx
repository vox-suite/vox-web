import Link from "next/link";
import { CHANGELOG_DATA } from "@/components/changelog/changelog-data";
import { FAQSection } from "./faq-section";

const latestReleases = CHANGELOG_DATA.slice(0, 3);

export function LatestSection() {
  return (
    <section id="recently-shipped" className="mx-auto w-full max-w-[1432px] border-b border-border px-6 py-28 md:px-12 md:py-40">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <header className="mb-14 max-w-3xl">
          <span className="font-mono text-[12px] uppercase tracking-[0.16em] text-muted-foreground">Releases</span>
          <h2 className="mt-4 text-[clamp(2.5rem,6vw,5rem)] leading-[1] tracking-[-0.035em]">Built in public.</h2>
          <p className="mt-5 text-[17px] leading-[1.45]">Each version below is deployed in production. The full trajectory is in the changelog.</p>
        </header>
      </div>

      <div className="divide-y divide-ash dark:divide-[#2c2a27] border-y border-ash dark:border-[#2c2a27]">
        {latestReleases.map((release) => (
          <article
            key={release.id}
            className="grid gap-4 py-8 md:grid-cols-[160px_minmax(0,1fr)_auto] md:gap-12"
          >
            <div className="flex gap-3 font-mono text-[13px] text-smoke dark:text-[#7b7773] md:flex-col md:gap-0.5">
              <span className="font-bold text-off-black dark:text-[#f6f3f1]">{release.version}</span>
              <time dateTime={release.date}>{release.formattedDate}</time>
            </div>
            <div className="min-w-0">
              <h3 className="font-serif text-[22px] font-normal tracking-[-0.01em] text-off-black dark:text-[#f6f3f1]">
                {release.title}
              </h3>
            </div>
            <Link
              href={`/changelog#${release.id}`}
              className="btn-link-arrow self-start text-[13px]"
            >
              Release notes
            </Link>
          </article>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Link
          href="/changelog"
          className="btn-pill-ghost !h-11 !px-6"
        >
          Read the changelog
        </Link>
      </div>
    </section>
  );
}

export { FAQSection };
