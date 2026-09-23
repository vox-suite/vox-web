export function ColorSwatches() {
  const tones = [
    "void-black",
    "ink",
    "obsidian",
    "graphite",
    "ash",
    "mist",
    "coral-pulse",
  ] as const;

  const bg: Record<(typeof tones)[number], string> = {
    "void-black": "bg-void-black",
    ink: "bg-ink",
    obsidian: "bg-obsidian",
    graphite: "bg-graphite",
    ash: "bg-ash",
    mist: "bg-mist",
    "coral-pulse": "bg-coral-pulse",
  };

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
      {tones.map((tone) => (
        <div key={tone} className="flex flex-col gap-2">
          <span
            className={`block h-16 rounded-md shadow-subtle-3 ${bg[tone]}`}
          />
          <small className="font-mono text-xs text-smoke">{tone}</small>
        </div>
      ))}
    </div>
  );
}
