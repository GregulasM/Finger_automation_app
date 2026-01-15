export type WorkflowJobSource = "webhook" | "cron" | "email";

export type WorkflowJobData = {
  workflowId: string;
  executionId?: string;
  payload?: unknown;
  source: WorkflowJobSource;
  chain?: string[];
};
