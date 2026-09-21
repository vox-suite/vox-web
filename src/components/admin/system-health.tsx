"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  DataTable,
  EmptyState,
  Grid,
  LoadingState,
  Notice,
  Row,
  Stack,
  Stat,
  Text,
} from "@/components/ui";
import type { SystemHealthData } from "@/lib/system-health";

async function fetchHealth(signal?: AbortSignal): Promise<SystemHealthData> {
  const res = await fetch("/api/admin/health", {
    cache: "no-store",
    signal,
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      res.status === 401
        ? "Your session has ended. Sign in again to continue."
        : errorBody.error || "System health could not be loaded. Try again.",
    );
  }
  return res.json();
}

export function SystemHealthDashboard() {
  const [data, setData] = useState<SystemHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const result = await fetchHealth();
      setData(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load telemetry");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    fetchHealth(controller.signal)
      .then((res) => {
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted && !controller.signal.aborted) {
          setError(
            err instanceof Error ? err.message : "Failed to load telemetry",
          );
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  if (loading && !data) {
    return (
      <LoadingState label="Gathering system telemetry…" />
    );
  }

  if (error && !data) {
    return (
      <Stack gap="large">
        <Notice title="Unable to retrieve health status" tone="error">
          {error}
        </Notice>
        <Button variant="primary" onClick={() => void loadData(false)}>
          Try again
        </Button>
      </Stack>
    );
  }

  if (!data) {
    return null;
  }

  const { host, docker, timestamp } = data;
  const memoryTone =
    host.memory.usedPercent > 85
      ? "warning"
      : host.memory.usedPercent > 70
        ? "accent"
        : "neutral";

  return (
    <Stack gap="large">
      {/* Action Header */}
      <Row spread>
        <Stack gap="small">
          <Text muted small>
            Last sampled: {new Date(timestamp).toLocaleTimeString()}
          </Text>
        </Stack>
        <Button
          variant="secondary"
          onClick={() => void loadData(true)}
          disabled={refreshing}
          aria-label="Refresh telemetry"
        >
          <RefreshCw
            size={16}
            className={refreshing ? "animate-spin mr-2" : "mr-2"}
          />
          {refreshing ? "Refreshing…" : "Refresh"}
        </Button>
      </Row>

      {error && (
        <Notice title="Refresh failed" tone="error">
          {error}
        </Notice>
      )}

      {/* System Resources Overview */}
      <Card
        title="Host system metrics"
        description="CPU, memory and operating system environment"
      >
        <Grid columns={3}>
          <Stat
            label="Host CPU usage"
            value={`${host.cpu.usagePercent}%`}
            description={`${host.cpu.model} (${host.cpu.cores} cores)`}
          />
          <Stat
            label="Host RAM used"
            value={`${host.memory.usedPercent}%`}
            description={`${host.memory.usedFormatted} of ${host.memory.totalFormatted}`}
          />
          <Stat
            label="Docker engine"
            value={docker.available ? "Online" : "Offline"}
            description={
              docker.available
                ? `${docker.containers.filter((c) => c.state.toLowerCase() === "running").length} running / ${docker.containers.length} total`
                : docker.error || "Daemon unavailable"
            }
          />
        </Grid>
      </Card>

      {/* CPU Breakdown */}
      <Grid columns={2}>
        <Card
          title="CPU & load"
          description="Architecture and current process load"
        >
          <Stack gap="normal">
            <Row spread>
              <Text muted>Load average (1m / 5m / 15m)</Text>
              <Text>
                {host.cpu.loadAvg.map((l: number) => l.toFixed(2)).join(" / ")}
              </Text>
            </Row>
            <Row spread>
              <Text muted>Processor cores</Text>
              <Text>{host.cpu.cores}</Text>
            </Row>
            <Row spread>
              <Text muted>Platform / Architecture</Text>
              <Text>
                {host.platform} ({host.arch})
              </Text>
            </Row>
            <Row spread>
              <Text muted>Host uptime</Text>
              <Text>{host.uptimeFormatted}</Text>
            </Row>
          </Stack>
        </Card>

        {/* Memory Breakdown */}
        <Card
          title="Memory utilization"
          description="Host and node process memory"
        >
          <Stack gap="normal">
            <Row spread>
              <Text muted>Host total RAM</Text>
              <Text>{host.memory.totalFormatted}</Text>
            </Row>
            <Row spread>
              <Text muted>Host RAM in use</Text>
              <Badge tone={memoryTone}>
                {host.memory.usedFormatted} ({host.memory.usedPercent}%)
              </Badge>
            </Row>
            <Row spread>
              <Text muted>Free RAM</Text>
              <Text>{host.memory.freeFormatted}</Text>
            </Row>
            <Row spread>
              <Text muted>Node.js process RSS</Text>
              <Text>{host.process.rssFormatted}</Text>
            </Row>
            <Row spread>
              <Text muted>Node.js heap used</Text>
              <Text>
                {host.process.heapUsedFormatted} / {host.process.heapTotalFormatted}
              </Text>
            </Row>
          </Stack>
        </Card>
      </Grid>

      {/* Process & Environment Details */}
      <Card
        title="Runtime details"
        description="Node process environment and system release"
      >
        <Grid columns={3}>
          <Stat
            label="Node runtime"
            value={host.process.nodeVersion}
            description={`Uptime: ${host.process.uptimeFormatted}`}
          />
          <Stat
            label="Host uptime"
            value={host.uptimeFormatted}
            description="Total machine runtime"
          />
          <Stat
            label="Kernel release"
            value={host.release}
            description={host.platform}
          />
        </Grid>
      </Card>

      {/* Containers Table */}
      <Card
        title="Container resources"
        description="Real-time Docker engine resource utilization"
      >
        {docker.containers.length === 0 ? (
          <EmptyState
            title={
              docker.available
                ? "No containers detected"
                : "Docker is unavailable"
            }
            description={
              docker.error ||
              "No running or exited Docker containers were found on this system."
            }
          />
        ) : (
          <DataTable
            caption="Container resources"
            headings={[
              "Container",
              "Status",
              "CPU %",
              "Memory",
              "Memory %",
              "Net I/O",
              "Block I/O",
              "PIDs",
            ]}
          >
            {docker.containers.map((c) => {
              const isRunning = c.state.toLowerCase() === "running";
              return (
                <tr key={c.id}>
                  <td>
                    <Stack gap="small">
                      <Text>
                        <strong>{c.name}</strong>
                      </Text>
                      <Text small muted>
                        {c.image}
                      </Text>
                    </Stack>
                  </td>
                  <td>
                    <Badge tone={isRunning ? "positive" : "neutral"}>
                      {c.status}
                    </Badge>
                  </td>
                  <td>
                    <Text>{c.cpuPercent}</Text>
                  </td>
                  <td>
                    <Stack gap="small">
                      <Text>{c.memUsage}</Text>
                      <Text small muted>
                        limit: {c.memLimit}
                      </Text>
                    </Stack>
                  </td>
                  <td>
                    <Badge
                      tone={
                        parseFloat(c.memPercent) > 80
                          ? "warning"
                          : parseFloat(c.memPercent) > 60
                            ? "accent"
                            : "neutral"
                      }
                    >
                      {c.memPercent}
                    </Badge>
                  </td>
                  <td>
                    <Text>{c.netIO}</Text>
                  </td>
                  <td>
                    <Text>{c.blockIO}</Text>
                  </td>
                  <td>
                    <Text>{String(c.pids)}</Text>
                  </td>
                </tr>
              );
            })}
          </DataTable>
        )}
      </Card>
    </Stack>
  );
}
