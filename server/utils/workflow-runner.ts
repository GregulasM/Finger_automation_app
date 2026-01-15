import { runInNewContext } from "node:vm";
import { prisma } from "../../app/lib/prisma";
import { sendEmail } from "./email";
import { safeExecute } from "./safe-execute";
import { getUpstashRedis } from "./upstash-redis";
import { normalizeWorkflowSteps, type WorkflowStep } from "./workflow";
import type { WorkflowJobData } from "./workflow-job";
import {
  WORKFLOW_CHAIN_HEADER,
  appendWorkflowToChain,
  formatWorkflowChain,
  isInternalWorkflowHook,
} from "./workflow-chain";

type WorkflowExecutionContext = {
  workflowId: string;
  chain: string[];
  appOrigin: string;
};

export async function processWorkflowJob(data: WorkflowJobData) {
  const runtimeConfig = useRuntimeConfig();
  const appOrigin = resolveAppOrigin(
    runtimeConfig.public?.appUrl as string | undefined,
  );
  const chain = appendWorkflowToChain(data.chain ?? [], data.workflowId);
  const context: WorkflowExecutionContext = {
    workflowId: data.workflowId,
    chain,
    appOrigin,
  };
  const redis = getUpstashRedis();
  const lockKey = data.executionId
    ? `workflow:execution:${data.executionId}`
    : null;
  if (redis && lockKey) {
    const locked = await redis.set(lockKey, "1", { nx: true, ex: 60 * 30 });
    if (!locked) {
      return;
    }
  }

  try {
    const workflow = await prisma.workflow.findUnique({
      where: { id: data.workflowId },
    });

    if (!workflow) {
      return;
    }

    const steps = normalizeWorkflowSteps(workflow.graphData);
    const execution = data.executionId
      ? await prisma.execution.findUnique({ where: { id: data.executionId } })
      : null;

    if (execution && execution.status !== "PENDING") {
      return;
    }

    const executionRecord =
      execution ??
      (await prisma.execution.create({
        data: {
          workflowId: workflow.id,
          status: "PENDING",
          logs: [],
        },
      }));

    let logs = Array.isArray(executionRecord.logs) ? executionRecord.logs : [];

    const appendLog = async (entry: Record<string, unknown>): Promise<void> => {
      logs = [...logs, entry];
      await prisma.execution.update({
        where: { id: executionRecord.id },
        data: { logs },
      });
    };

    await prisma.execution.update({
      where: { id: executionRecord.id },
      data: { status: "RUNNING", startedAt: new Date() },
    });

    await appendLog({
      at: new Date().toISOString(),
      level: "info",
      message: "Workflow started",
      source: data.source,
    });

    let currentInput = data.payload ?? {};

    for (let index = 0; index < steps.length; index += 1) {
      const step = steps[index];
      const stepOrder = index + 1;

      const stepRecord = await prisma.executionStep.create({
        data: {
          executionId: executionRecord.id,
          stepKey: step.key,
          stepOrder,
          status: "PENDING",
          input: currentInput,
        },
      });

      const result = await executeStepWithRetries(
        step,
        currentInput,
        appendLog,
        context,
      );

      if (!result.ok) {
        await prisma.executionStep.update({
          where: { id: stepRecord.id },
          data: {
            status: "FAIL",
            output: { error: result.error, attempts: result.attempts },
            duration: result.duration,
          },
        });

        await appendLog({
          at: new Date().toISOString(),
          level: "error",
          message: "Step failed",
          stepKey: step.key,
          error: result.error,
          attempts: result.attempts,
        });

        const onError = String(step.config?.onError ?? "fail")
          .toLowerCase()
          .trim();
        const notifyEmail = String(step.config?.notifyEmail ?? "").trim();

        if (notifyEmail) {
          try {
            await sendEmail({
              to: notifyEmail,
              subject: `Workflow step failed: ${step.key}`,
              html: `<p>Step <strong>${step.key}</strong> failed.</p><p>Error: ${result.error}</p>`,
              text: `Step ${step.key} failed. Error: ${result.error}`,
            });
          } catch (error) {
            await appendLog({
              at: new Date().toISOString(),
              level: "warn",
              message: "Failure notification failed",
              stepKey: step.key,
            });
          }
        }

        if (onError === "pause") {
          await prisma.execution.update({
            where: { id: executionRecord.id },
            data: { status: "PAUSED" },
          });

          await appendLog({
            at: new Date().toISOString(),
            level: "warn",
            message: "Workflow paused after step failure",
            stepKey: step.key,
          });

          return;
        }

        await prisma.execution.update({
          where: { id: executionRecord.id },
          data: { status: "FAIL", finishedAt: new Date() },
        });

        return;
      }

      await prisma.executionStep.update({
        where: { id: stepRecord.id },
        data: {
          status: "SUCCESS",
          output: result.output,
          duration: result.duration,
        },
      });

      await appendLog({
        at: new Date().toISOString(),
        level: "info",
        message: "Step completed",
        stepKey: step.key,
      });

      currentInput = result.output;
    }

    await appendLog({
      at: new Date().toISOString(),
      level: "info",
      message: "Workflow completed",
    });

    await prisma.execution.update({
      where: { id: executionRecord.id },
      data: { status: "SUCCESS", finishedAt: new Date() },
    });
  } finally {
    if (redis && lockKey) {
      try {
        await redis.del(lockKey);
      } catch (error) {
        console.warn("Failed to release workflow lock", error);
      }
    }
  }
}

async function handleStep(
  step: WorkflowStep,
  input: unknown,
  context: WorkflowExecutionContext,
) {
  switch (step.type) {
    case "HTTP Request":
      return handleHttpRequest(step, input, context);
    case "Email":
      return handleEmail(step, input);
    case "Telegram":
      return handleTelegram(step, input);
    case "Database":
      return handleDatabase(step, input);
    case "Transformation":
      return handleTransformation(step, input);
    default:
      throw new Error(`Unsupported step type: ${step.type}`);
  }
}

async function handleHttpRequest(
  step: WorkflowStep,
  input: unknown,
  context: WorkflowExecutionContext,
) {
  const config = step.config ?? {};
  const url = String(config.url ?? config.endpoint ?? "");
  if (!url) {
    throw new Error("HTTP Request step missing url");
  }

  const parsed = new URL(url);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("HTTP Request step uses unsupported protocol");
  }

  const method = String(config.method ?? "POST").toUpperCase();
  const headers = parseObjectConfig(config.headers);
  const shouldAttachChain =
    Boolean(context.appOrigin) &&
    parsed.origin === context.appOrigin &&
    isInternalWorkflowHook(parsed.pathname);
  const workflowChainHeader =
    shouldAttachChain && context.chain.length
      ? formatWorkflowChain(context.chain)
      : null;

  const body = config.body ?? input;
  const bodyPayload = parseJsonMaybe(body);
  const shouldSendBody = !["GET", "HEAD"].includes(method);

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    step.timeoutMs ?? 15000,
  );

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
        ...(workflowChainHeader
          ? { [WORKFLOW_CHAIN_HEADER]: workflowChainHeader }
          : {}),
      },
      body: shouldSendBody
        ? typeof bodyPayload === "string"
          ? bodyPayload
          : JSON.stringify(bodyPayload ?? {})
        : undefined,
      signal: controller.signal,
    });

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json().catch(() => null)
      : await response.text();

    return {
      status: response.status,
      ok: response.ok,
      data,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function handleEmail(step: WorkflowStep, input: unknown) {
  const config = step.config ?? {};
  const to = String(config.to ?? config.email ?? "");

  console.log("[Email Action] Processing email step:", {
    to,
    subject: config.subject,
    provider: config.emailProvider,
    hasSmtpEmail: Boolean(config.smtpEmail),
    hasSendGridKey: Boolean(config.sendgridApiKey),
  });

  if (!to) {
    throw new Error("Email step missing recipient");
  }

  const subject = String(config.subject ?? "Workflow notification");
  const html =
    typeof config.html === "string"
      ? config.html
      : `<pre>${JSON.stringify(input, null, 2)}</pre>`;
  const text =
    typeof config.text === "string"
      ? config.text
      : JSON.stringify(input, null, 2);

  // Check if custom provider is configured
  const provider = String(config.emailProvider ?? "resend");

  if (provider !== "resend" || config.smtpEmail || config.sendgridApiKey) {
    // Use new multi-provider system
    const { sendEmailWithProvider } = await import("./email-providers");

    const result = await sendEmailWithProvider(
      {
        provider: provider as "gmail" | "sendgrid" | "smtp" | "resend",
        smtpEmail: config.smtpEmail as string | undefined,
        smtpPassword: config.smtpPassword as string | undefined,
        smtpHost: config.smtpHost as string | undefined,
        smtpPort: config.smtpPort as number | undefined,
        sendgridApiKey: config.sendgridApiKey as string | undefined,
        resendApiKey: config.resendApiKey as string | undefined,
        from: config.from as string | undefined,
      },
      { to, subject, html, text },
    );

    if (!result.ok) {
      console.error("[Email Action] Failed:", result.error);
      throw new Error(result.error || "Email sending failed");
    }

    console.log("[Email Action] Success:", {
      provider: result.provider,
      messageId: result.messageId,
    });
    return { ok: true, provider: result.provider, messageId: result.messageId };
  }

  // Fallback to original Resend-only implementation
  console.log("[Email Action] Using Resend fallback");
  const result = await sendEmail({ to, subject, html, text });
  return { ok: true, result };
}

async function handleTelegram(step: WorkflowStep, input: unknown) {
  const config = step.config ?? {};
  const token = String(config.botToken ?? "");
  const chatId = String(config.chatId ?? "");

  if (!token || !chatId) {
    throw new Error("Telegram step missing botToken or chatId");
  }

  const message =
    typeof config.message === "string" ? config.message : JSON.stringify(input);

  const response = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: config.parseMode ?? undefined,
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Telegram API error: ${errorText}`);
  }

  return response.json();
}

async function handleDatabase(step: WorkflowStep, input: unknown) {
  const config = step.config ?? {};
  const model = String(config.model ?? "");
  const operation = String(config.operation ?? "create");
  const allowedOperations = new Set([
    "create",
    "update",
    "upsert",
    "delete",
    "findMany",
    "findUnique",
  ]);

  if (!model) {
    throw new Error("Database step missing model");
  }
  if (!allowedOperations.has(operation)) {
    throw new Error(`Unsupported database operation: ${operation}`);
  }

  const delegate = (prisma as Record<string, Record<string, unknown>>)[model];
  if (!delegate || typeof delegate[operation] !== "function") {
    throw new Error(`Unsupported database operation: ${model}.${operation}`);
  }

  const rawArgs = parseObjectConfig(config.args);
  const args = { ...rawArgs } as Record<string, unknown>;

  if (!("data" in args) && operation === "create") {
    args.data =
      typeof input === "object" && input !== null ? input : { value: input };
  }

  return (delegate[operation] as (value: Record<string, unknown>) => unknown)(
    args,
  );
}

async function handleTransformation(step: WorkflowStep, input: unknown) {
  const config = step.config ?? {};

  if (typeof config.expression === "string") {
    return runInNewContext(
      `(function(input){ return (${config.expression}); })(input)`,
      { input },
      { timeout: 100 },
    );
  }

  const mapping = parseObjectConfig(config.mapping);
  if (Object.keys(mapping).length > 0) {
    return mapPayload(input, mapping);
  }

  return input;
}

function mapPayload(input: unknown, mapping: Record<string, unknown>) {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(mapping)) {
    if (typeof value === "string") {
      result[key] = getByPath(input, value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

function getByPath(input: unknown, path: string) {
  const normalized = path.replace(/^\$\.|^input\./, "");
  if (!normalized) {
    return input;
  }

  return normalized.split(".").reduce(
    (acc, key) => {
      if (acc && typeof acc === "object") {
        return (acc as Record<string, unknown>)[key];
      }
      return undefined;
    },
    input as Record<string, unknown>,
  );
}

function parseObjectConfig(value: unknown): Record<string, unknown> {
  if (typeof value === "string") {
    const parsed = parseJsonMaybe(value);
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, unknown>;
    }
    return {};
  }
  if (value && typeof value === "object") {
    return value as Record<string, unknown>;
  }
  return {};
}

function parseJsonMaybe(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return value;
  }
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

async function executeStepWithRetries(
  step: WorkflowStep,
  input: unknown,
  appendLog: (entry: Record<string, unknown>) => Promise<void>,
  context: WorkflowExecutionContext,
) {
  const retryCount = Number(step.config?.retryCount ?? 0);
  const retryDelayMs = Number(step.config?.retryDelayMs ?? 0);

  let attempt = 0;
  let lastFailure: { error: string; duration: number } | null = null;

  while (attempt <= retryCount) {
    attempt += 1;

    const result = await safeExecute(
      async () => handleStep(step, input, context),
      step.timeoutMs ?? 15000,
    );

    if (result.ok) {
      return { ...result, attempts: attempt };
    }

    lastFailure = { error: result.error, duration: result.duration };

    await appendLog({
      at: new Date().toISOString(),
      level: "warn",
      message: "Step attempt failed",
      stepKey: step.key,
      attempt,
      error: result.error,
    });

    if (attempt <= retryCount && retryDelayMs > 0) {
      await appendLog({
        at: new Date().toISOString(),
        level: "info",
        message: "Retry scheduled",
        stepKey: step.key,
        attempt: attempt + 1,
        delayMs: retryDelayMs,
      });
      await delay(retryDelayMs);
    }
  }

  return {
    ok: false as const,
    error: lastFailure?.error ?? "Unknown error",
    duration: lastFailure?.duration ?? 0,
    attempts: attempt,
  };
}

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function resolveAppOrigin(configUrl?: string) {
  const trimmed = String(configUrl ?? "").trim();
  const vercelUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "";
  const candidate =
    trimmed && trimmed !== "http://localhost:3000"
      ? trimmed
      : vercelUrl || trimmed;

  if (!candidate) {
    return "";
  }

  try {
    return new URL(candidate).origin;
  } catch {
    return "";
  }
}
