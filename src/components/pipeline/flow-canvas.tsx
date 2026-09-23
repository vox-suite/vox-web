"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import type {
  PipelineStage,
  PipelineNode,
  PipelineEdge,
  TraceStep,
  Subsystem,
} from "./types";
import {
  Radio,
  Network,
  Mic,
  Zap,
  Database,
  Sparkles,
  Clock,
  Shield,
  GitFork,
  Search,
  Volume2,
  FileText,
  Bot,
  Activity,
  Sliders,
  CheckCircle2,
  HelpCircle,
  Monitor,
  Cpu,
  Layers,
  HardDrive,
} from "lucide-react";

interface FlowCanvasProps {
  stages: PipelineStage[];
  nodes: PipelineNode[];
  edges: PipelineEdge[];
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  hoveredNodeId: string | null;
  onHoverNode: (id: string | null) => void;
  pan: { x: number; y: number };
  zoom: number;
  onPanChange: (pan: { x: number; y: number }) => void;
  onZoomChange: (zoom: number) => void;
  activeTraceStep: TraceStep | null;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Radio,
  Network,
  Mic,
  Zap,
  Database,
  Sparkles,
  Clock,
  Shield,
  GitFork,
  Search,
  Volume2,
  FileText,
  Bot,
  Activity,
  Sliders,
  CheckCircle2,
  Monitor,
  Cpu,
  Layers,
  HardDrive,
};

export function FlowCanvas({
  stages,
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  hoveredNodeId,
  onHoverNode,
  pan,
  zoom,
  onPanChange,
  onZoomChange,
  activeTraceStep,
}: FlowCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      if ((e.target as HTMLElement).closest(".pipeline-node")) return;
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    },
    [pan],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning) return;
      onPanChange({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    },
    [isPanning, panStart, onPanChange],
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        const zoomFactor = -e.deltaY * 0.002;
        const newZoom = Math.min(Math.max(0.2, zoom + zoomFactor), 2.5);

        const rect = el.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const newPanX = mouseX - ((mouseX - pan.x) / zoom) * newZoom;
        const newPanY = mouseY - ((mouseY - pan.y) / zoom) * newZoom;

        onZoomChange(newZoom);
        onPanChange({ x: newPanX, y: newPanY });
      } else {
        onPanChange({
          x: pan.x - e.deltaX,
          y: pan.y - e.deltaY,
        });
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [pan, zoom, onPanChange, onZoomChange]);

  const getNodeCenter = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node)
      return {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      };
    return {
      x: node.x + node.width / 2,
      y: node.y + node.height / 2,
      width: node.width,
      height: node.height,
      left: node.x,
      right: node.x + node.width,
      top: node.y,
      bottom: node.y + node.height,
    };
  };

  const getEdgePath = (edge: PipelineEdge) => {
    const fromNode = getNodeCenter(edge.from);
    const toNode = getNodeCenter(edge.to);

    let x1 = fromNode.right;
    let y1 = fromNode.y;
    let x2 = toNode.left;
    let y2 = toNode.y;

    if (edge.route === "loop-back") {
      x1 = fromNode.x;
      y1 = fromNode.bottom;
      x2 = toNode.x;
      y2 = toNode.bottom;

      const loopBottom = 1120;
      const path = `M ${x1} ${y1} C ${x1} ${loopBottom}, ${x2} ${loopBottom}, ${x2} ${y2}`;
      return {
        path,
        midX: (x1 + x2) / 2,
        midY: loopBottom,
        x1,
        y1,
        x2,
        y2,
      };
    }

    if (edge.route === "top-highway") {
      x1 = fromNode.x;
      y1 = fromNode.top;
      x2 = toNode.x;
      y2 = toNode.top;

      const topHighwayY = 30;
      const path = `M ${x1} ${y1} C ${x1} ${topHighwayY}, ${x2} ${topHighwayY}, ${x2} ${y2}`;
      return {
        path,
        midX: (x1 + x2) / 2,
        midY: topHighwayY,
        x1,
        y1,
        x2,
        y2,
      };
    }

    if (edge.route === "bottom-highway") {
      x1 = fromNode.x;
      y1 = fromNode.bottom;
      x2 = toNode.x;
      y2 = toNode.bottom;

      const bottomHighwayY = 1060;
      const path = `M ${x1} ${y1} C ${x1} ${bottomHighwayY}, ${x2} ${bottomHighwayY}, ${x2} ${y2}`;
      return {
        path,
        midX: (x1 + x2) / 2,
        midY: bottomHighwayY,
        x1,
        y1,
        x2,
        y2,
      };
    }

    if (edge.route === "corridor-middle") {
      x1 = fromNode.right;
      y1 = fromNode.y;
      x2 = toNode.left;
      y2 = toNode.y;

      const corridorY = 380;
      const path = `M ${x1} ${y1} C ${(x1 + x2) / 2} ${corridorY}, ${(x1 + x2) / 2} ${corridorY}, ${x2} ${y2}`;
      return {
        path,
        midX: (x1 + x2) / 2,
        midY: corridorY,
        x1,
        y1,
        x2,
        y2,
      };
    }

    if (Math.abs(fromNode.x - toNode.x) < 40) {
      if (fromNode.y < toNode.y) {
        x1 = fromNode.x;
        y1 = fromNode.bottom;
        x2 = toNode.x;
        y2 = toNode.top;
      } else {
        x1 = fromNode.x;
        y1 = fromNode.top;
        x2 = toNode.x;
        y2 = toNode.bottom;
      }
      const path = `M ${x1} ${y1} C ${x1} ${(y1 + y2) / 2}, ${x2} ${(y1 + y2) / 2}, ${x2} ${y2}`;
      return {
        path,
        midX: (x1 + x2) / 2,
        midY: (y1 + y2) / 2,
        x1,
        y1,
        x2,
        y2,
      };
    }

    const dx = Math.abs(x2 - x1) * 0.5;
    const path = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

    const offsetX = edge.labelOffset?.x || 0;
    const offsetY = edge.labelOffset?.y || 0;
    const midX = (x1 + x2) / 2 + offsetX;
    const midY = (y1 + y2) / 2 + offsetY;

    return { path, midX, midY, x1, y1, x2, y2 };
  };

  const subsystemChipColor: Record<Subsystem, string> = {
    telephony: "text-[#818cf8]",
    desktop:   "text-[#38bdf8]",
    bridge:    "text-[#22d3ee]",
    jev:       "text-[#c084fc]",
    core:      "text-[#59d499]",
    storage:   "text-[#a5b4fc]",
    tts:       "text-[#ff6363]",
    worker:    "text-[#fbbf24]",
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={`relative w-full h-full overflow-hidden select-none cursor-${
        isPanning ? "grabbing" : "grab"
      }`}
      style={{
        backgroundColor: "#040506",
        touchAction: "none",
        overscrollBehavior: "contain",
      }}
    >
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <pattern
            id="pattern-dots"
            x={pan.x % (24 * zoom)}
            y={pan.y % (24 * zoom)}
            width={24 * zoom}
            height={24 * zoom}
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx={1.5 * zoom}
              cy={1.5 * zoom}
              r={1.1 * zoom}
              fill="rgba(255, 255, 255, 0.08)"
            />
          </pattern>

          <marker
            id="arrow-solid"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#6a6b6c" />
          </marker>

          <marker
            id="arrow-purple"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#c084fc" />
          </marker>

          <marker
            id="arrow-cyan"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#38bdf8" />
          </marker>

          <marker
            id="arrow-red"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#ff6363" />
          </marker>

          <marker
            id="arrow-green"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#ff6363" />
          </marker>

          <marker
            id="arrow-blue"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#60a5fa" />
          </marker>
        </defs>

        <rect width="100%" height="100%" fill="url(#pattern-dots)" />
      </svg>

      <div
        className="absolute top-0 left-0 origin-top-left pointer-events-none"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          width: "3500px",
          height: "1200px",
        }}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
          {stages.map((stage) => (
            <g key={stage.id}>
              <rect
                x={stage.bounds.x}
                y={stage.bounds.y}
                width={stage.bounds.width}
                height={stage.bounds.height}
                fill={stage.color}
                fillOpacity={0.04}
                stroke={stage.color}
                strokeWidth={1.2}
                strokeDasharray="6 4"
                rx={8}
              />
              <text
                x={stage.bounds.x + 18}
                y={stage.bounds.y + 26}
                className="text-[11px] font-mono uppercase font-bold tracking-wider"
                fill={stage.color}
              >
                {stage.badge}
              </text>
              <text
                x={stage.bounds.x + 18}
                y={stage.bounds.y + 44}
                className="text-[14px] font-sans font-medium fill-[#ffffff]"
              >
                {stage.title}
              </text>
              <text
                x={stage.bounds.x + 18}
                y={stage.bounds.y + 60}
                className="text-[10px] font-mono fill-[#9c9c9d]"
              >
                {stage.subtitle}
              </text>
            </g>
          ))}

          {edges.map((edge) => {
            const { path, midX, midY } = getEdgePath(edge);
            const isTraceActive =
              activeTraceStep && activeTraceStep.edgeId === edge.id;
            const isRelated =
              selectedNodeId === edge.from ||
              selectedNodeId === edge.to ||
              hoveredNodeId === edge.from ||
              hoveredNodeId === edge.to;

            let strokeColor = "#363739";
            let strokeWidth = 1.5;
            let strokeDasharray = "none";
            let markerEnd = "url(#arrow-solid)";

            if (edge.type === "speculative") {
              strokeColor = "#c084fc";
              strokeDasharray = "5 3";
              markerEnd = "url(#arrow-purple)";
            } else if (edge.type === "barge") {
              strokeColor = "#ff6363";
              strokeDasharray = "4 4";
              markerEnd = "url(#arrow-red)";
            } else if (edge.type === "async") {
              strokeColor = "#38bdf8";
              strokeDasharray = "6 3";
              markerEnd = "url(#arrow-cyan)";
            }

            if (isTraceActive) {
              strokeColor = "#ff6363";
              strokeWidth = 3;
              markerEnd = "url(#arrow-green)";
            } else if (isRelated) {
              strokeWidth = 2.5;
              if (edge.type === "sync") strokeColor = "#ffffff";
            }

            return (
              <g key={edge.id} className="transition-all duration-200">
                <path
                  d={path}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  markerEnd={markerEnd}
                  opacity={isRelated || isTraceActive ? 1.0 : 0.65}
                />

                {isTraceActive && (
                  <path
                    d={path}
                    fill="none"
                    stroke="#ff6363"
                    strokeWidth={4}
                    strokeDasharray="8 12"
                    className="animate-pulse"
                  />
                )}

                {edge.label && (
                  <g
                    transform={`translate(${midX}, ${midY})`}
                    className="pointer-events-none"
                  >
                    <rect
                      x={-(edge.label.length * 3.3 + 12)}
                      y={-10}
                      width={edge.label.length * 6.6 + 24}
                      height={20}
                      fill="#07080a"
                      stroke={isRelated ? "#ff6363" : "#363739"}
                      strokeWidth={1}
                      rx={4}
                    />
                    <text
                      x={0}
                      y={4}
                      textAnchor="middle"
                      className="text-[10px] font-mono font-medium fill-[#e6e6e6]"
                    >
                      {edge.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {nodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          const isHovered = hoveredNodeId === node.id;
          const isTraceActive = activeTraceStep?.nodeId === node.id;
          const IconComponent = ICON_MAP[node.icon] || Zap;

          return (
            <div
              key={node.id}
              id={`node-${node.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onSelectNode(node.id);
              }}
              onMouseEnter={() => onHoverNode(node.id)}
              onMouseLeave={() => onHoverNode(null)}
              className="pipeline-node absolute pointer-events-auto cursor-pointer select-none transition-all duration-150"
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
                width: `${node.width}px`,
                height: `${node.height}px`,
              }}
            >
              <div
                className={`relative w-full h-full bg-[#07080a] p-3 flex flex-col justify-between border transition-all duration-150 rounded-[8px] overflow-hidden ${
                  isSelected
                    ? "border-[#ff6363] ring-2 ring-[#ff6363]/40 shadow-[0_0_24px_rgba(255,99,99,0.25)]"
                    : "border-[#363739] hover:border-[#6a6b6c] hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
                } ${
                  isTraceActive
                    ? "animate-pulse ring-2 ring-offset-2 ring-[#ff6363]"
                    : ""
                }`}
                style={{
                  boxShadow:
                    "rgba(255, 255, 255, 0.05) 0px 1px 0px 0px inset, rgba(255, 255, 255, 0.15) 0px 0px 0px 1px, rgba(0, 0, 0, 0.4) 0px -1px 0px 0px inset",
                }}
              >
                {/* Header row: subsystem tag, protocol, latency */}
                <div className="flex items-center justify-between shrink-0 mb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={`text-[9px] font-mono uppercase font-bold tracking-wider px-1.5 py-0.5 border border-[#363739] bg-[#111214] rounded-[4px] shrink-0 ${subsystemChipColor[node.subsystem] || "text-white"}`}
                    >
                      {node.subsystem}
                    </span>
                    <span className="text-[10px] font-mono text-[#9c9c9d] truncate">
                      {node.protocol}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono font-bold bg-[#1b1c1e] text-[#ff6363] border border-[#363739] px-1.5 py-0.5 rounded-[4px] shrink-0 ml-1">
                    {node.latency}
                  </span>
                </div>

                {/* Title and Icon row */}
                <div className="flex items-start gap-2 shrink-0 mb-1.5">
                  <div className="p-1.5 border border-[#363739] bg-[#111214] rounded-[6px] text-white shrink-0">
                    <IconComponent size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-semibold font-sans text-white leading-tight truncate">
                      {node.title}
                    </h4>
                    <p className="text-[10px] font-mono text-[#9c9c9d] truncate">
                      {node.subtitle}
                    </p>
                  </div>
                </div>

                {/* Description: full 2-3 lines rendered without truncation or cut-off */}
                <p className="text-[11px] text-[#9c9c9d] leading-[1.35] line-clamp-3">
                  {node.description}
                </p>

                {/* Footer inspect link: anchored at bottom with clear margin */}
                {node.details.codeReference && (
                  <div className="mt-auto pt-2 border-t border-[#2f3031] flex items-center justify-between text-[10px] font-mono text-[#9c9c9d] shrink-0">
                    <span className="truncate max-w-[175px]">
                      {node.details.sourceFile}
                    </span>
                    <span className="text-[#ff6363] font-medium shrink-0 ml-1">Inspect →</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
