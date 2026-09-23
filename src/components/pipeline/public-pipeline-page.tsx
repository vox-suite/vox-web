"use client";

import React from "react";
import { PipelineView } from "./pipeline-view";
import { Clock, Zap } from "lucide-react";

export function PublicPipelinePage() {
  return (
    <div className="w-full bg-[#040506] text-[#9c9c9d] font-sans">
      <section className="border-b border-[#232427] bg-[#07080a]">
        <div className="max-w-[1240px] mx-auto px-6 py-10 md:py-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono uppercase font-semibold tracking-wider text-[#ffffff] bg-[#1b1c1e] border border-[#2f3031] px-2 py-0.5 rounded-[6px]">
                  FULL-STACK ARCHITECTURE SPEC
                </span>
                <span className="text-xs font-mono font-medium px-2 py-0.5 bg-[#111214] text-[#59d499] border border-[#2f3031] rounded-[6px]">
                  Sub-500ms End-to-End
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-normal tracking-tight text-[#ffffff]">
                System Pipeline &amp; Architecture
              </h1>
              <p className="text-sm md:text-base text-[#9c9c9d] mt-2 max-w-2xl leading-relaxed">
                The complete end-to-end architecture: Vox Desktop client, bidirectional
                Twilio media streams, streaming STT, sub-100ms TypeSafe Jev System One
                arbitration, Vox Core agent runtime, and durable background workers.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-[#111214] border border-[#363739] rounded-[8px] shadow-[rgba(255,255,255,0.05)_0px_1px_0px_0px_inset,rgba(0,0,0,0.4)_0px_4px_12px_0px] p-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-[#ff6363]" />
                <div>
                  <span className="text-[10px] text-[#6a6b6c] block uppercase">
                    SLA BUDGET
                  </span>
                  <strong className="text-[#ffffff]">&lt; 500ms</strong>
                </div>
              </div>
              <div className="h-6 w-[1px] bg-[#2f3031]" />
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-[#63a1ff]" />
                <div>
                  <span className="text-[10px] text-[#6a6b6c] block uppercase">
                    JEV SYSTEM ONE
                  </span>
                  <strong className="text-[#ffffff]">75ms Median</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="w-full">
        <PipelineView />
      </div>

      <section className="max-w-[1240px] mx-auto px-6 py-12 border-t border-[#232427]">
        <div className="mb-8">
          <span className="text-xs font-mono uppercase tracking-wider text-[#6a6b6c] font-semibold">
            Engineering Deep-Dive
          </span>
          <h2 className="text-2xl font-normal tracking-tight text-[#ffffff] mt-1">
            Key Architecture Pillars
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#07080a] border border-[#363739] rounded-[16px] p-6 shadow-[rgba(255,255,255,0.05)_0px_1px_0px_0px_inset,rgba(255,255,255,0.1)_0px_0px_0px_1px,rgba(0,0,0,0.2)_0px_-1px_0px_0px_inset] hover:border-[#6a6b6c] transition-all">
            <h3 className="text-lg font-medium text-[#ffffff] mb-1">
              Desktop &amp; Ingress Channels
            </h3>
            <p className="text-xs text-[#9c9c9d] mb-4">
              Native cross-platform desktop application and low-jitter PSTN telephony streams.
            </p>
            <div className="text-xs text-[#9c9c9d] space-y-2.5">
              <p>
                <strong className="text-[#ffffff]">
                  Vox Desktop (Tauri v2):
                </strong>{" "}
                CPAL native microphone capture, 20ms audio frame chunking, and deep-linked PKCE OAuth via vox://auth/callback.
              </p>
              <p>
                <strong className="text-[#ffffff]">Twilio Media Streams:</strong>{" "}
                8000Hz G.711 μ-law bidirectional WebSocket streaming with cryptographic HMAC signature verification.
              </p>
              <p>
                <strong className="text-[#ffffff]">Streaming STT &amp; Biometrics:</strong>{" "}
                AssemblyAI / Deepgram streaming STT with WeSpeaker ResNet-34 neural voiceprint extraction.
              </p>
            </div>
          </div>

          <div className="bg-[#07080a] border border-[#363739] rounded-[16px] p-6 shadow-[rgba(255,255,255,0.05)_0px_1px_0px_0px_inset,rgba(255,255,255,0.1)_0px_0px_0px_1px,rgba(0,0,0,0.2)_0px_-1px_0px_0px_inset] hover:border-[#6a6b6c] transition-all">
            <h3 className="text-lg font-medium text-[#ffffff] mb-1">
              Jev System One Intelligence
            </h3>
            <p className="text-xs text-[#9c9c9d] mb-4">
              Fast, structured multi-primitive decisions that replace fragile generative LLM prompts.
            </p>
            <div className="text-xs text-[#9c9c9d] space-y-2.5">
              <p>
                <strong className="text-[#ffffff]">
                  Dynamic Turn Settling:
                </strong>{" "}
                Noul question measures thought completeness. Complete clauses settle in 160ms instead of waiting for long silence timers.
              </p>
              <p>
                <strong className="text-[#ffffff]">Smart Barge-In:</strong>{" "}
                Distinguishes passive listener backchannels (<em>&ldquo;uh-huh&rdquo;</em>, <em>&ldquo;yeah&rdquo;</em>) from authentic interruptions.
              </p>
              <p>
                <strong className="text-[#ffffff]">Prewarmed Filler Engine:</strong>{" "}
                Streams pre-synthesized RAM audio in &lt;1ms if database tools take &gt;400ms.
              </p>
            </div>
          </div>

          <div className="bg-[#07080a] border border-[#363739] rounded-[16px] p-6 shadow-[rgba(255,255,255,0.05)_0px_1px_0px_0px_inset,rgba(255,255,255,0.1)_0px_0px_0px_1px,rgba(0,0,0,0.2)_0px_-1px_0px_0px_inset] hover:border-[#6a6b6c] transition-all">
            <h3 className="text-lg font-medium text-[#ffffff] mb-1">
              Vox Core Engine &amp; Workers
            </h3>
            <p className="text-xs text-[#9c9c9d] mb-4">
              Dual-process architecture: authenticated API token streaming and durable asynchronous workers.
            </p>
            <div className="text-xs text-[#9c9c9d] space-y-2.5">
              <p>
                <strong className="text-[#ffffff]">
                  vox-core-api:
                </strong>{" "}
                Handles Bridge host assertions, session states, context assembly, and Rig SSE token streaming.
              </p>
              <p>
                <strong className="text-[#ffffff]">
                  vox-core-worker:
                </strong>{" "}
                Leases durable jobs from PostgreSQL via row-level locks on a 30s interval to advance schedules and execute actions.
              </p>
              <p>
                <strong className="text-[#ffffff]">
                  Minimal Redis Cache:
                </strong>{" "}
                100ms strict caller resolution deadline backed by durable PostgreSQL persistence and AOF logs.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
