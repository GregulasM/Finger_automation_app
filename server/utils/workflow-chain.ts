const WORKFLOW_ID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const WORKFLOW_CHAIN_HEADER = "x-workflow-chain";

export function parseWorkflowChain(headerValue?: string): string[] {
  if (!headerValue) {
    return [];
  }

  return headerValue
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value) => WORKFLOW_ID_REGEX.test(value));
}

export function appendWorkflowToChain(
  chain: string[],
  workflowId: string,
): string[] {
  if (!workflowId) {
    return [...chain];
  }

  if (chain.includes(workflowId)) {
    return [...chain];
  }

  return [...chain, workflowId];
}

export function formatWorkflowChain(chain: string[]): string {
  return chain.join(",");
}

export function hasWorkflowInChain(chain: string[], workflowId: string): boolean {
  return chain.includes(workflowId);
}

export function isInternalWorkflowHook(pathname: string): boolean {
  return (
    pathname.startsWith("/api/hooks/") ||
    pathname.startsWith("/api/email/inbound/")
  );
}
