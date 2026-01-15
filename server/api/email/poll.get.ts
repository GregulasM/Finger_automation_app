import { runEmailPolling } from "../../utils/imap-polling";
import { requireSchedulerAuth } from "../../utils/scheduler-auth";

export default defineEventHandler(async (event) => {
  requireSchedulerAuth(event);
  return await runEmailPolling();
});
