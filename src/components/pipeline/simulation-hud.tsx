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
    <div className="absolute bottom-6 left-6 right-[260px] max-w-4xl z-20 bg-[#07080a]/95 backdrop-blur-md border border-[#363739] shadow-[rgba(0,0,0,0.8)_0px_16px_40px] rounded-[8px] p-4 flex flex-col gap-3 animate-in slide-in-from-bottom duration-200">
      <div className="flex items-center justify-between border-b border-[#2f3031] pb-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-mono font-bold bg-[#1b1c1e] text-[#ff6363] border border-[#363739] px-2 py-0.5 rounded-[4px]">
            <Activity size={13} className="text-[#ff6363] animate-pulse" />
            TRACE SIMULATOR
          </span>
          <select
            value={activeScenarioId}
            onChange={(e) => onScenarioChange(e.target.value)}
            className="text-xs font-mono bg-[#111214] text-white border border-[#363739] rounded-[4px] px-2 py-1 focus:outline-none focus:border-[#ff6363]"
          >
            {scenarios.map((sc) => (
              <option key={sc.id} value={sc.id}>
                {sc.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs font-mono text-[#9c9c9d]">
            <span>Elapsed:</span>
            <span className="font-bold text-white bg-[#111214] px-2 py-0.5 border border-[#363739] rounded-[4px]">
              {currentStep ? currentStep.elapsedMs : 0}ms
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 hover:bg-[#1b1c1e] text-[#9c9c9d] hover:text-white rounded-[4px] transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <div className="md:col-span-4 bg-[#111214] border border-[#2f3031] rounded-[6px] p-2.5">
          <span className="text-[10px] font-mono text-[#6a6b6c] uppercase block mb-0.5">
            Caller Audio Utterance:
          </span>
          <p className="text-xs italic text-[#e6e6e6] font-sans">
            &ldquo;{scenario.callerUtterance}&rdquo;
          </p>
        </div>

        <div className="md:col-span-8 bg-[#111214] border border-[#363739] rounded-[6px] p-2.5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold bg-[#ff6363] text-white px-1.5 py-0.5 rounded-[3px]">
                STEP {currentStepIndex + 1} / {totalSteps}
              </span>
              <span className="text-xs font-semibold font-sans text-white">
                {currentStep.label}
              </span>
            </div>
            <p className="text-xs text-[#9c9c9d] mb-1 font-sans">
              {currentStep.description}
            </p>
            <div className="text-[11px] font-mono bg-[#040506] border border-[#2f3031] rounded-[4px] px-2 py-0.5 text-[#59d499] truncate max-w-[450px]">
              {currentStep.dataPayload}
            </div>
          </div>

          <Zap size={18} className="text-[#ff6363] mt-1 shrink-0" />
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-[#2f3031]">
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="p-1.5 bg-[#111214] hover:bg-[#1b1c1e] border border-[#363739] text-[#9c9c9d] hover:text-white rounded-[6px] transition-colors"
            title="Reset to Step 1"
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={onStepPrev}
            disabled={currentStepIndex === 0}
            className="p-1.5 bg-[#111214] hover:bg-[#1b1c1e] disabled:opacity-30 border border-[#363739] text-[#9c9c9d] hover:text-white rounded-[6px] transition-colors"
            title="Previous Step"
          >
            <SkipBack size={14} />
          </button>
          <button
            onClick={onTogglePlay}
            className="flex items-center gap-1 px-3 py-1 bg-[#e6e6e6] hover:bg-white text-[#111214] font-mono text-xs font-semibold rounded-[6px] transition-colors"
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
            className="p-1.5 bg-[#111214] hover:bg-[#1b1c1e] disabled:opacity-30 border border-[#363739] text-[#9c9c9d] hover:text-white rounded-[6px] transition-colors"
            title="Next Step"
          >
            <SkipForward size={14} />
          </button>

          <div className="flex items-center ml-2 border border-[#363739] bg-[#111214] rounded-[6px] p-0.5">
            {[0.5, 1, 2].map((spd) => (
              <button
                key={spd}
                onClick={() => onSpeedChange(spd)}
                className={`px-1.5 py-0.5 text-[10px] font-mono rounded-[4px] transition-colors ${
                  playbackSpeed === spd
                    ? "bg-[#1b1c1e] text-white font-bold"
                    : "text-[#9c9c9d] hover:text-white"
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 max-w-xs mx-4 flex items-center gap-1">
          {scenario.steps.map((st, i) => (
            <div
              key={st.step}
              className={`h-2 flex-1 rounded-[2px] transition-all ${
                i <= currentStepIndex
                  ? "bg-[#ff6363]"
                  : "bg-[#1b1c1e] border border-[#2f3031]"
              }`}
            />
          ))}
        </div>

        <div className="text-[11px] font-mono text-[#9c9c9d] flex items-center gap-1">
          <FastForward size={12} />
          <span>Total SLA: ~{scenario.totalExpectedMs}ms</span>
        </div>
      </div>
    </div>
  );
}
