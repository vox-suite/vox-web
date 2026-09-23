export function LoadingState({
  label = "Loading workspace…",
}: {
  label?: string;
}) {
  return (
    <div
      className="flex flex-col items-start gap-4 rounded-2xl p-8 shadow-subtle-3"
      role="status"
    >
      <span
        className="size-6 animate-spin rounded-full border-2 border-border-edge border-t-mist"
        aria-hidden="true"
      />
      <p className="text-ash">{label}</p>
    </div>
  );
}
