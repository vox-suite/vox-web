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
    <Card>
      <p className="text-[13px] font-medium text-smoke">{label}</p>
      <p className="mt-2 font-[family-name:var(--font-inter)] text-heading-sm font-medium text-pure-white">
        {value}
      </p>
      <Text muted small>
        {description}
      </Text>
    </Card>
  );
}
