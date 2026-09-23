"use client";

import React from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Play,
  Pause,
  Download,
} from "lucide-react";

interface ToolbarProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onFitView: () => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onExportSvg?: () => void;
}

export function Toolbar({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetView,
  onFitView,
  isSimulating,
  onToggleSimulation,
  onExportSvg,
}: ToolbarProps) {
  return (
    <div className="absolute bottom-6 right-6 z-20 flex items-center gap-1.5 pointer-events-auto bg-[#07080a] border border-[#363739] shadow-[rgba(0,0,0,0.6)_0px_8px_24px] rounded-[8px] p-1.5">
      <button
        onClick={onToggleSimulation}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold transition-all rounded-[6px] border ${
          isSimulating
            ? "bg-[#ff6363] text-white border-[#ff6363]"
            : "bg-[#111214] hover:bg-[#1b1c1e] text-[#e6e6e6] hover:text-white border-[#363739] hover:border-[#6a6b6c]"
        }`}
        title={isSimulating ? "Pause Simulation" : "Simulate Flow Trace"}
      >
        {isSimulating ? (
          <Pause size={13} />
        ) : (
          <Play size={13} fill="currentColor" />
        )}
        <span>{isSimulating ? "PAUSE" : "SIMULATE"}</span>
      </button>

      <div className="h-4 w-[1px] bg-[#2f3031] mx-0.5" />

      <div className="flex items-center border border-[#363739] rounded-[6px] px-1 py-0.5 bg-[#111214]">
        <button
          onClick={onZoomOut}
          className="p-1 text-[#9c9c9d] hover:text-white hover:bg-[#1b1c1e] rounded-[4px] transition-colors"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <ZoomOut size={14} />
        </button>
        <span className="text-[11px] font-mono font-medium text-white w-11 text-center select-none">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={onZoomIn}
          className="p-1 text-[#9c9c9d] hover:text-white hover:bg-[#1b1c1e] rounded-[4px] transition-colors"
          title="Zoom In"
          aria-label="Zoom In"
        >
          <ZoomIn size={14} />
        </button>
      </div>

      <button
        onClick={onFitView}
        className="p-1.5 text-[#9c9c9d] hover:text-white hover:bg-[#111214] border border-transparent hover:border-[#363739] rounded-[6px] transition-colors"
        title="Fit View"
        aria-label="Fit View"
      >
        <Maximize2 size={15} />
      </button>

      <button
        onClick={onResetView}
        className="p-1.5 text-[#9c9c9d] hover:text-white hover:bg-[#111214] border border-transparent hover:border-[#363739] rounded-[6px] transition-colors"
        title="Reset View"
        aria-label="Reset View"
      >
        <RotateCcw size={15} />
      </button>

      {onExportSvg && (
        <>
          <div className="h-4 w-[1px] bg-[#2f3031] mx-0.5" />
          <button
            onClick={onExportSvg}
            className="p-1.5 text-[#9c9c9d] hover:text-white hover:bg-[#111214] border border-transparent hover:border-[#363739] rounded-[6px] transition-colors"
            title="Export SVG"
            aria-label="Export SVG"
          >
            <Download size={15} />
          </button>
        </>
      )}
    </div>
  );
}
