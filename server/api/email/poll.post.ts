import { readBody } from "h3";
import { runEmailPolling } from "../../utils/imap-polling";
import { requireSchedulerAuth } from "../../utils/scheduler-auth";

export default defineEventHandler(async (event) => {
  requireSchedulerAuth(event);
  await readBody(event).catch(() => ({}));
  return await runEmailPolling();
});
