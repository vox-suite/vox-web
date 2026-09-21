import { Check } from "lucide-react";
import { Badge } from "@/components/ui";
import { RequestAccessForm } from "./form";

export function RequestAccessSection() {
  return (
    <div className="request-access-section">
      <div className="request-access-grid">
        <div className="request-access-copy">
          <Badge tone="accent">Limited access</Badge>
          <h1>Get early access to Vox.</h1>
          <p>
            A voice-first assistant reachable by phone call. Vox keeps work
            moving after the conversation ends — tasks, calendar changes,
            follow-ups, and outbound calls when a commitment changes.
          </p>
          <ul className="request-access-list" aria-label="What to expect">
            <li>
              <Check size={15} aria-hidden="true" />
              We review every request personally
            </li>
            <li>
              <Check size={15} aria-hidden="true" />
              Early access users help shape what ships next
            </li>
            <li>
              <Check size={15} aria-hidden="true" />
              Works on your existing phone — no new app required
            </li>
          </ul>
        </div>
        <div className="request-access-card">
          <RequestAccessForm />
        </div>
      </div>
    </div>
  );
}
