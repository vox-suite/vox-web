const blocks = Array.from({ length: 112 }, (_, i) => {
  const col = i % 14;
  const row = Math.floor(i / 14);
  return {
    x: col * 68 + (row % 2) * 8,
    y: row * 70,
    w: 26 + ((i * 13) % 25),
    d: 24 + ((i * 7) % 24),
    h: 12 + ((i * 23) % 66),
  };
});

export function CityScene({ compact = false }: { compact?: boolean }) {
  return (
    <svg
      className={`city-scene${compact ? " city-compact" : ""}`}
      viewBox="0 0 1200 760"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={compact ? "city-light-small" : "city-light"}>
          <stop stopColor="var(--vox-sky)" stopOpacity=".14" />
          <stop offset="1" stopColor="var(--vox-background)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse
        cx="660"
        cy="420"
        rx="580"
        ry="350"
        fill={`url(#${compact ? "city-light-small" : "city-light"})`}
      />
      <g transform="translate(170 110) matrix(.9 .35 -.65 .44 270 -60)">
        {Array.from({ length: 15 }, (_, i) => (
          <path
            key={`v${i}`}
            d={`M${i * 68 - 10} -60v690`}
            className="city-road"
          />
        ))}
        {Array.from({ length: 10 }, (_, i) => (
          <path
            key={`h${i}`}
            d={`M-50 ${i * 70 - 12}h1070`}
            className="city-road"
          />
        ))}
        <path d="M194 478V268H466V128H738" className="city-route-shadow" />
        <path d="M194 478V268H466V128H738" className="city-route" />
        <circle cx="194" cy="478" r="7" fill="var(--vox-coral)" />
        <circle cx="738" cy="128" r="7" fill="var(--vox-coral)" />
        <circle cx="466" cy="268" r="21" className="city-location" />
        <circle cx="466" cy="268" r="6" fill="var(--vox-text)" />
      </g>
      {blocks.map(({ x, y, w, d, h }, i) => {
        const pt = (a: number, b: number, z = 0) =>
          `${440 + 0.9 * a - 0.65 * b},${50 + 0.35 * a + 0.44 * b - z}`;
        return (
          <g key={i} className="city-building">
            <polygon
              points={`${pt(x, y, h)} ${pt(x + w, y, h)} ${pt(x + w, y + d, h)} ${pt(x, y + d, h)}`}
              fill="var(--vox-surface-accent)"
            />
            <polygon
              points={`${pt(x, y + d, h)} ${pt(x + w, y + d, h)} ${pt(x + w, y + d)} ${pt(x, y + d)}`}
              fill="var(--vox-surface-raised)"
            />
            <polygon
              points={`${pt(x + w, y, h)} ${pt(x + w, y + d, h)} ${pt(x + w, y + d)} ${pt(x + w, y)}`}
              fill="var(--vox-surface)"
            />
            {[0.33, 0.66].map((level) => (
              <path
                key={level}
                d={`M${pt(x, y + d, h * level)} L${pt(x + w, y + d, h * level)} L${pt(x + w, y, h * level)}`}
                opacity=".45"
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
}
