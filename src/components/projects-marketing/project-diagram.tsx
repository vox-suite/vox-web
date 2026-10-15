const nodes = [
  { id: "form", name: "Sign-in form", file: "web/login.tsx", x: 0, y: 44 },
  { id: "api", name: "Auth API", file: "server/auth.ts", x: 27, y: 44 },
  { id: "session", name: "Session store", file: "server/session.ts", x: 54, y: 14 },
  { id: "db", name: "User database", file: "db/users.sql", x: 54, y: 74 },
  { id: "mail", name: "Email provider", file: "server/mail.ts", x: 78, y: 44 },
];

const labels = [
  { text: "creates a session", x: 49, y: 38 },
  { text: "looks up the user", x: 49, y: 62 },
  { text: "sends a sign-in link", x: 64, y: 55 },
];

export function ProjectDiagram({ play = false }: { play?: boolean }) {
  return (
    <div className="pj-diagram" data-seen={play || undefined}>
      <svg viewBox="0 0 1000 560" aria-hidden="true">
        <g className="pj-edge" style={{ ["--d" as string]: "0.9s" }}>
          <path d="M220 280 H270" pathLength="1" />
        </g>
        <g className="pj-edge" style={{ ["--d" as string]: "1.4s" }}>
          <path d="M490 280 C515 280 515 110 540 110" pathLength="1" />
        </g>
        <g className="pj-edge" style={{ ["--d" as string]: "1.7s" }}>
          <path d="M490 280 C515 280 515 450 540 450" pathLength="1" />
        </g>
        <g className="pj-edge" style={{ ["--d" as string]: "2s" }}>
          <path d="M490 280 H780" pathLength="1" />
        </g>
      </svg>
      {nodes.map((n, i) => (
        <div
          key={n.id}
          className="pj-node"
          style={{ left: `${n.x}%`, top: `${n.y}%`, ["--d" as string]: `${0.3 + i * 0.35}s` }}
        >
          <strong>{n.name}</strong>
          <code>{n.file}</code>
        </div>
      ))}
      {labels.map((l) => (
        <span key={l.text} className="pj-edge-label" style={{ left: `${l.x}%`, top: `${l.y}%` }}>
          {l.text}
        </span>
      ))}
    </div>
  );
}
