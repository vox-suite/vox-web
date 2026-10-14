import { ChevronDown } from "lucide-react";

export function FaqAccordion({
  items,
  name,
}: {
  items: readonly (readonly string[])[];
  name: string;
}) {
  return (
    <div className="h-faq-list">
      {items.map(([question, answer], index) => (
        <details key={question} name={name} open={index === 0}>
          <summary>
            <span>{question}</span>
            <ChevronDown size={18} aria-hidden="true" />
          </summary>
          <p>{answer}</p>
        </details>
      ))}
    </div>
  );
}
