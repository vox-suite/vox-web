import { Check } from "lucide-react";

export function ChatScene() {
  return (
    <div className="h-chat h-chat-compact">
      <div className="h-chat-bar">
        <span className="h-chat-dot" aria-hidden="true" />
        <strong>Vox</strong>
        <small>Message</small>
      </div>
      <ol>
        <li data-me="true">
          <p>
            How much did I spend last week?
            <Check size={12} aria-hidden="true" />
          </p>
        </li>
        <li data-me="false">
          <p>$595, 12% less than the week before.</p>
        </li>
      </ol>
    </div>
  );
}
