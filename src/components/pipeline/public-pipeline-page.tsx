"use client";

import React from "react";
import { PipelineView } from "./pipeline-view";
import { Clock, Zap } from "lucide-react";

export function PublicPipelinePage() {
  return (
    <div className="w-full bg-void-black font-sans text-ash">
      <section className="border-b border-border-edge bg-ink">
        <div className="mx-auto max-w-[1240px] px-6 pb-10 pt-28 md:pb-16 md:pt-36">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-md border border-slate bg-graphite px-2 py-0.5 font-mono text-xs font-semibold uppercase tracking-wider text-pure-white">
                  FULL-STACK ARCHITECTURE SPEC
                </span>
                <span className="rounded-md border border-slate bg-obsidian px-2 py-0.5 font-mono text-xs font-medium text-success-green">
                  Sub-500ms End-to-End
                </span>
              </div>
              <h1 className="text-3xl font-normal tracking-tight text-pure-white md:text-5xl">
                System Pipeline &amp; Architecture
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ash md:text-base">
                The complete end-to-end architecture: Vox Desktop client,
                bidirectional Twilio media streams, streaming STT, sub-100ms
                TypeSafe Jev System One arbitration, Vox Core agent runtime, and
                durable background workers.
              </p>
            </div>

            <div className="flex items-center gap-4 rounded-md border border-border-edge bg-obsidian p-3 font-mono text-xs shadow-subtle-3">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-coral-pulse" />
                <div>
                  <span className="block text-[10px] uppercase text-smoke">
                    SLA BUDGET
                  </span>
                  <strong className="text-pure-white">&lt; 500ms</strong>
                </div>
              </div>
              <div className="h-6 w-px bg-slate" />
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-electric-sky" />
                <div>
                  <span className="block text-[10px] uppercase text-smoke">
                    JEV SYSTEM ONE
                  </span>
                  <strong className="text-pure-white">75ms Median</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="w-full">
        <PipelineView />
      </div>

      <section className="mx-auto max-w-[1240px] border-t border-border-edge px-6 py-12">
        <div className="mb-8">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-smoke">
            Engineering Deep-Dive
          </span>
          <h2 className="mt-1 text-2xl font-normal tracking-tight text-pure-white">
            Key Architecture Pillars
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-border-edge bg-ink p-6 shadow-subtle-3 transition-all hover:border-smoke">
            <h3 className="mb-1 text-lg font-medium text-pure-white">
              Desktop &amp; Ingress Channels
            </h3>
            <p className="mb-4 text-xs text-ash">
              Native cross-platform desktop application and low-jitter PSTN
              telephony streams.
            </p>
            <div className="space-y-2.5 text-xs text-ash">
              <p>
                <strong className="text-pure-white">
                  Vox Desktop (Tauri v2):
                </strong>{" "}
                CPAL native microphone capture, 20ms audio frame chunking, and
                deep-linked PKCE OAuth via vox://auth/callback.
              </p>
              <p>
                <strong className="text-pure-white">
                  Twilio Media Streams:
                </strong>{" "}
                8000Hz G.711 μ-law bidirectional WebSocket streaming with
                cryptographic HMAC signature verification.
              </p>
              <p>
                <strong className="text-pure-white">
                  Streaming STT &amp; Biometrics:
                </strong>{" "}
                AssemblyAI / Deepgram streaming STT with WeSpeaker ResNet-34
                neural voiceprint extraction.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border-edge bg-ink p-6 shadow-subtle-3 transition-all hover:border-smoke">
            <h3 className="mb-1 text-lg font-medium text-pure-white">
              Jev System One Intelligence
            </h3>
            <p className="mb-4 text-xs text-ash">
              Fast, structured multi-primitive decisions that replace fragile
              generative LLM prompts.
            </p>
            <div className="space-y-2.5 text-xs text-ash">
              <p>
                <strong className="text-pure-white">
                  Dynamic Turn Settling:
                </strong>{" "}
                Noul question measures thought completeness. Complete clauses
                settle in 160ms instead of waiting for long silence timers.
              </p>
              <p>
                <strong className="text-pure-white">Smart Barge-In:</strong>{" "}
                Distinguishes passive listener backchannels (
                <em>&ldquo;uh-huh&rdquo;</em>, <em>&ldquo;yeah&rdquo;</em>) from
                authentic interruptions.
              </p>
              <p>
                <strong className="text-pure-white">
                  Prewarmed Filler Engine:
                </strong>{" "}
                Streams pre-synthesized RAM audio in &lt;1ms if database tools
                take &gt;400ms.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border-edge bg-ink p-6 shadow-subtle-3 transition-all hover:border-smoke">
            <h3 className="mb-1 text-lg font-medium text-pure-white">
              Vox Core Engine &amp; Workers
            </h3>
            <p className="mb-4 text-xs text-ash">
              Dual-process architecture: authenticated API token streaming and
              durable asynchronous workers.
            </p>
            <div className="space-y-2.5 text-xs text-ash">
              <p>
                <strong className="text-pure-white">vox-core-api:</strong>{" "}
                Handles Bridge host assertions, session states, context
                assembly, and Rig SSE token streaming.
              </p>
              <p>
                <strong className="text-pure-white">vox-core-worker:</strong>{" "}
                Leases durable jobs from PostgreSQL via row-level locks on a 30s
                interval to advance schedules and execute actions.
              </p>
              <p>
                <strong className="text-pure-white">
                  Minimal Redis Cache:
                </strong>{" "}
                100ms strict caller resolution deadline backed by durable
                PostgreSQL persistence and AOF logs.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
