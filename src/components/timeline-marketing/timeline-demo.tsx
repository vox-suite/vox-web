import { ReplicaSvg } from "@/components/home/replica-svg";

export function TimelineDemo() {
  return (
    <figure className="tl-desktop-preview" id="example">
      <div
        className="tl-desktop-preview-scroll"
        role="region"
        aria-label="Desktop Timeline preview. Scroll horizontally on smaller screens."
        tabIndex={0}
        data-theme="dark"
      >
        <ReplicaSvg
          name="timeline-day"
          box={[0, 0, 1920, 1080]}
          label="Vox desktop Timeline showing the day view, category filters and events. Illustrative data."
        />
      </div>
      <figcaption>Vox desktop Timeline · Illustrative data.<span> Scroll to explore the full view on smaller screens.</span></figcaption>
    </figure>
  );
}
