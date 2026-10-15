import Image from "next/image";
import { ArrowRight, FileText, Folder, Search } from "lucide-react";
import { ProjectDiagram } from "./project-diagram";
import { SourceExplorer } from "./source-explorer";

const tree = [
  "checkout-app/", "  web/", "    login.tsx", "    cart.tsx", "    checkout.tsx",
  "  server/", "    auth.ts", "    session.ts", "    orders.ts", "    mail.ts",
  "  db/", "    users.sql", "    orders.sql", "  docs/", "    prd-v3.md", "    decisions-2024.md",
];

export function MazePanel() {
  return (
    <pre className="pj-tree" aria-hidden="true">
      {tree.map((line, i) => (
        <span key={i} style={{ opacity: Math.max(0.12, 1 - i * 0.055) }}>
          {line}
          {"\n"}
        </span>
      ))}
    </pre>
  );
}

export function SourcesPanel() {
  return (
    <div className="pj-sources" aria-label="Illustrative Sources tab">
      <Image className="pj-sources-art" src="/illustrations/dithered-folder-transparent.png" alt="" width={1254} height={1254} sizes="220px" aria-hidden="true" />
      <p className="pj-label">Sources</p>
      <div>
        <Folder size={18} aria-hidden="true" />
        <div>
          <strong>checkout-app</strong>
          <span>412 files · 9 areas found</span>
        </div>
        <em>Indexed</em>
      </div>
      <div>
        <FileText size={18} aria-hidden="true" />
        <div>
          <strong>prd-v3.md</strong>
          <span>1 file</span>
        </div>
        <em>Indexed</em>
      </div>
      <p className="pj-fine">Skipped: node_modules, .env, private keys</p>
    </div>
  );
}

export function AskPanel({ play }: { play: boolean }) {
  return (
    <div className="pj-ask">
      <div className="pj-composer">
        <Search size={16} aria-hidden="true" />
        <span>How does sign-in work?</span>
        <small>Explained from 14 files</small>
      </div>
      <ProjectDiagram play={play} />
      <p className="pj-canvas-note">Illustrative example. Vox draws a different diagram for every question.</p>
    </div>
  );
}

export function ProofPanel() {
  return (
    <div className="pj-proof-panel" aria-label="Illustrative citation">
      <SourceExplorer />
      <div className="pj-gap">
        <strong>Not in your files</strong>
        <span>How password-reset emails are worded.</span>
      </div>
    </div>
  );
}

export function ContextPanel() {
  return (
    <ul className="pj-context" aria-label="Illustrative project context">
      <li>
        <strong>Sign-in uses email links, not passwords.</strong>
        <span>server/auth.ts · Up to date</span>
      </li>
      <li data-review="true">
        <strong>Sessions last seven days.</strong>
        <span>server/session.ts changed · Needs review</span>
        <div>
          <b>Keep</b>
          <b>Update</b>
        </div>
      </li>
      <li>
        <strong>Payments run through Stripe.</strong>
        <span>Written by you · 3 versions</span>
      </li>
    </ul>
  );
}

export function LoopPanel() {
  return (
    <div className="pj-loop-panel">
      <ol className="pj-cycle" aria-label="Project and Plan loop">
        <li>
          <strong>Project context</strong>
          <span>What Vox knows is true</span>
        </li>
        <ArrowRight size={20} aria-hidden="true" />
        <li>
          <strong>Plan</strong>
          <span>One goal, starts informed</span>
        </li>
        <ArrowRight size={20} aria-hidden="true" />
        <li>
          <strong>What it learned</strong>
          <span>You accept it in one click</span>
        </li>
      </ol>
      <p className="pj-return" aria-hidden="true">And back into the project</p>
    </div>
  );
}
