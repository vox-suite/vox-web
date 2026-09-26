import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ListChecks, PhoneCall, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/ui";
import { PageNoise } from "@/components/marketing/blueprint-frame";

/** Provable statements taken from the product's own capabilities, not marketing claims. */
const PROMISES = [
  {
    icon: PhoneCall,
    title: "Call, and it's handled",
    body: "Tasks, calendar changes and reminders start from a conversation.",
  },
  {
    icon: ListChecks,
    title: "Work outlasts the call",
    body: "Follow-ups stay tracked and Vox reaches back out when something needs you.",
  },
  {
    icon: ShieldCheck,
    title: "You stay in control",
    body: "Consequential actions are confirmed first and leave a durable record.",
  },
] as const;

export function SignInShell({
  children,
  brandHref,
  notice,
}: {
  children: ReactNode;
  brandHref: string;
  notice?: ReactNode;
}) {
  return (
    <main
      id="main"
      className="relative grid min-h-screen bg-void-black lg:h-screen lg:grid-cols-[minmax(420px,5fr)_7fr] lg:grid-rows-[minmax(0,1fr)]"
    >
      <PageNoise />

      <section className="relative flex min-h-screen flex-col px-6 py-6 sm:px-10 lg:min-h-0 lg:overflow-y-auto lg:px-14">
        <header className="flex items-center justify-between">
          <Brand href={brandHref} animated size={26} />
          <Link
            href={brandHref}
            className="rounded text-[13px] text-smoke transition-colors hover:text-pure-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mist"
          >
            Back to site
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center py-12">
          <div className="rise w-full max-w-[400px]">
            <div className="mb-8 flex flex-col gap-3">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border-edge bg-white/[0.02] px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-ash">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-coral-pulse"
                />
                Your Vox account
              </span>
              <h1 className="font-display text-[34px] font-semibold leading-[1.08] tracking-[-0.03em] text-balance text-pure-white sm:text-[40px]">
                Pick up where you left off.
              </h1>
              <p className="text-[15px] leading-6 text-ash">
                Sign in with Google or a single-use email code. Your connected
                services and approvals remain under your control.
              </p>
            </div>
            {notice ? <div className="mb-6">{notice}</div> : null}
            {children}
          </div>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 font-mono text-[11px] text-smoke">
          <span>Vox account · Private by default</span>
          <span className="flex items-center gap-4">
            <Link
              href="https://voxagent.in/privacy"
              className="transition-colors hover:text-pure-white"
            >
              Privacy
            </Link>
            <Link
              href="https://voxagent.in/request-access"
              className="transition-colors hover:text-pure-white"
            >
              Request access
            </Link>
          </span>
        </footer>
      </section>

      <aside
        aria-label="About Vox"
        className="relative hidden overflow-hidden border-l border-[#232427] lg:flex lg:flex-col lg:justify-between lg:px-14 lg:py-16 xl:px-20"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_60%_0%,rgba(255,99,99,0.16),transparent_70%)]"
        />
        <div
          aria-hidden="true"
          className="bp-dot-grid pointer-events-none absolute inset-0"
        />
        <div
          aria-hidden="true"
          className="bp-hatch pointer-events-none absolute inset-y-0 right-0 w-10 opacity-70"
        />

        <div className="relative max-w-[520px]">
          <span className="inline-flex items-center gap-2 rounded-full border border-border-edge bg-black/30 py-1 pl-1 pr-3 font-mono text-[11px] uppercase tracking-[0.12em] text-ash">
            <span className="rounded bg-mist px-1.5 py-0.5 text-iron">Vox</span>
            The assistant you can call
          </span>
          <p className="mt-6 font-display text-[52px] font-semibold leading-[1.02] tracking-[-0.035em] text-pure-white xl:text-[60px]">
            Calls end.
            <br />
            <span className="text-smoke">Work keeps moving.</span>
          </p>

          <ul className="mt-12 flex flex-col gap-6">
            {PROMISES.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex items-start gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border-edge bg-white/[0.03] text-mist">
                  <Icon className="size-[18px]" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[15px] font-medium text-pure-white">
                    {title}
                  </p>
                  <p className="mt-0.5 max-w-[42ch] text-[14px] leading-6 text-ash">
                    {body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none relative -mx-14 mt-12 min-h-0 flex-1 [mask-image:linear-gradient(to_bottom,transparent,black_30%,black_70%,transparent)] xl:-mx-20"
        >
          <Image
            src="/artwork/signal-ring.svg"
            alt=""
            fill
            className="object-cover opacity-80"
            sizes="(min-width: 1024px) 60vw, 0px"
          />
        </div>
      </aside>
    </main>
  );
}
