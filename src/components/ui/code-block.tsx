export function CodeBlock({ children }: { children: string }) {
  return (
    <pre
      className="max-h-96 overflow-auto rounded-2xl bg-obsidian p-4 font-mono text-sm text-mist shadow-subtle-3"
      tabIndex={0}
    >
      <code>{children}</code>
    </pre>
  );
}
