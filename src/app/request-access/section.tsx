import { Check } from "lucide-react";
import { RequestAccessForm } from "./form";

export function RequestAccessSection() {
  return (
    <div className="mx-auto max-w-[1432px] px-6 pb-20 pt-28 md:px-12 md:pb-32 md:pt-36 bg-parchment dark:bg-[#141312] transition-colors">
      <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-ash dark:border-[#2c2a27] bg-white/50 dark:bg-white/5 px-3.5 py-1 font-mono text-[11px] uppercase tracking-wider text-lake-blue dark:text-[#7ba2ff]">
            LIMITED ACCESS // PROTOCOL 01
          </span>
          <h1 className="font-serif text-[clamp(2.5rem,5vw,3.75rem)] font-normal leading-[1.1] tracking-[-1.6px] text-off-black dark:text-[#f6f3f1]">
            Get early access to Vox.
          </h1>
          <p className="max-w-lg font-mono text-[16px] leading-[1.35] tracking-[-0.4px] text-graphite dark:text-[#aba7a2]">
            A voice-first assistant reachable by telephone and WhatsApp. Vox keeps work
            moving after the conversation ends — tasks, calendar changes,
            follow-ups, and outbound calls when a commitment changes.
          </p>
          <ul className="space-y-4 pt-2 font-mono text-[14px] text-graphite dark:text-[#aba7a2]" aria-label="What to expect">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-lake-blue/10 text-lake-blue dark:text-[#7ba2ff]">
                <Check size={13} aria-hidden="true" />
              </span>
              We review every request personally
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-lake-blue/10 text-lake-blue dark:text-[#7ba2ff]">
                <Check size={13} aria-hidden="true" />
              </span>
              Early access partners directly shape system releases
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-lake-blue/10 text-lake-blue dark:text-[#7ba2ff]">
                <Check size={13} aria-hidden="true" />
              </span>
              Works on your phone — no separate application download required
            </li>
          </ul>
        </div>
        <div className="feature-card">
          <RequestAccessForm />
        </div>
      </div>
    </div>
  );
}
