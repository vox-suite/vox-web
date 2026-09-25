import { Card } from "./content-card";
import { Text } from "./text";

export function Stat({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <Card tone="subtle" size="sm">
      <p className="text-[12px] font-medium uppercase tracking-wider text-smoke">
        {label}
      </p>
      <p className="mt-1.5 font-[family-name:var(--font-inter)] text-heading-sm font-semibold tracking-tight text-pure-white">
        {value}
      </p>
      <Text muted small>
        {description}
      </Text>
    </Card>
  );
}
