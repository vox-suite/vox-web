"use client";

import React from "react";
import type { PipelineNode, PipelineStage } from "./types";

interface MinimapProps {
  stages: PipelineStage[];
  nodes: PipelineNode[];
  pan: { x: number; y: number };
  zoom: number;
  viewportWidth: number;
  viewportHeight: number;
  onPanChange: (pan: { x: number; y: number }) => void;
  selectedNodeId: string | null;
}

export function Minimap({
  stages,
  nodes,
  pan,
  zoom,
  viewportWidth,
  viewportHeight,
  onPanChange,
  selectedNodeId,
}: MinimapProps) {
  const mapWidth = 220;
  const mapHeight = 140;

  const totalWidth = 3500;
  const totalHeight = 1160;

  const scaleX = mapWidth / totalWidth;
  const scaleY = mapHeight / totalHeight;

  const viewRectX = Math.max(0, (-pan.x / zoom) * scaleX);
  const viewRectY = Math.max(0, (-pan.y / zoom) * scaleY);
  const viewRectW = Math.min(mapWidth, (viewportWidth / zoom) * scaleX);
  const viewRectH = Math.min(mapHeight, (viewportHeight / zoom) * scaleY);

  const handleMinimapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const targetCanvasX = clickX / scaleX;
    const targetCanvasY = clickY / scaleY;

    onPanChange({
      x: -(targetCanvasX * zoom) + viewportWidth / 2,
      y: -(targetCanvasY * zoom) + viewportHeight / 2,
    });
  };

  return (
    <div className="absolute bottom-6 right-6 z-20 flex select-none flex-col gap-1.5 rounded-md border border-border-edge bg-ink/95 p-2 shadow-subtle-3 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-slate px-1 pb-1 font-mono text-[11px] font-medium text-ash">
        <span>MINIMAP</span>
        <span className="text-pure-white">{Math.round(zoom * 100)}%</span>
      </div>
      <svg
        width={mapWidth}
        height={mapHeight}
        className="cursor-crosshair rounded-md border border-slate bg-void-black"
        onClick={handleMinimapClick}
      >
        {stages.map((stage) => (
          <rect
            key={stage.id}
            x={stage.bounds.x * scaleX}
            y={stage.bounds.y * scaleY}
            width={stage.bounds.width * scaleX}
            height={stage.bounds.height * scaleY}
            fill={stage.color}
            fillOpacity={0.08}
            stroke={stage.color}
            strokeWidth={0.5}
            strokeDasharray="2 2"
          />
        ))}

        {nodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          return (
            <rect
              key={node.id}
              x={node.x * scaleX}
              y={node.y * scaleY}
              width={node.width * scaleX}
              height={node.height * scaleY}
              fill={isSelected ? "var(--color-coral-pulse)" : "var(--color-border-edge)"}
              fillOpacity={isSelected ? 1 : 0.75}
              rx={1}
            />
          );
        })}

        <rect
          x={viewRectX}
          y={viewRectY}
          width={Math.max(16, viewRectW)}
          height={Math.max(12, viewRectH)}
          fill="var(--color-coral-pulse)"
          fillOpacity={0.12}
          stroke="var(--color-coral-pulse)"
          strokeWidth={1.5}
          strokeDasharray="3 3"
        />
      </svg>
    </div>
  );
}
