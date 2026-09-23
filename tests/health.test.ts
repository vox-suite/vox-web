import assert from "node:assert/strict";
import test from "node:test";
import {
  fetchRemoteSystemHealth,
  formatBytes,
  formatUptime,
  getCpuUsage,
  getDockerMetrics,
  getSystemHealth,
} from "../src/lib/system-health";

test("formatBytes formats byte counts with proper binary suffixes", () => {
  assert.equal(formatBytes(0), "0 B");
  assert.equal(formatBytes(-50), "0 B");
  assert.equal(formatBytes(1024), "1 KB");
  assert.equal(formatBytes(1024 * 1024 * 1.5), "1.5 MB");
  assert.equal(formatBytes(1024 * 1024 * 1024 * 8), "8 GB");
});

test("formatUptime formats seconds into readable time intervals", () => {
  assert.equal(formatUptime(0), "0s");
  assert.equal(formatUptime(45), "45s");
  assert.equal(formatUptime(125), "2m 5s");
  assert.equal(formatUptime(3665), "1h 1m");
  assert.equal(formatUptime(90000), "1d 1h");
});

test("getCpuUsage calculates a bounded percentage", async () => {
  const usage = await getCpuUsage();
  assert.ok(typeof usage === "number");
  assert.ok(usage >= 0 && usage <= 100);
});

test("getDockerMetrics returns valid container telemetry structure", async () => {
  const metrics = await getDockerMetrics();
  assert.ok(typeof metrics.available === "boolean");
  assert.ok(typeof metrics.totalContainers === "number");
  assert.ok(typeof metrics.runningContainers === "number");
  assert.ok(Array.isArray(metrics.containers));
  assert.ok(metrics.runningContainers <= metrics.totalContainers);

  for (const container of metrics.containers) {
    assert.ok(typeof container.id === "string" && container.id.length > 0);
    assert.ok(typeof container.name === "string" && container.name.length > 0);
    assert.ok(typeof container.image === "string");
    assert.ok(typeof container.state === "string");
    assert.ok(typeof container.status === "string");
    assert.ok(typeof container.cpuPercent === "string");
    assert.ok(typeof container.memUsage === "string");
    assert.ok(typeof container.memLimit === "string");
    assert.ok(typeof container.memPercent === "string");
    assert.ok(typeof container.netIO === "string");
    assert.ok(typeof container.blockIO === "string");
  }
});

test("getSystemHealth combines host and container metrics", async () => {
  const health = await getSystemHealth();
  assert.ok(health.timestamp);
  assert.ok(health.host);
  assert.ok(health.host.hostname);
  assert.ok(health.host.cpu.cores >= 1);
  assert.ok(
    health.host.cpu.usagePercent >= 0 && health.host.cpu.usagePercent <= 100,
  );
  assert.ok(health.host.memory.totalBytes > 0);
  assert.ok(
    health.host.memory.usedPercent >= 0 &&
      health.host.memory.usedPercent <= 100,
  );
  assert.ok(
    health.host.memory.totalFormatted.includes("GB") ||
      health.host.memory.totalFormatted.includes("MB"),
  );
  assert.ok(health.docker);
});

test("fetchRemoteSystemHealth returns null when unconfigured", async () => {
  const prevUrl = process.env.VOX_CORE_ADMIN_URL;
  const prevToken = process.env.VOX_ADMIN_TOKEN;
  try {
    delete process.env.VOX_CORE_ADMIN_URL;
    delete process.env.VOX_ADMIN_TOKEN;
    const res = await fetchRemoteSystemHealth();
    assert.equal(res, null);
  } finally {
    if (prevUrl) process.env.VOX_CORE_ADMIN_URL = prevUrl;
    if (prevToken) process.env.VOX_ADMIN_TOKEN = prevToken;
  }
});
