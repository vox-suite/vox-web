"use client";

import React from "react";
import {
  X,
  Layers,
  Sparkles,
  MousePointer,
  Zap,
  Clock,
  Compass,
  Code,
  Shield,
} from "lucide-react";

interface DesignSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DesignSystemModal({ isOpen, onClose }: DesignSystemModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-150">
      <div className="bg-white border-2 border-[#111111] shadow-[8px_8px_0px_#111111] w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b border-[#111111] bg-[#fbfbfb] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase font-bold tracking-widest bg-[#4f46e5] text-white px-2 py-0.5">
                VOX SPECIFICATION
              </span>
              <span className="text-xs font-mono text-[#656565]">
                Version 1.4 / Excalidraw Engine
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-[#111111] font-sans">
              Flow Builder Design System
            </h2>
            <p className="text-xs text-[#656565] font-mono mt-0.5">
              The spatial visual language, node primitives, and interaction
              specifications for the Vox pipeline.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-[#eeeeee] border border-transparent hover:border-[#111111] transition-all"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 font-sans">
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Compass size={18} className="text-[#4f46e5]" />
              <h3 className="text-sm font-mono uppercase font-bold tracking-wider text-[#111111]">
                1. Spatial Coordinate System & Canvas Physics
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#f7f7f7] border border-[#d8d8d8] p-4">
                <span className="text-xs font-mono font-bold block mb-1">
                  Infinite Pan & Drag
                </span>
                <p className="text-xs text-[#555555] leading-relaxed">
                  Screen transformation matrix applies `(worldX * zoom + panX,
                  worldY * zoom + panY)`. Panning is triggered via left-click
                  canvas drag, spacebar hold, or trackpad gesture.
                </p>
              </div>

              <div className="bg-[#f7f7f7] border border-[#d8d8d8] p-4">
                <span className="text-xs font-mono font-bold block mb-1">
                  Cursor-Anchored Zoom
                </span>
                <p className="text-xs text-[#555555] leading-relaxed">
                  Mouse wheel zooming maintains focal invariant under pointer:
                  `newPan = pointer - (pointer - oldPan) * (newZoom / oldZoom)`.
                  Clamped between 25% and 250%.
                </p>
              </div>

              <div className="bg-[#f7f7f7] border border-[#d8d8d8] p-4">
                <span className="text-xs font-mono font-bold block mb-1">
                  Excalidraw Dot Grid
                </span>
                <p className="text-xs text-[#555555] leading-relaxed">
                  24px grid pitch with 1.2px radius circular dots at `#d8d8d8`
                  opacity. Shifts dynamically with pan coordinates to provide
                  continuous visual grounding.
                </p>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Layers size={18} className="text-[#7c3aed]" />
              <h3 className="text-sm font-mono uppercase font-bold tracking-wider text-[#111111]">
                2. Subsystem Color Token Registry
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {[
                {
                  name: "Telephony",
                  hex: "#f59e0b",
                  desc: "Twilio SIP / Media WS",
                  border: "border-amber-400",
                },
                {
                  name: "Bridge",
                  hex: "#06b6d4",
                  desc: "Rust Ingress & VAD",
                  border: "border-cyan-400",
                },
                {
                  name: "Jev AI",
                  hex: "#7c3aed",
                  desc: "System One Decisions",
                  border: "border-purple-400",
                },
                {
                  name: "Core Agent",
                  hex: "#10b981",
                  desc: "Python LLM Engine",
                  border: "border-emerald-400",
                },
                {
                  name: "Storage / Redis",
                  hex: "#ec4899",
                  desc: "100ms Caller Cache",
                  border: "border-pink-400",
                },
                {
                  name: "TTS Audio",
                  hex: "#6366f1",
                  desc: "ElevenLabs / Sarvam",
                  border: "border-indigo-400",
                },
              ].map((sub) => (
                <div
                  key={sub.name}
                  className={`bg-white border-2 ${sub.border} p-3 shadow-[2px_2px_0px_#111111]`}
                >
                  <div
                    className="w-full h-3 mb-2 rounded-xs"
                    style={{ backgroundColor: sub.hex }}
                  />
                  <span className="text-xs font-bold font-sans block text-[#111111]">
                    {sub.name}
                  </span>
                  <span className="text-[10px] font-mono text-[#656565] block">
                    {sub.hex}
                  </span>
                  <span className="text-[10px] text-[#555555] mt-1 block leading-tight">
                    {sub.desc}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={18} className="text-[#06b6d4]" />
              <h3 className="text-sm font-mono uppercase font-bold tracking-wider text-[#111111]">
                3. Node Card Anatomy & Interaction States
              </h3>
            </div>
            <div className="bg-[#fbfbfb] border border-[#111111] p-5 shadow-[3px_3px_0px_#111111] flex flex-col md:flex-row gap-6 items-center">
              <div className="w-72 bg-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] p-4 relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 bg-purple-100 text-purple-900 border border-purple-300">
                    JEV AI
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-[#111111] text-white px-2 py-0.5">
                    60 - 90ms
                  </span>
                </div>

                <h4 className="text-sm font-bold text-[#111111]">
                  Dynamic Turn Settling
                </h4>
                <p className="text-xs font-mono text-[#656565] mb-2">
                  Jev System One (Noul)
                </p>
                <p className="text-xs text-[#444444] leading-tight">
                  Evaluates thought completeness: 160ms complete vs 1100ms
                  incomplete.
                </p>

                <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-[#111111] rounded-full" />
                <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#4f46e5] border-2 border-[#111111] rounded-full" />
              </div>

              <div className="flex-1 space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <Clock size={15} className="text-[#4f46e5] mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-[#111111] font-mono">
                      SLA Latency Badge:
                    </strong>{" "}
                    High contrast black badge displaying target runtime budget.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MousePointer
                    size={15}
                    className="text-[#10b981] mt-0.5 shrink-0"
                  />
                  <div>
                    <strong className="text-[#111111] font-mono">
                      Drag & Drop:
                    </strong>{" "}
                    Nodes can be moved freely across the canvas; bezier curves
                    recalculate dynamically.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Zap size={15} className="text-[#7c3aed] mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-[#111111] font-mono">
                      Deep Inspection:
                    </strong>{" "}
                    Clicking opens the Inspector Drawer with exact Rust source
                    lines and wire protocol specs.
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Code size={18} className="text-[#10b981]" />
              <h3 className="text-sm font-mono uppercase font-bold tracking-wider text-[#111111]">
                4. Connector Edge Taxonomy & Data Flow
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
              <div className="bg-[#f7f7f7] border border-[#d8d8d8] p-3">
                <span className="font-bold text-[#111111] block mb-1">
                  Synchronous (Solid)
                </span>
                <div className="h-0.5 w-full bg-[#111111] my-2" />
                <span className="text-[11px] text-[#656565]">
                  Direct blocking data transport on call hotpath.
                </span>
              </div>

              <div className="bg-[#f7f7f7] border border-[#d8d8d8] p-3">
                <span className="font-bold text-[#7c3aed] block mb-1">
                  Speculative (Dashed)
                </span>
                <div className="h-0.5 w-full border-t-2 border-dashed border-[#7c3aed] my-2" />
                <span className="text-[11px] text-[#656565]">
                  Predictive prefetch spawned prior to final speech.
                </span>
              </div>

              <div className="bg-[#f7f7f7] border border-[#d8d8d8] p-3">
                <span className="font-bold text-[#10b981] block mb-1">
                  Async Event (Dot-Dash)
                </span>
                <div className="h-0.5 w-full border-t-2 border-dotted border-[#10b981] my-2" />
                <span className="text-[11px] text-[#656565]">
                  Non-blocking background events & CRM export.
                </span>
              </div>

              <div className="bg-[#f7f7f7] border border-[#d8d8d8] p-3">
                <span className="font-bold text-[#f59e0b] block mb-1">
                  Barge-In (Glowing)
                </span>
                <div className="h-0.5 w-full bg-[#f59e0b] my-2 shadow-[0_0_8px_#f59e0b]" />
                <span className="text-[11px] text-[#656565]">
                  Interruption signal for immediate audio flush.
                </span>
              </div>
            </div>
          </section>

          <section className="bg-[#111111] text-white p-5 shadow-[4px_4px_0px_#4f46e5]">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={18} className="text-emerald-400" />
              <h3 className="text-sm font-mono uppercase font-bold tracking-wider text-white">
                5. Latency Invariants & Empirical Benchmarks
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono pt-2">
              <div>
                <span className="text-[#888888] block text-[10px]">
                  TOTAL TURNAROUND
                </span>
                <span className="text-lg font-bold text-emerald-400">
                  440ms
                </span>
                <p className="text-[10px] text-[#aaaaaa]">
                  Sub-500ms conversational budget achieved.
                </p>
              </div>

              <div>
                <span className="text-[#888888] block text-[10px]">
                  JEV DECISION SLA
                </span>
                <span className="text-lg font-bold text-purple-400">75ms</span>
                <p className="text-[10px] text-[#aaaaaa]">
                  Typed System One multi-primitive API.
                </p>
              </div>

              <div>
                <span className="text-[#888888] block text-[10px]">
                  REDIS LOOKUP
                </span>
                <span className="text-lg font-bold text-pink-400">
                  &lt; 4ms
                </span>
                <p className="text-[10px] text-[#aaaaaa]">
                  Strict 100ms timeout deadline.
                </p>
              </div>

              <div>
                <span className="text-[#888888] block text-[10px]">
                  RAM FILLER TTFB
                </span>
                <span className="text-lg font-bold text-cyan-400">
                  &lt; 1ms
                </span>
                <p className="text-[10px] text-[#aaaaaa]">
                  Pre-warmed in memory at boot.
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="p-4 bg-[#fbfbfb] border-t border-[#111111] flex items-center justify-between">
          <span className="text-xs font-mono text-[#656565]">
            Vox Suite / High-Performance Real-Time Voice Engineering
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#111111] text-white text-xs font-mono font-bold hover:bg-[#333333] transition-colors"
          >
            Close Specification
          </button>
        </div>
      </div>
    </div>
  );
}
