import { runCronWorkflows } from "../utils/cron-runner";
import { runEmailPolling } from "../utils/imap-polling";

type CronGlobals = typeof globalThis & {
  workflowCronInterval?: NodeJS.Timeout;
  workflowEmailInterval?: NodeJS.Timeout;
  workflowCronRunning?: boolean;
  workflowEmailRunning?: boolean;
  workflowCronStarted?: boolean;
};

export default defineNitroPlugin(() => {
  const config = useRuntimeConfig();
  const schedulerMode = String(
    config.workflowSchedulerMode ?? "",
  ).toLowerCase();
  const isProduction =
    process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
  const allowLocalScheduler =
    schedulerMode === "local" ||
    (!isProduction && schedulerMode !== "disabled");

  // Skip during build/prerender phase
  if (
    process.env.NITRO_PRESET === "nitro-prerender" ||
    process.env.BUILDING ||
    !allowLocalScheduler ||
    (isProduction && !process.env.DATABASE_URL)
  ) {
    console.log(
      "[Cron Plugin] Skipping initialization (build/prerender or scheduler disabled)",
    );
    return;
  }

  const globalForCron = globalThis as CronGlobals;

  // Avoid duplicate initialization
  if (globalForCron.workflowCronStarted) {
    return;
  }
  globalForCron.workflowCronStarted = true;

  // Clear any existing intervals (for HMR in dev)
  if (globalForCron.workflowCronInterval) {
    clearInterval(globalForCron.workflowCronInterval);
  }
  if (globalForCron.workflowEmailInterval) {
    clearInterval(globalForCron.workflowEmailInterval);
  }

  console.log("[Cron Plugin] Starting workflow schedulers...");

  // Cron/Schedule trigger tick
  const cronTick = async () => {
    if (globalForCron.workflowCronRunning) {
      return;
    }
    globalForCron.workflowCronRunning = true;
    try {
      const result = await runCronWorkflows({});
      if (result.queued > 0) {
        console.log(
          `[Cron Plugin] Queued ${result.queued} cron workflow(s):`,
          result.executions,
        );
      }
    } catch (error) {
      console.error("[Cron Plugin] Cron run failed:", error);
    } finally {
      globalForCron.workflowCronRunning = false;
    }
  };

  // Email/IMAP polling tick
  const emailTick = async () => {
    if (globalForCron.workflowEmailRunning) {
      return;
    }
    globalForCron.workflowEmailRunning = true;
    try {
      const result = await runEmailPolling();
      if (result.triggered > 0) {
        console.log(
          `[Email Polling] Triggered ${result.triggered} workflow(s)`,
        );
      }
      if (result.errors.length > 0) {
        console.warn(`[Email Polling] Errors:`, result.errors);
      }
    } catch (error) {
      console.error("[Email Polling] Failed:", error);
    } finally {
      globalForCron.workflowEmailRunning = false;
    }
  };

  // Initial ticks after short delay to let server fully start
  setTimeout(() => {
    console.log("[Cron Plugin] Running initial checks...");
    void cronTick();
    void emailTick();
  }, 5000);

  // Cron check every 30 seconds
  globalForCron.workflowCronInterval = setInterval(() => {
    void cronTick();
  }, 30_000);

  // Email polling every 5 minutes (300 seconds)
  // More frequent polling may hit rate limits on email providers
  globalForCron.workflowEmailInterval = setInterval(() => {
    void emailTick();
  }, 300_000);

  console.log("[Cron Plugin] Schedulers started (cron: 30s, email: 5min)");
});
