import { Check } from "lucide-react";
import { Badge } from "@/components/ui";
import { RequestAccessForm } from "./form";

export function RequestAccessSection() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 pb-16 pt-28 md:px-8 md:pb-24 md:pt-36">
      <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-6">
          <Badge tone="accent">Limited access</Badge>
          <h1 className="text-heading-lg font-normal tracking-[0.22px] text-pure-white">
            Get early access to Vox.
          </h1>
          <p className="max-w-lg text-body-lg text-ash">
            A voice-first assistant reachable by phone call. Vox keeps work
            moving after the conversation ends — tasks, calendar changes,
            follow-ups, and outbound calls when a commitment changes.
          </p>
          <ul className="space-y-3" aria-label="What to expect">
            <li className="flex items-start gap-3 text-sm text-ash">
              <Check
                size={15}
                className="mt-0.5 shrink-0 text-mist"
                aria-hidden="true"
              />
              We review every request personally
            </li>
            <li className="flex items-start gap-3 text-sm text-ash">
              <Check
                size={15}
                className="mt-0.5 shrink-0 text-mist"
                aria-hidden="true"
              />
              Early access users help shape what ships next
            </li>
            <li className="flex items-start gap-3 text-sm text-ash">
              <Check
                size={15}
                className="mt-0.5 shrink-0 text-mist"
                aria-hidden="true"
              />
              Works on your existing phone — no new app required
            </li>
          </ul>
        </div>
        <div className="rounded-2xl border border-border-edge bg-ink p-6 shadow-key-window md:p-8">
          <RequestAccessForm />
        </div>
      </div>
    </div>
  );
}
