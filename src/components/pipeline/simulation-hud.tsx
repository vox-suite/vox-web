"use client";

import React from "react";
import type { TraceScenario } from "./types";
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  X,
  Activity,
  Zap,
  FastForward,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SimulationHudProps {
  isPlaying: boolean;
  scenarios: TraceScenario[];
  activeScenarioId: string;
  onScenarioChange: (scenarioId: string) => void;
  currentStepIndex: number;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
  onTogglePlay: () => void;
  onStepNext: () => void;
  onStepPrev: () => void;
  onReset: () => void;
  onClose: () => void;
}

export function SimulationHud({
  isPlaying,
  scenarios,
  activeScenarioId,
  onScenarioChange,
  currentStepIndex,
  playbackSpeed,
  onSpeedChange,
  onTogglePlay,
  onStepNext,
  onStepPrev,
  onReset,
  onClose,
}: SimulationHudProps) {
  const scenario =
    scenarios.find((s) => s.id === activeScenarioId) || scenarios[0];
  const totalSteps = scenario.steps.length;
  const currentStep = scenario.steps[currentStepIndex] || scenario.steps[0];

  return (
    <div className="absolute bottom-6 left-6 right-[260px] z-20 flex max-w-4xl animate-in flex-col gap-3 rounded-md border border-border-edge bg-ink/95 p-4 shadow-subtle-3 backdrop-blur-md duration-200 slide-in-from-bottom">
      <div className="flex items-center justify-between border-b border-slate pb-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-md border border-border-edge bg-graphite px-2 py-0.5 font-mono text-xs font-bold text-coral-pulse">
            <Activity size={13} className="animate-pulse text-coral-pulse" />
            TRACE SIMULATOR
          </span>
          <select
            value={activeScenarioId}
            onChange={(e) => onScenarioChange(e.target.value)}
            className="rounded-md border border-border-edge bg-obsidian px-2 py-1 font-mono text-xs text-pure-white focus:border-coral-pulse focus:outline-none"
          >
            {scenarios.map((sc) => (
              <option key={sc.id} value={sc.id}>
                {sc.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 font-mono text-xs text-ash">
            <span>Elapsed:</span>
            <span className="rounded-md border border-border-edge bg-obsidian px-2 py-0.5 font-bold text-pure-white">
              {currentStep ? currentStep.elapsedMs : 0}ms
            </span>
          </div>

          <button
            onClick={onClose}
            className="rounded-md p-1 text-ash transition-colors hover:bg-graphite hover:text-pure-white"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-center gap-3 md:grid-cols-12">
        <div className="rounded-md border border-slate bg-obsidian p-2.5 md:col-span-4">
          <span className="mb-0.5 block font-mono text-[10px] uppercase text-smoke">
            Caller Audio Utterance:
          </span>
          <p className="font-sans text-xs italic text-mist">
            &ldquo;{scenario.callerUtterance}&rdquo;
          </p>
        </div>

        <div className="flex items-start justify-between rounded-md border border-border-edge bg-obsidian p-2.5 md:col-span-8">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-md bg-coral-pulse px-1.5 py-0.5 font-mono text-[10px] font-bold text-pure-white">
                STEP {currentStepIndex + 1} / {totalSteps}
              </span>
              <span className="font-sans text-xs font-semibold text-pure-white">
                {currentStep.label}
              </span>
            </div>
            <p className="mb-1 font-sans text-xs text-ash">
              {currentStep.description}
            </p>
            <div className="max-w-[450px] truncate rounded-md border border-slate bg-void-black px-2 py-0.5 font-mono text-[11px] text-success-green">
              {currentStep.dataPayload}
            </div>
          </div>

          <Zap size={18} className="mt-1 shrink-0 text-coral-pulse" />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="rounded-md border border-border-edge bg-obsidian p-1.5 text-ash transition-colors hover:bg-graphite hover:text-pure-white"
            title="Reset to Step 1"
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={onStepPrev}
            disabled={currentStepIndex === 0}
            className="rounded-md border border-border-edge bg-obsidian p-1.5 text-ash transition-colors hover:bg-graphite hover:text-pure-white disabled:opacity-30"
            title="Previous Step"
          >
            <SkipBack size={14} />
          </button>
          <button
            onClick={onTogglePlay}
            className="flex items-center gap-1 rounded-md bg-mist px-3 py-1 font-mono text-xs font-semibold text-obsidian transition-colors hover:bg-pure-white"
          >
            {isPlaying ? (
              <Pause size={13} />
            ) : (
              <Play size={13} fill="currentColor" />
            )}
            <span>{isPlaying ? "PAUSE" : "PLAY"}</span>
          </button>
          <button
            onClick={onStepNext}
            disabled={currentStepIndex >= totalSteps - 1}
            className="rounded-md border border-border-edge bg-obsidian p-1.5 text-ash transition-colors hover:bg-graphite hover:text-pure-white disabled:opacity-30"
            title="Next Step"
          >
            <SkipForward size={14} />
          </button>

          <div className="ml-2 flex items-center rounded-md border border-border-edge bg-obsidian p-0.5">
            {[0.5, 1, 2].map((spd) => (
              <button
                key={spd}
                onClick={() => onSpeedChange(spd)}
                className={cn(
                  "rounded-md px-1.5 py-0.5 font-mono text-[10px] transition-colors",
                  playbackSpeed === spd
                    ? "bg-graphite font-bold text-pure-white"
                    : "text-ash hover:text-pure-white",
                )}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        <div className="mx-4 flex max-w-xs flex-1 items-center gap-1">
          {scenario.steps.map((st, i) => (
            <div
              key={st.step}
              className={cn(
                "h-2 flex-1 rounded-sm transition-all",
                i <= currentStepIndex
                  ? "bg-coral-pulse"
                  : "border border-slate bg-graphite",
              )}
            />
          ))}
        </div>

        <div className="flex items-center gap-1 font-mono text-[11px] text-ash">
          <FastForward size={12} />
          <span>Total SLA: ~{scenario.totalExpectedMs}ms</span>
        </div>
      </div>
    </div>
  );
}
