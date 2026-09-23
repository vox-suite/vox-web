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
    telephony: "bg-[#111214] border-[#363739] text-[#818cf8]",
    desktop:   "bg-[#111214] border-[#363739] text-[#38bdf8]",
    bridge:    "bg-[#111214] border-[#363739] text-[#22d3ee]",
    jev:       "bg-[#111214] border-[#363739] text-[#c084fc]",
    core:      "bg-[#111214] border-[#363739] text-[#59d499]",
    storage:   "bg-[#111214] border-[#363739] text-[#a5b4fc]",
    tts:       "bg-[#111214] border-[#363739] text-[#ff6363]",
    worker:    "bg-[#111214] border-[#363739] text-[#fbbf24]",
  };

  return (
    <aside className="absolute top-0 right-0 h-full w-[440px] max-w-[90vw] z-30 bg-[#07080a] border-l border-[#363739] shadow-[-8px_0_32px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
      <div className="p-5 border-b border-[#2f3031] bg-[#0c0d10] flex items-start justify-between">
        <div className="flex flex-col gap-1.5 pr-4">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 border rounded-[4px] ${
                subsystemColorMap[node.subsystem] || "bg-[#111214] border-[#363739] text-[#9c9c9d]"
              }`}
            >
              {node.subsystem}
            </span>
            <span className="text-xs font-mono text-[#9c9c9d]">
              {node.protocol}
            </span>
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-white font-sans">
            {node.title}
          </h2>
          <p className="text-xs font-mono text-[#9c9c9d]">{node.subtitle}</p>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-[#9c9c9d] hover:text-white hover:bg-[#1b1c1e] transition-colors rounded-[6px] border border-transparent hover:border-[#363739]"
          aria-label="Close inspector"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6 font-sans">
        <div className="bg-[#111214] border border-[#363739] rounded-[8px] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-xs font-bold font-mono text-white">
              <Clock size={14} className="text-[#ff6363]" />
              LATENCY SLA BUDGET
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 bg-[#1b1c1e] text-[#ff6363] border border-[#363739] rounded-[4px]">
              {node.latency}
            </span>
          </div>
          <p className="text-xs text-white font-mono mb-1">
            {node.details.latencyBudget}
          </p>
          <p className="text-[11px] text-[#9c9c9d] leading-relaxed">
            {node.details.empiricalSla}
          </p>
        </div>

        <section>
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#6a6b6c] font-bold mb-2">
            Architecture Specification
          </h3>
          <p className="text-sm text-[#e6e6e6] leading-relaxed">
            {node.details.summary}
          </p>
        </section>

        <section>
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#6a6b6c] font-bold mb-2">
            Safety &amp; System Invariants
          </h3>
          <ul className="space-y-1.5">
            {node.details.keyInvariants.map((inv, idx) => (
              <li
                key={idx}
                className="text-xs text-[#9c9c9d] flex items-start gap-2 bg-[#111214] p-2.5 border border-[#2f3031] rounded-[6px]"
              >
                <Zap size={14} className="text-[#ff6363] mt-0.5 shrink-0" />
                <span>{inv}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#6a6b6c] font-bold flex items-center gap-1.5">
              <Code2 size={14} />
              Implementation Reference
            </h3>
            <button
              onClick={handleCopyCode}
              className="text-[11px] font-mono text-[#ff6363] flex items-center gap-1 hover:underline"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="text-[11px] font-mono text-[#9c9c9d] mb-1.5 bg-[#17181b] border border-[#2f3031] px-2 py-0.5 rounded-[4px] inline-block">
            {node.details.sourceFile}
          </div>
          <pre className="bg-[#040506] text-[#59d499] p-3 text-xs font-mono overflow-x-auto border border-[#2f3031] rounded-[8px] leading-relaxed">
            <code>{node.details.codeSnippet}</code>
          </pre>
        </section>

        <section>
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#6a6b6c] font-bold flex items-center gap-1.5 mb-2">
            <FileText size={14} />
            Data Payload / Wire Protocol
          </h3>
          <pre className="bg-[#040506] text-[#e6e6e6] p-3 text-xs font-mono overflow-x-auto border border-[#2f3031] rounded-[8px] leading-relaxed">
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

        <section className="pt-2 border-t border-[#2f3031]">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#6a6b6c] font-bold mb-3">
            Pipeline Graph Flow
          </h3>

          <div className="space-y-3">
            {upstreamNodes.length > 0 && (
              <div>
                <span className="text-[11px] font-mono text-[#6a6b6c] block mb-1">
                  UPSTREAM INPUTS:
                </span>
                <div className="flex flex-col gap-1.5">
                  {upstreamNodes.map(({ edge, node: uNode }) => (
                    <button
                      key={uNode.id}
                      onClick={() => onSelectNode(uNode.id)}
                      className="flex items-center justify-between p-2 text-left bg-[#111214] hover:bg-[#17181b] border border-[#2f3031] hover:border-[#363739] rounded-[6px] transition-all text-xs"
                    >
                      <span className="flex items-center gap-1.5 font-medium text-white">
                        <ArrowLeft size={13} className="text-[#9c9c9d]" />
                        {uNode.title}
                      </span>
                      <span className="text-[10px] font-mono text-[#9c9c9d]">
                        {edge.label || edge.latency}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {downstreamNodes.length > 0 && (
              <div>
                <span className="text-[11px] font-mono text-[#6a6b6c] block mb-1">
                  DOWNSTREAM OUTPUTS:
                </span>
                <div className="flex flex-col gap-1.5">
                  {downstreamNodes.map(({ edge, node: dNode }) => (
                    <button
                      key={dNode.id}
                      onClick={() => onSelectNode(dNode.id)}
                      className="flex items-center justify-between p-2 text-left bg-[#111214] hover:bg-[#17181b] border border-[#2f3031] hover:border-[#363739] rounded-[6px] transition-all text-xs"
                    >
                      <span className="flex items-center gap-1.5 font-medium text-white">
                        {dNode.title}
                        <ArrowRight size={13} className="text-[#9c9c9d]" />
                      </span>
                      <span className="text-[10px] font-mono text-[#9c9c9d]">
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
