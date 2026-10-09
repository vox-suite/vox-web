"use client";

import { useState } from "react";
import {
  PACES,
  countWords,
  formatDuration,
} from "@/lib/speech-time";

export function SpeechTimeCalculator() {
  const [text, setText] = useState("");
  const [paceId, setPaceId] = useState<(typeof PACES)[number]["id"]>("normal");
  const pace = PACES.find((p) => p.id === paceId) ?? PACES[1];
  const words = countWords(text);
  const seconds = (words / pace.wpm) * 60;

  return (
    <section className="tool-card" aria-labelledby="calculator-heading">
      <h2 id="calculator-heading" className="tool-sr">
        Speech time calculator
      </h2>
      <label htmlFor="speech-text">Paste your speech or script</label>
      <textarea
        id="speech-text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        placeholder="Paste your text here to see how long it takes to say out loud…"
      />
      <fieldset>
        <legend>Speaking pace</legend>
        <div className="tool-paces">
          {PACES.map((p) => (
            <label key={p.id} className={p.id === paceId ? "active" : undefined}>
              <input
                type="radio"
                name="pace"
                value={p.id}
                checked={p.id === paceId}
                onChange={() => setPaceId(p.id)}
              />
              <strong>{p.label}</strong>
              <span>{p.wpm} wpm</span>
            </label>
          ))}
        </div>
        <p className="tool-note">{pace.note}</p>
      </fieldset>
      <div className="tool-result" role="status" aria-live="polite">
        <div>
          <span>Speaking time</span>
          <strong>{formatDuration(seconds)}</strong>
        </div>
        <div>
          <span>Words</span>
          <strong>{words.toLocaleString()}</strong>
        </div>
      </div>
    </section>
  );
}
