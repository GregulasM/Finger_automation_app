import { runCronWorkflows } from "../../utils/cron-runner";
import { requireSchedulerAuth } from "../../utils/scheduler-auth";

export default defineEventHandler(async (event) => {
  requireSchedulerAuth(event);
  return await runCronWorkflows({});
});
