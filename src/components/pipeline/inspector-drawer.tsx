"use client";

import React, { useState } from "react";
import type { PipelineNode, PipelineEdge, Subsystem } from "./types";
import {
  X,
  Clock,
  Code2,
  FileText,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Zap,
} from "lucide-react";

interface InspectorDrawerProps {
  node: PipelineNode | null;
  edges: PipelineEdge[];
  nodes: PipelineNode[];
  onClose: () => void;
  onSelectNode: (nodeId: string) => void;
}

export function InspectorDrawer({
  node,
  edges,
  nodes,
  onClose,
  onSelectNode,
}: InspectorDrawerProps) {
  const [copied, setCopied] = useState(false);

  if (!node) return null;

  const handleCopyCode = () => {
    if (node.details.codeSnippet) {
      navigator.clipboard.writeText(node.details.codeSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const upstreamNodes = edges
    .filter((e) => e.to === node.id)
    .map((e) => ({
      edge: e,
      node: nodes.find((n) => n.id === e.from)!,
    }))
    .filter((item) => Boolean(item.node));

  const downstreamNodes = edges
    .filter((e) => e.from === node.id)
    .map((e) => ({
      edge: e,
      node: nodes.find((n) => n.id === e.to)!,
    }))
    .filter((item) => Boolean(item.node));

  const subsystemColorMap: Record<Subsystem, string> = {
    telephony: "bg-obsidian border-border-edge text-[#818cf8]",
    desktop:   "bg-obsidian border-border-edge text-[#38bdf8]",
    bridge:    "bg-obsidian border-border-edge text-[#22d3ee]",
    jev:       "bg-obsidian border-border-edge text-[#c084fc]",
    core:      "bg-obsidian border-border-edge text-success-green",
    storage:   "bg-obsidian border-border-edge text-[#a5b4fc]",
    tts:       "bg-obsidian border-border-edge text-coral-pulse",
    worker:    "bg-obsidian border-border-edge text-[#fbbf24]",
  };

  return (
    <aside className="absolute top-0 right-0 z-30 flex h-full w-[440px] max-w-[90vw] animate-in flex-col overflow-hidden border-l border-border-edge bg-ink shadow-subtle-3 duration-200 slide-in-from-right">
      <div className="flex items-start justify-between border-b border-slate bg-void-black p-5">
        <div className="flex flex-col gap-1.5 pr-4">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 border rounded-[4px] ${
                subsystemColorMap[node.subsystem] || "bg-obsidian border-border-edge text-ash"
              }`}
            >
              {node.subsystem}
            </span>
            <span className="font-mono text-xs text-ash">
              {node.protocol}
            </span>
          </div>
          <h2 className="font-sans text-xl font-semibold tracking-tight text-pure-white">
            {node.title}
          </h2>
          <p className="font-mono text-xs text-ash">{node.subtitle}</p>
        </div>

        <button
          onClick={onClose}
          className="rounded-md border border-transparent p-1.5 text-ash transition-colors hover:border-border-edge hover:bg-graphite hover:text-pure-white"
          aria-label="Close inspector"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6 font-sans">
        <div className="rounded-md border border-border-edge bg-obsidian p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-mono text-xs font-bold text-pure-white">
              <Clock size={14} className="text-coral-pulse" />
              LATENCY SLA BUDGET
            </span>
            <span className="rounded-md border border-border-edge bg-graphite px-2 py-0.5 font-mono text-xs font-bold text-coral-pulse">
              {node.latency}
            </span>
          </div>
          <p className="mb-1 font-mono text-xs text-pure-white">
            {node.details.latencyBudget}
          </p>
          <p className="text-[11px] leading-relaxed text-ash">
            {node.details.empiricalSla}
          </p>
        </div>

        <section>
          <h3 className="mb-2 font-mono text-xs font-bold uppercase tracking-wider text-smoke">
            Architecture Specification
          </h3>
          <p className="text-sm leading-relaxed text-mist">
            {node.details.summary}
          </p>
        </section>

        <section>
          <h3 className="mb-2 font-mono text-xs font-bold uppercase tracking-wider text-smoke">
            Safety &amp; System Invariants
          </h3>
          <ul className="space-y-1.5">
            {node.details.keyInvariants.map((inv, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 rounded-md border border-slate bg-obsidian p-2.5 text-xs text-ash"
              >
                <Zap size={14} className="mt-0.5 shrink-0 text-coral-pulse" />
                <span>{inv}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <div className="flex items-center justify-between mb-2">
            <h3 className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-smoke">
              <Code2 size={14} />
              Implementation Reference
            </h3>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1 font-mono text-[11px] text-coral-pulse hover:underline"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="mb-1.5 inline-block rounded-md border border-slate bg-graphite px-2 py-0.5 font-mono text-[11px] text-ash">
            {node.details.sourceFile}
          </div>
          <pre className="overflow-x-auto rounded-md border border-slate bg-void-black p-3 font-mono text-xs leading-relaxed text-success-green">
            <code>{node.details.codeSnippet}</code>
          </pre>
        </section>

        <section>
          <h3 className="mb-2 flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-smoke">
            <FileText size={14} />
            Data Payload / Wire Protocol
          </h3>
          <pre className="overflow-x-auto rounded-md border border-slate bg-void-black p-3 font-mono text-xs leading-relaxed text-mist">
            <code>{node.details.payloadSample}</code>
          </pre>
        </section>

        <section className="bg-[#1b120c] border border-[#4a2608] rounded-[8px] p-3.5">
          <h3 className="text-xs font-bold text-[#fbbf24] flex items-center gap-1.5 mb-1.5 font-mono">
            <ShieldAlert size={14} />
            FAILURE &amp; FALLBACK STRATEGY
          </h3>
          <p className="text-xs text-[#fde68a] leading-relaxed">
            {node.details.fallbackStrategy}
          </p>
        </section>

        <section className="border-t border-slate pt-2">
          <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-wider text-smoke">
            Pipeline Graph Flow
          </h3>

          <div className="space-y-3">
            {upstreamNodes.length > 0 && (
              <div>
                <span className="mb-1 block font-mono text-[11px] text-smoke">
                  UPSTREAM INPUTS:
                </span>
                <div className="flex flex-col gap-1.5">
                  {upstreamNodes.map(({ edge, node: uNode }) => (
                    <button
                      key={uNode.id}
                      onClick={() => onSelectNode(uNode.id)}
                      className="flex items-center justify-between rounded-md border border-slate bg-obsidian p-2 text-left text-xs transition-all hover:border-border-edge hover:bg-graphite"
                    >
                      <span className="flex items-center gap-1.5 font-medium text-pure-white">
                        <ArrowLeft size={13} className="text-ash" />
                        {uNode.title}
                      </span>
                      <span className="font-mono text-[10px] text-ash">
                        {edge.label || edge.latency}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {downstreamNodes.length > 0 && (
              <div>
                <span className="mb-1 block font-mono text-[11px] text-smoke">
                  DOWNSTREAM OUTPUTS:
                </span>
                <div className="flex flex-col gap-1.5">
                  {downstreamNodes.map(({ edge, node: dNode }) => (
                    <button
                      key={dNode.id}
                      onClick={() => onSelectNode(dNode.id)}
                      className="flex items-center justify-between rounded-md border border-slate bg-obsidian p-2 text-left text-xs transition-all hover:border-border-edge hover:bg-graphite"
                    >
                      <span className="flex items-center gap-1.5 font-medium text-pure-white">
                        {dNode.title}
                        <ArrowRight size={13} className="text-ash" />
                      </span>
                      <span className="font-mono text-[10px] text-ash">
                        {edge.label || edge.latency}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </aside>
  );
}
