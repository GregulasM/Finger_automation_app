import { createError, getHeader } from "h3";
import type { H3Event } from "h3";

export function requireSchedulerAuth(event: H3Event) {
  const config = useRuntimeConfig();
  const secret = String(config.schedulerSecret ?? "").trim();

  if (!secret) {
    return;
  }

  const headerSecret =
    (getHeader(event, "x-scheduler-secret") ?? "").trim() ||
    (getHeader(event, "x-cron-secret") ?? "").trim();
  const authHeader = (getHeader(event, "authorization") ?? "").trim();
  const bearerToken = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : "";

  if (headerSecret === secret || bearerToken === secret) {
    return;
  }

  throw createError({
    statusCode: 401,
    statusMessage: "Invalid scheduler secret",
  });
}
