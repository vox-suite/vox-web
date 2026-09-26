import {
  Callout,
  ExternalLinkButton,
  ItemCard,
  MetaList,
  Panel,
  StatusBadge,
  Tag,
} from "@/components/app";
import type { MultiServiceJourneyItem } from "@/lib/consumer-auth/core-host-client";
import { SAMPLE_COMPOSITE_JOURNEY } from "../samples";

const SERVICE_LEVEL: Record<MultiServiceJourneyItem["service_type"], string> = {
  consequential_write: "L3 Consequential Write",
  connected_read: "L2 Connected Read",
  labelled_handoff: "L0 Labelled Handoff",
};

const PROVIDER_NAME: Record<MultiServiceJourneyItem["provider"], string> = {
  uber: "Uber",
  zomato: "Zomato",
  expedia: "Expedia",
  amazon: "Amazon",
};

export function CompositeJourney() {
  return (
    <Panel
      title="Multi-service travel journey: Seattle Summit"
      description="Partial multi-service outcomes remain individually understandable. A successful booking never masks pending, handoff, or failed partner services."
    >
      <Callout title="Authority invariant">
        <p>
          Payment authorization and handoff transitions are visibly distinct
          from completion. Each provider item maintains independent
          authoritative evidence.
        </p>
      </Callout>
      <div className="grid gap-3 2xl:grid-cols-3">
        {SAMPLE_COMPOSITE_JOURNEY.map((item) => (
          <ItemCard
            key={item.service}
            title={item.service}
            subtitle={item.summary}
            badges={<StatusBadge status={item.status} />}
            footer={
              <>
                {item.completed ? (
                  <Tag tone="positive" label="Completion status: Completed">
                    ✓ Completed
                  </Tag>
                ) : (
                  <Tag
                    tone="warning"
                    label="Completion status: Pending external handoff"
                  >
                    ⏳ Pending external / handoff
                  </Tag>
                )}
                {item.handoff_url ? (
                  <ExternalLinkButton
                    href={item.handoff_url}
                    aria-label={`Continue journey in ${PROVIDER_NAME[item.provider]}`}
                  >
                    Continue in {PROVIDER_NAME[item.provider]}
                  </ExternalLinkButton>
                ) : null}
              </>
            }
          >
            <MetaList
              items={[
                { label: "Level", value: SERVICE_LEVEL[item.service_type] },
                { label: "Provider", value: PROVIDER_NAME[item.provider] },
                item.authoritative_reference
                  ? { label: "Reference", value: item.authoritative_reference }
                  : null,
                {
                  label: "Payment",
                  value: item.payment_status?.replace(/_/g, " ") ?? "—",
                },
              ]}
            />
          </ItemCard>
        ))}
      </div>
    </Panel>
  );
}
