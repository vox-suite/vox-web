export type Subsystem =
  | "telephony"
  | "desktop"
  | "bridge"
  | "jev"
  | "core"
  | "storage"
  | "tts"
  | "worker";

export type StageId =
  | "stage-0"
  | "stage-1"
  | "stage-2"
  | "stage-3"
  | "stage-4"
  | "stage-5"
  | "stage-6"
  | "stage-7";

export interface Port {
  id: string;
  name: string;
  type: "in" | "out";
  dataType: string;
}

export interface NodeDetails {
  summary: string;
  latencyBudget: string;
  empiricalSla: string;
  codeReference: string;
  sourceFile: string;
  codeSnippet: string;
  payloadSample: string;
  fallbackStrategy: string;
  keyInvariants: string[];
}

export interface PipelineNode {
  id: string;
  stageId: StageId;
  subsystem: Subsystem;
  title: string;
  subtitle: string;
  description: string;
  latency: string;
  latencyMs: number;
  protocol: string;
  icon: string;
  x: number;
  y: number;
  width: number;
  height: number;
  inputs: Port[];
  outputs: Port[];
  details: NodeDetails;
}

export interface PipelineEdge {
  id: string;
  from: string;
  to: string;
  fromPort?: string;
  toPort?: string;
  label?: string;
  type: "sync" | "async" | "speculative" | "barge";
  latency?: string;
  route?:
    | "direct"
    | "top-highway"
    | "bottom-highway"
    | "corridor-middle"
    | "loop-back";
  labelOffset?: {
    x?: number;
    y?: number;
  };
}

export interface PipelineStage {
  id: StageId;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  color: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface TraceStep {
  step: number;
  nodeId: string;
  edgeId?: string;
  label: string;
  elapsedMs: number;
  description: string;
  dataPayload?: string;
}

export interface TraceScenario {
  id: string;
  title: string;
  description: string;
  callerUtterance: string;
  totalExpectedMs: number;
  steps: TraceStep[];
}
