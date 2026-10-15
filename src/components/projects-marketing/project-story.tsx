import type { ReactNode } from "react";
import { AskPanel, ContextPanel, LoopPanel, MazePanel, ProofPanel, SourcesPanel } from "./story-panels";

type Step = { label: string; title: ReactNode; text: ReactNode[] };

const steps: Step[] = [
  {
    label: "The maze",
    title: (<>Every project<br />turns into a <em>maze.</em></>),
    text: ["Files nobody opens. Decisions nobody remembers. A new teammate, an old codebase, and three weeks to catch up."],
  },
  {
    label: "Point",
    title: (<>Point Vox <em>at it.</em></>),
    text: [
      "Choose a folder, or a few files. Vox reads them on your computer. Your files never leave it. Only the short pieces a question needs go to the model.",
      <>Dependency folders and likely secrets, like <code>.env</code> files and keys, are skipped.</>,
    ],
  },
  {
    label: "Ask",
    title: (<>Ask anything.<br /><em>Get a picture.</em></>),
    text: ["Ask how something works. Vox follows your files until it understands, then draws the answer as a diagram built from what is actually there."],
  },
  {
    label: "Proof",
    title: (<>Click any box.<br /><em>See the line.</em></>),
    text: [
      "Every statement in a diagram points to the file and lines it came from. Open it and read the source yourself.",
      "If the answer is not in your material, Vox marks it as a gap instead of filling it in.",
    ],
  },
  {
    label: "Context",
    title: (<>It remembers <em>what is true.</em></>),
    text: [
      "Vox keeps short context statements about your project. When a file they rely on changes, Vox flags them for review.",
      "What you write always wins, and every earlier version is kept.",
    ],
  },
  {
    label: "Plans",
    title: (<>Then it plans from <em>what it knows.</em></>),
    text: ["A Plan has one goal, then it ends. A Project keeps going. Each new Plan starts with your project’s context, and can add what it learned back."],
  },
];

function Panel({ index, play }: { index: number; play: boolean }) {
  return [<MazePanel key="m" />, <SourcesPanel key="s" />, <AskPanel key="a" play={play} />, <ProofPanel key="p" />, <ContextPanel key="c" />, <LoopPanel key="l" />][index];
}

export function ProjectStory() {
  return (
    <section className="pj-story h-wrap" aria-label="How Projects works">
      {steps.map((s, i) => (
        <article key={s.label} className="pj-row" data-flip={i % 2 === 1 || undefined}>
          <div className="pj-row-copy">
            <h2>{s.title}</h2>
            {s.text.map((t, j) => (
              <p key={j}>{t}</p>
            ))}
          </div>
          <div className="pj-row-panel">
            <Panel index={i} play />
          </div>
        </article>
      ))}
    </section>
  );
}
