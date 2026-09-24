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
    telephony: "text-electric-sky",
    desktop: "text-info-blue",
    bridge: "text-mist",
    jev: "text-coral-pulse",
    core: "text-success-green",
    storage: "text-ash",
    tts: "text-coral-pulse",
    worker: "text-electric-sky",
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
            id="arrow-info"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 8 5 L 0 9 z" fill="var(--color-info-blue)" />
          </marker>

          <marker
            id="arrow-sky"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 8 5 L 0 9 z" fill="var(--color-electric-sky)" />
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
                className="fill-pure-white font-sans text-[14px] font-medium"
              >
                {stage.title}
              </text>
              <text
                x={stage.bounds.x + 18}
                y={stage.bounds.y + 60}
                className="fill-ash font-mono text-[10px]"
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
              strokeColor = "var(--color-info-blue)";
              strokeDasharray = "5 3";
              markerEnd = "url(#arrow-info)";
            } else if (edge.type === "barge") {
              strokeColor = "#ff6363";
              strokeDasharray = "4 4";
              markerEnd = "url(#arrow-red)";
            } else if (edge.type === "async") {
              strokeColor = "var(--color-electric-sky)";
              strokeDasharray = "6 3";
              markerEnd = "url(#arrow-sky)";
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
                      className="fill-mist font-mono text-[10px] font-medium"
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
                className={`relative flex h-full w-full flex-col justify-between overflow-hidden rounded-md border bg-ink p-3 transition-all duration-150 ${
                  isSelected
                    ? "border-coral-pulse shadow-subtle-3 ring-2 ring-coral-pulse/40"
                    : "border-border-edge hover:border-smoke hover:shadow-subtle-3"
                } ${
                  isTraceActive
                    ? "animate-pulse ring-2 ring-coral-pulse ring-offset-2"
                    : ""
                }`}
                style={{
                  boxShadow:
                    "rgba(255, 255, 255, 0.05) 0px 1px 0px 0px inset, rgba(255, 255, 255, 0.15) 0px 0px 0px 1px, rgba(0, 0, 0, 0.4) 0px -1px 0px 0px inset",
                }}
              >
                <div className="mb-1.5 flex shrink-0 items-center justify-between">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span
                      className={`shrink-0 rounded-md border border-border-edge bg-obsidian px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${subsystemChipColor[node.subsystem] || "text-pure-white"}`}
                    >
                      {node.subsystem}
                    </span>
                    <span className="truncate font-mono text-[10px] text-ash">
                      {node.protocol}
                    </span>
                  </div>

                  <span className="ml-1 shrink-0 rounded-md border border-border-edge bg-graphite px-1.5 py-0.5 font-mono text-[10px] font-bold text-coral-pulse">
                    {node.latency}
                  </span>
                </div>

                <div className="mb-1.5 flex shrink-0 items-start gap-2">
                  <div className="shrink-0 rounded-md border border-border-edge bg-obsidian p-1.5 text-pure-white">
                    <IconComponent size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate font-sans text-xs font-semibold leading-tight text-pure-white">
                      {node.title}
                    </h4>
                    <p className="truncate font-mono text-[10px] text-ash">
                      {node.subtitle}
                    </p>
                  </div>
                </div>

                <p className="line-clamp-3 text-[11px] leading-[1.35] text-ash">
                  {node.description}
                </p>

                {node.details.codeReference && (
                  <div className="mt-auto flex shrink-0 items-center justify-between border-t border-slate pt-2 font-mono text-[10px] text-ash">
                    <span className="max-w-[175px] truncate">
                      {node.details.sourceFile}
                    </span>
                    <span className="ml-1 shrink-0 font-medium text-coral-pulse">
                      Inspect →
                    </span>
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
