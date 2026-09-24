"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  PIPELINE_STAGES,
  PIPELINE_NODES,
  PIPELINE_EDGES,
  TRACE_SCENARIOS,
} from "./data";
import { FlowCanvas } from "./flow-canvas";
import { Toolbar } from "./toolbar";
import { InspectorDrawer } from "./inspector-drawer";
import { SimulationHud } from "./simulation-hud";

interface PipelineViewProps {
  initialFullscreen?: boolean;
  showHeader?: boolean;
  className?: string;
}

export function PipelineView({
  initialFullscreen = false,
  showHeader = false,
  className,
}: PipelineViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [stages] = useState(PIPELINE_STAGES);
  const [nodes] = useState(PIPELINE_NODES);
  const [edges] = useState(PIPELINE_EDGES);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const [pan, setPan] = useState({ x: 30, y: 30 });
  const [zoom, setZoom] = useState(0.68);

  const [isSimulating, setIsSimulating] = useState(false);
  const [activeScenarioId, setActiveScenarioId] = useState(
    TRACE_SCENARIOS[0].id,
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const handleZoomIn = useCallback(
    () => setZoom((z) => Math.min(2.5, z + 0.12)),
    [],
  );
  const handleZoomOut = useCallback(
    () => setZoom((z) => Math.max(0.25, z - 0.12)),
    [],
  );

  const handleFitView = useCallback(() => {
    if (!containerRef.current || nodes.length === 0) return;
    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;

    const totalCanvasWidth = 3480;
    const totalCanvasHeight = 1160;

    const scaleX = (w - 60) / totalCanvasWidth;
    const scaleY = (h - 60) / totalCanvasHeight;
    const fitZoom = Math.max(0.25, Math.min(1.0, Math.min(scaleX, scaleY)));

    setZoom(fitZoom);
    setPan({
      x: Math.max(16, (w - totalCanvasWidth * fitZoom) / 2),
      y: Math.max(16, (h - totalCanvasHeight * fitZoom) / 2),
    });
  }, [nodes]);

  const handleResetView = useCallback(() => {
    handleFitView();
  }, [handleFitView]);

  useEffect(() => {
    handleFitView();
    const timer = setTimeout(() => {
      handleFitView();
    }, 60);
    return () => clearTimeout(timer);
  }, [handleFitView]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedNodeId(null);
      } else if ((e.metaKey || e.ctrlKey) && e.key === "=") {
        e.preventDefault();
        handleZoomIn();
      } else if ((e.metaKey || e.ctrlKey) && e.key === "-") {
        e.preventDefault();
        handleZoomOut();
      } else if ((e.metaKey || e.ctrlKey) && e.key === "0") {
        e.preventDefault();
        handleResetView();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleZoomIn, handleZoomOut, handleResetView]);

  const activeScenario =
    TRACE_SCENARIOS.find((s) => s.id === activeScenarioId) ||
    TRACE_SCENARIOS[0];
  const activeTraceStep = isSimulating
    ? activeScenario.steps[currentStepIndex] || null
    : null;

  useEffect(() => {
    if (!isSimulating) return;

    const currentStep = activeScenario.steps[currentStepIndex];
    const nextStep = activeScenario.steps[currentStepIndex + 1];

    const delayMs = nextStep
      ? Math.max(
          300,
          (nextStep.elapsedMs - currentStep.elapsedMs) / playbackSpeed,
        )
      : 1500 / playbackSpeed;

    const timer = setTimeout(() => {
      if (currentStepIndex < activeScenario.steps.length - 1) {
        setCurrentStepIndex((idx) => idx + 1);
      } else {
        setCurrentStepIndex(0);
      }
    }, delayMs);

    return () => clearTimeout(timer);
  }, [isSimulating, currentStepIndex, activeScenario, playbackSpeed]);

  const handleExportSvg = () => {
    const svgEl = containerRef.current?.querySelector("svg");
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgEl);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "vox-pipeline-architecture.svg";
    link.click();
    URL.revokeObjectURL(url);
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden bg-void-black ${
        className
          ? className
          : `h-[860px] min-h-[650px] w-full border border-slate ${
              initialFullscreen ? "h-screen border-none" : ""
            }`
      }`}
    >
      {showHeader && (
        <div className="absolute z-10 pointer-events-none select-none max-w-xl p-5">
          <h1 className="font-sans text-xl font-medium tracking-tight text-pure-white">
            Vox System &amp; Pipeline Architecture
          </h1>
          <p className="mt-1 font-sans text-xs leading-relaxed text-ash">
            Interactive architecture and execution flow diagram connecting Vox
            Desktop, Telephony, Bridge, Jev System One, Core Engine, and
            Background Workers.
          </p>
        </div>
      )}

      <FlowCanvas
        stages={stages}
        nodes={nodes}
        edges={edges}
        selectedNodeId={selectedNodeId}
        onSelectNode={setSelectedNodeId}
        hoveredNodeId={hoveredNodeId}
        onHoverNode={setHoveredNodeId}
        pan={pan}
        zoom={zoom}
        onPanChange={setPan}
        onZoomChange={setZoom}
        activeTraceStep={activeTraceStep}
      />

      <Toolbar
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitView={handleFitView}
        onResetView={handleResetView}
        onExportSvg={handleExportSvg}
        isSimulating={isSimulating}
        onToggleSimulation={() => {
          setIsSimulating((prev) => !prev);
          setCurrentStepIndex(0);
        }}
      />

      {isSimulating && (
        <SimulationHud
          isPlaying={isSimulating}
          scenarios={TRACE_SCENARIOS}
          activeScenarioId={activeScenarioId}
          onScenarioChange={(id: string) => {
            setActiveScenarioId(id);
            setCurrentStepIndex(0);
          }}
          currentStepIndex={currentStepIndex}
          playbackSpeed={playbackSpeed}
          onSpeedChange={setPlaybackSpeed}
          onTogglePlay={() => setIsSimulating((prev) => !prev)}
          onStepNext={() =>
            setCurrentStepIndex((idx) =>
              Math.min(activeScenario.steps.length - 1, idx + 1),
            )
          }
          onStepPrev={() => setCurrentStepIndex((idx) => Math.max(0, idx - 1))}
          onReset={() => {
            setCurrentStepIndex(0);
          }}
          onClose={() => setIsSimulating(false)}
        />
      )}

      <InspectorDrawer
        node={selectedNode}
        edges={edges}
        nodes={nodes}
        onClose={() => setSelectedNodeId(null)}
        onSelectNode={setSelectedNodeId}
      />
    </div>
  );
}
