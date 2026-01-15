import { createError, readBody } from "h3";
import { z } from "zod";

const nameRegex = /^[A-Za-z\p{Script=Cyrillic}\s'-]+$/u;

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(nameRegex, "Name must contain only Russian or English letters."),
  email: z.string().email().max(255),
  password: z.string().min(8).max(100),
});

export const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(100),
});

export const emailSchema = z.object({
  email: z.string().email().max(255),
});

export const passwordResetSchema = z.object({
  token: z.string().min(20),
  password: z.string().min(8).max(100),
});

export const workflowJobSchema = z.object({
  workflowId: z.string().uuid(),
  executionId: z.string().uuid().optional(),
  payload: z.unknown().optional(),
  source: z.enum(["webhook", "cron", "email"]),
  chain: z.array(z.string()).optional(),
});

export const workflowSaveSchema = z.object({
  name: z.string().min(1).max(255),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  triggerType: z.enum(["WEBHOOK", "CRON", "EMAIL"]),
  graphData: z
    .object({
      nodes: z.array(z.unknown()),
      edges: z.array(z.unknown()),
    })
    .passthrough(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type EmailInput = z.infer<typeof emailSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
export type WorkflowJobInput = z.infer<typeof workflowJobSchema>;
export type WorkflowSaveInput = z.infer<typeof workflowSaveSchema>;

export async function readValidatedBody<T>(
  event: Parameters<typeof readBody>[0],
  schema: z.ZodType<T>,
): Promise<T> {
  const body = await readBody(event);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Validation error",
      data: parsed.error.flatten(),
    });
  }

  return parsed.data;
}
