"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, Box, RefreshCw } from "lucide-react";
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
  const [error, setError] = useState("");
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>("");

  const loadData = useCallback(
    async (isManual = false) => {
      if (isManual) setRefreshing(true);
      try {
        const result = await fetchHealth();
        setData(result);
        setError("");
        setLastRefreshedAt(new Date().toLocaleTimeString());
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        setLoading(false);
        if (isManual) setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchHealth(controller.signal)
      .then((result) => {
        setData(result);
        setError("");
        setLastRefreshedAt(new Date().toLocaleTimeString());
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      })
      .finally(() => {
        setLoading(false);
      });

    return () => controller.abort();
  }, []);

  if (loading && !data) {
    return <LoadingState label="Inspecting host and container metrics…" />;
  }

  if (error && !data) {
    return (
      <Stack gap="normal">
        <Notice title="Unable to retrieve health status" tone="error">
          {error}
        </Notice>
        <Row>
          <Button variant="secondary" onClick={() => loadData(true)}>
            Retry inspection
          </Button>
        </Row>
      </Stack>
    );
  }

  if (!data) return null;

  const { host, docker } = data;
  const memoryTone =
    host.memory.usedPercent > 90
      ? "warning"
      : host.memory.usedPercent > 75
        ? "accent"
        : "neutral";

  return (
    <Stack gap="large">
      <Row spread>
        <Row>
          <Badge tone="positive">
            <Activity size={13} aria-hidden="true" />
            Host active
          </Badge>
          {docker.available ? (
            <Badge tone="accent">
              <Box size={13} aria-hidden="true" />
              {docker.runningContainers} container
              {docker.runningContainers === 1 ? "" : "s"} running
            </Badge>
          ) : (
            <Badge tone="warning">Docker offline</Badge>
          )}
          {lastRefreshedAt && (
            <Text muted small>
              Updated {lastRefreshedAt}
            </Text>
          )}
        </Row>
        <Row>
          <Button
            variant="secondary"
            onClick={() => loadData(true)}
            disabled={refreshing}
          >
            <RefreshCw
              size={15}
              aria-hidden="true"
              className={refreshing ? "animate-spin" : undefined}
            />
            {refreshing ? "Refreshing…" : "Refresh"}
          </Button>
        </Row>
      </Row>

      {error && (
        <Notice title="Update warning" tone="error">
          {error}
        </Notice>
      )}

      {/* Top Level Summary Statistics */}
      <Grid columns={4}>
        <Stat
          label="CPU usage"
          value={`${host.cpu.usagePercent}%`}
          description={`${host.cpu.cores} cores · 1m load ${host.cpu.loadAvg[0]}`}
        />
        <Stat
          label="RAM in use"
          value={`${host.memory.usedPercent}%`}
          description={`${host.memory.usedFormatted} of ${host.memory.totalFormatted}`}
        />
        <Stat
          label="Containers"
          value={
            docker.available
              ? `${docker.runningContainers} / ${docker.totalContainers}`
              : "Offline"
          }
          description={
            docker.available
              ? `${docker.runningContainers} running on host`
              : "Docker service unavailable"
          }
        />
        <Stat
          label="System uptime"
          value={host.uptimeFormatted}
          description={`${host.platform} · ${host.arch}`}
        />
      </Grid>

      {/* System Resource Details */}
      <Grid columns={2}>
        <Card
          title="Memory allocation"
          description="Physical host RAM distribution"
        >
          <Stack gap="normal">
            <Row spread>
              <Text>Total installed RAM</Text>
              <Badge tone="neutral">{host.memory.totalFormatted}</Badge>
            </Row>
            <Row spread>
              <Text>Memory currently utilized</Text>
              <Badge tone={memoryTone}>
                {host.memory.usedFormatted} ({host.memory.usedPercent}%)
              </Badge>
            </Row>
            <Row spread>
              <Text>Memory available / free</Text>
              <Badge tone="positive">{host.memory.freeFormatted}</Badge>
            </Row>
          </Stack>
        </Card>

        <Card
          title="Host & Node runtime"
          description="Process memory and machine environment"
        >
          <Stack gap="normal">
            <Row spread>
              <Text>OS Platform</Text>
              <Badge tone="neutral">
                {host.platform} ({host.release})
              </Badge>
            </Row>
            <Row spread>
              <Text>Node.js process RSS</Text>
              <Badge tone="neutral">{host.process.rssFormatted}</Badge>
            </Row>
            <Row spread>
              <Text>Node.js heap used / total</Text>
              <Badge tone="neutral">
                {host.process.heapUsedFormatted} /{" "}
                {host.process.heapTotalFormatted}
              </Badge>
            </Row>
          </Stack>
        </Card>
      </Grid>

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
            headers={[
              "Container",
              "Status",
              "CPU %",
              "Memory",
              "Memory %",
              "Net I/O",
              "Block I/O",
              "PIDs",
            ]}
            rows={docker.containers.map((c) => {
              const isRunning = c.state.toLowerCase() === "running";
              return [
                <Stack key={`${c.id}-name`} gap="none">
                  <Text strong>{c.name}</Text>
                  <Text small muted>
                    {c.image}
                  </Text>
                </Stack>,
                <Badge
                  key={`${c.id}-status`}
                  tone={isRunning ? "positive" : "neutral"}
                >
                  {c.status}
                </Badge>,
                <Text key={`${c.id}-cpu`}>{c.cpuPercent}</Text>,
                <Stack key={`${c.id}-mem`} gap="none">
                  <Text>{c.memUsage}</Text>
                  <Text small muted>
                    limit: {c.memLimit}
                  </Text>
                </Stack>,
                <Badge
                  key={`${c.id}-mempct`}
                  tone={
                    parseFloat(c.memPercent) > 80
                      ? "warning"
                      : parseFloat(c.memPercent) > 60
                        ? "accent"
                        : "neutral"
                  }
                >
                  {c.memPercent}
                </Badge>,
                <Text key={`${c.id}-net`}>{c.netIO}</Text>,
                <Text key={`${c.id}-block`}>{c.blockIO}</Text>,
                <Text key={`${c.id}-pids`}>{String(c.pids)}</Text>,
              ];
            })}
          />
        )}
      </Card>
    </Stack>
  );
}
