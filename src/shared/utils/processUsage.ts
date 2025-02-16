import process from "node:process";
import { isDev } from "./isDev";

interface ProcessStats {
  cpu: number;
  memory: number;
}

async function startResourceMonitor(): Promise<void> {
  const isDevEnvironment = isDev;
  const monitoringIntervalMs: number = 1000;
  const currentProcessId: number = process.pid;

  let pidUsageModule: typeof import("pidusage") | null = null;
  try {
    if (isDevEnvironment) {
      pidUsageModule = (await import("pidusage")).default;
    }
  } catch (err) {
    console.warn(
      '⚠️ pidusage not installed - run "npm install pidusage -D"',
      err,
    );

    return;
  }

  if (!isDevEnvironment || !pidUsageModule) {
    return;
  }

  let monitoringInterval: NodeJS.Timeout;

  async function collectMetrics(): Promise<void> {
    try {
      if (!pidUsageModule) return;
      const stats: ProcessStats = await pidUsageModule(currentProcessId);
      console.clear();
      console.log("📊 Development Environment Metrics:");
      console.log(`CPU Usage: ${stats.cpu.toFixed(1)}%`);
      console.log(
        `Memory Usage: ${(stats.memory / 1024 / 1024).toFixed(1)} MB`,
      );
    } catch (error) {
      console.error("Metrics collection error:", (error as Error).message);
    }
  }

  function cleanup(): void {
    if (monitoringInterval) {
      clearInterval(monitoringInterval);
      console.log("🛑 Resource monitoring stopped");
    }
  }

  function initializeMonitoring(): void {
    monitoringInterval = setInterval(collectMetrics, monitoringIntervalMs);
    process.on("SIGINT", () => {
      cleanup();
      process.exit(0);
    });
    console.log(
      `🔍 Monitoring process ${currentProcessId} in development mode`,
    );
  }

  initializeMonitoring();
}

if (isDev) {
  startResourceMonitor().catch((error) => {
    console.error("Failed to start monitoring:", error);
  });
}
