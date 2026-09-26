import { getAccessibleStatusIndicator } from "@/lib/global-formatting";
import { Tag, type TagTone } from "./tag";

const toneForIndicator: Record<
  ReturnType<typeof getAccessibleStatusIndicator>["badgeTone"],
  TagTone
> = {
  positive: "positive",
  warning: "warning",
  error: "danger",
  accent: "info",
  neutral: "neutral",
};

/** Symbol + text + accessible label for an authoritative status (WCAG non-color reliance). */
export function StatusBadge({ status }: { status: string }) {
  const indicator = getAccessibleStatusIndicator(status);
  return (
    <Tag
      tone={toneForIndicator[indicator.badgeTone]}
      label={indicator.ariaLabel}
    >
      {indicator.symbol} {indicator.text}
    </Tag>
  );
}
