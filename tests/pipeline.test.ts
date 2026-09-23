import assert from "node:assert/strict";
import test from "node:test";
import {
  PIPELINE_STAGES,
  PIPELINE_NODES,
  PIPELINE_EDGES,
  TRACE_SCENARIOS,
} from "../src/components/pipeline/data";
import { adminModules } from "../src/lib/admin-modules";

test("pipeline stages define 8 coherent architectural phases", () => {
  assert.equal(PIPELINE_STAGES.length, 8);
  const stageIds = PIPELINE_STAGES.map((s) => s.id);
  assert.deepEqual(stageIds, [
    "stage-0",
    "stage-1",
    "stage-2",
    "stage-3",
    "stage-4",
    "stage-5",
    "stage-6",
    "stage-7",
  ]);
});

test("all pipeline edges connect valid and existing nodes", () => {
  const nodeMap = new Map(PIPELINE_NODES.map((n) => [n.id, n]));
  assert.ok(PIPELINE_NODES.length >= 18);

  for (const edge of PIPELINE_EDGES) {
    assert.ok(
      nodeMap.has(edge.from),
      `Edge ${edge.id} references missing source node '${edge.from}'`,
    );
    assert.ok(
      nodeMap.has(edge.to),
      `Edge ${edge.id} references missing target node '${edge.to}'`,
    );
  }
});

test("each pipeline node specifies complete architecture details and SLA", () => {
  for (const node of PIPELINE_NODES) {
    assert.ok(node.latency.length > 0, `Node ${node.id} missing latency`);
    assert.ok(
      node.details.summary.length > 20,
      `Node ${node.id} summary too short`,
    );
    assert.ok(
      node.details.codeSnippet.length > 10,
      `Node ${node.id} missing code snippet`,
    );
    assert.ok(
      node.details.keyInvariants.length >= 2,
      `Node ${node.id} missing invariants`,
    );
    assert.ok(
      node.details.payloadSample.length > 5,
      `Node ${node.id} missing payload sample`,
    );
  }
});

test("simulation scenarios traverse existing nodes and edges", () => {
  const nodeSet = new Set(PIPELINE_NODES.map((n) => n.id));
  const edgeSet = new Set(PIPELINE_EDGES.map((e) => e.id));

  assert.ok(TRACE_SCENARIOS.length >= 3);

  for (const scenario of TRACE_SCENARIOS) {
    assert.ok(scenario.steps.length >= 3);
    for (const step of scenario.steps) {
      assert.ok(
        nodeSet.has(step.nodeId),
        `Scenario ${scenario.id} step references missing node ${step.nodeId}`,
      );
      if (step.edgeId) {
        assert.ok(
          edgeSet.has(step.edgeId),
          `Scenario ${scenario.id} step references missing edge ${step.edgeId}`,
        );
      }
    }
  }
});

test("pipeline is registered in admin console navigation", () => {
  const pipelineMod = adminModules.find((m) => m.slug === "pipeline");
  assert.ok(pipelineMod, "pipeline module must be present in adminModules");
  assert.equal(pipelineMod?.icon, "pipeline");
});
