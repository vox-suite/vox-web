import os from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type HostCpuInfo = {
  model: string;
  cores: number;
  usagePercent: number;
  loadAvg: [number, number, number];
};

export type HostMemoryInfo = {
  totalBytes: number;
  usedBytes: number;
  freeBytes: number;
  usedPercent: number;
  totalFormatted: string;
  usedFormatted: string;
  freeFormatted: string;
};

export type HostProcessInfo = {
  nodeVersion: string;
  uptimeSeconds: number;
  uptimeFormatted: string;
  rssFormatted: string;
  heapUsedFormatted: string;
  heapTotalFormatted: string;
};

export type HostMetrics = {
  hostname: string;
  platform: string;
  arch: string;
  release: string;
  uptimeSeconds: number;
  uptimeFormatted: string;
  cpu: HostCpuInfo;
  memory: HostMemoryInfo;
  process: HostProcessInfo;
};

export type ContainerStats = {
  id: string;
  name: string;
  image: string;
  state: string;
  status: string;
  ports?: string;
  cpuPercent: string;
  memUsage: string;
  memLimit: string;
  memPercent: string;
  netIO: string;
  blockIO: string;
  pids: number | string;
};

export type DockerMetrics = {
  available: boolean;
  error?: string;
  totalContainers: number;
  runningContainers: number;
  containers: ContainerStats[];
};

export type SystemHealthData = {
  timestamp: string;
  host: HostMetrics;
  docker: DockerMetrics;
};

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes <= 0 || isNaN(bytes)) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

export function formatUptime(seconds: number): string {
  if (seconds <= 0 || isNaN(seconds)) return "0s";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (parts.length === 0 || secs > 0) parts.push(`${secs}s`);

  return parts.slice(0, 2).join(" ");
}

function sampleCpuTimes(): { idle: number; total: number } {
  const cpus = os.cpus();
  let idle = 0;
  let total = 0;
  for (const cpu of cpus) {
    for (const key of Object.keys(cpu.times)) {
      total += cpu.times[key as keyof typeof cpu.times];
    }
    idle += cpu.times.idle;
  }
  return { idle, total };
}

export async function getCpuUsage(): Promise<number> {
  const start = sampleCpuTimes();
  return new Promise<number>((resolve) => {
    setTimeout(() => {
      const end = sampleCpuTimes();
      const deltaIdle = end.idle - start.idle;
      const deltaTotal = end.total - start.total;
      const pct =
        deltaTotal > 0
          ? Math.min(
              100,
              Math.max(0, Math.round((1 - deltaIdle / deltaTotal) * 1000) / 10),
            )
          : 0;
      resolve(pct);
    }, 100);
  });
}

export async function getDockerMetrics(): Promise<DockerMetrics> {
  try {
    const [psResult, statsResult] = await Promise.all([
      execFileAsync("docker", ["ps", "-a", "--format", "{{json .}}"], {
        timeout: 4000,
      })
        .then((r) =>
          r.stdout
            .trim()
            .split("\n")
            .filter(Boolean)
            .map((line) => {
              try {
                return JSON.parse(line);
              } catch {
                return null;
              }
            })
            .filter(Boolean),
        )
        .catch(() => null),
      execFileAsync(
        "docker",
        ["stats", "--no-stream", "--format", "{{json .}}"],
        { timeout: 5000 },
      )
        .then((r) =>
          r.stdout
            .trim()
            .split("\n")
            .filter(Boolean)
            .map((line) => {
              try {
                return JSON.parse(line);
              } catch {
                return null;
              }
            })
            .filter(Boolean),
        )
        .catch(() => null),
    ]);

    if (!psResult && !statsResult) {
      return {
        available: false,
        error: "Docker CLI is not available or the daemon is not running.",
        totalContainers: 0,
        runningContainers: 0,
        containers: [],
      };
    }

    type RawDockerStat = {
      ID?: string;
      Container?: string;
      Name?: string;
      CPUPerc?: string;
      MemUsage?: string;
      MemPerc?: string;
      NetIO?: string;
      BlockIO?: string;
      PIDs?: string | number;
    };

    const statsMap = new Map<string, RawDockerStat>();
    if (Array.isArray(statsResult)) {
      for (const stat of statsResult as RawDockerStat[]) {
        if (stat.ID) statsMap.set(stat.ID, stat);
        if (stat.Name) statsMap.set(stat.Name, stat);
        if (stat.Container) statsMap.set(stat.Container.slice(0, 12), stat);
      }
    }

    type RawDockerPs = {
      ID?: string;
      Names?: string;
      Image?: string;
      State?: string;
      Status?: string;
      Ports?: string;
    };

    const containers: ContainerStats[] = (psResult || []).map(
      (c: RawDockerPs) => {
        const id = c.ID || "";
        const name = c.Names || id;
        const stat = statsMap.get(id) || statsMap.get(name);
        const isRunning = (c.State || "").toLowerCase() === "running";

        let memUsage = "—";
        let memLimit = "—";
        if (stat?.MemUsage) {
          const parts = stat.MemUsage.split(" / ");
          memUsage = parts[0] || "—";
          memLimit = parts[1] || "—";
        }

        return {
          id,
          name,
          image: c.Image || "unknown",
          state: c.State || (isRunning ? "running" : "unknown"),
          status: c.Status || (isRunning ? "Up" : "Exited"),
          ports: c.Ports || undefined,
          cpuPercent: stat?.CPUPerc || (isRunning ? "0.0%" : "—"),
          memUsage,
          memLimit,
          memPercent: stat?.MemPerc || "—",
          netIO: stat?.NetIO || "—",
          blockIO: stat?.BlockIO || "—",
          pids: stat?.PIDs || (isRunning ? 1 : "—"),
        };
      },
    );

    const runningCount = containers.filter(
      (c) => c.state.toLowerCase() === "running",
    ).length;

    return {
      available: true,
      totalContainers: containers.length,
      runningContainers: runningCount,
      containers,
    };
  } catch (error) {
    return {
      available: false,
      error:
        error instanceof Error ? error.message : "Failed to inspect Docker",
      totalContainers: 0,
      runningContainers: 0,
      containers: [],
    };
  }
}

export async function fetchRemoteSystemHealth(): Promise<SystemHealthData | null> {
  const baseUrl = process.env.VOX_CORE_ADMIN_URL;
  const token = process.env.VOX_ADMIN_TOKEN;

  if (!baseUrl || !token) {
    return null;
  }

  try {
    const url = new URL("/v1/admin/system", baseUrl);
    if (
      url.protocol !== "https:" &&
      !(
        url.protocol === "http:" &&
        ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
      )
    ) {
      return null;
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
      redirect: "error",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as SystemHealthData;
    if (data && data.host && data.docker) {
      return data;
    }
    return null;
  } catch {
    return null;
  }
}

export async function getSystemHealth(): Promise<SystemHealthData> {
  const remote = await fetchRemoteSystemHealth();
  if (remote) {
    return remote;
  }

  const [cpuUsage, docker] = await Promise.all([
    getCpuUsage(),
    getDockerMetrics(),
  ]);

  const cpus = os.cpus();
  const cpuModel = cpus[0]?.model || "Unknown CPU";
  const cpuCores = cpus.length;
  const loadAvg = os.loadavg() as [number, number, number];

  const totalBytes = os.totalmem();
  const freeBytes = os.freemem();
  const usedBytes = Math.max(0, totalBytes - freeBytes);
  const usedPercent =
    totalBytes > 0 ? Math.round((usedBytes / totalBytes) * 1000) / 10 : 0;

  const memUsage = process.memoryUsage();
  const processUptime = Math.floor(process.uptime());
  const hostUptime = Math.floor(os.uptime());

  const host: HostMetrics = {
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    release: os.release(),
    uptimeSeconds: hostUptime,
    uptimeFormatted: formatUptime(hostUptime),
    cpu: {
      model: cpuModel,
      cores: cpuCores,
      usagePercent: cpuUsage,
      loadAvg: [
        Math.round(loadAvg[0] * 100) / 100,
        Math.round(loadAvg[1] * 100) / 100,
        Math.round(loadAvg[2] * 100) / 100,
      ],
    },
    memory: {
      totalBytes,
      usedBytes,
      freeBytes,
      usedPercent,
      totalFormatted: formatBytes(totalBytes),
      usedFormatted: formatBytes(usedBytes),
      freeFormatted: formatBytes(freeBytes),
    },
    process: {
      nodeVersion: process.version,
      uptimeSeconds: processUptime,
      uptimeFormatted: formatUptime(processUptime),
      rssFormatted: formatBytes(memUsage.rss),
      heapUsedFormatted: formatBytes(memUsage.heapUsed),
      heapTotalFormatted: formatBytes(memUsage.heapTotal),
    },
  };

  return {
    timestamp: new Date().toISOString(),
    host,
    docker,
  };
}
