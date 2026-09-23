"use client";

import { PipelineView } from "./pipeline-view";

export function AdminPipelineConsole() {
  return (
    <div className="h-[calc(100vh-56px)] w-full overflow-hidden bg-void-black">
      <PipelineView showHeader className="h-full w-full border-none shadow-none" />
    </div>
  );
}
