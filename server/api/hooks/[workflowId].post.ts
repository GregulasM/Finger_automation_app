import { createError, getHeader, getRouterParam, readBody } from "h3";
import { prisma } from "../../../app/lib/prisma";
import { enqueueWorkflow } from "../../utils/workflow-queue";
import {
  WORKFLOW_CHAIN_HEADER,
  appendWorkflowToChain,
  hasWorkflowInChain,
  parseWorkflowChain,
} from "../../utils/workflow-chain";

// Check if workflow has a CONNECTED webhook trigger in graphData
function hasConnectedWebhookTrigger(graphData: unknown): boolean {
  if (!graphData || typeof graphData !== "object") {
    return false;
  }
  const data = graphData as Record<string, unknown>;
  if (!Array.isArray(data.nodes)) {
    return false;
  }

  const edges = Array.isArray(data.edges) ? data.edges : [];
  const connectedNodeIds = new Set(
    edges.map((e) => String((e as Record<string, unknown>).source)),
  );

  return data.nodes.some((node) => {
    const n = node as Record<string, unknown>;
    const nodeId = String(n.id ?? "");
    const nodeData = (n.data ?? {}) as Record<string, unknown>;
    const role = String(nodeData.role ?? "").toLowerCase();
    const type = String(nodeData.type ?? n.type ?? "").toLowerCase();
    // Trigger must be webhook AND must have at least one outgoing edge
    return (
      role === "trigger" && type === "webhook" && connectedNodeIds.has(nodeId)
    );
  });
}

export default defineEventHandler(async (event) => {
  const workflowId = getRouterParam(event, "workflowId");
  if (!workflowId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing workflowId",
    });
  }

  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
  });

  if (!workflow || workflow.status !== "ACTIVE") {
    throw createError({
      statusCode: 404,
      statusMessage: "Workflow not found or inactive",
    });
  }

  const incomingChain = parseWorkflowChain(
    getHeader(event, WORKFLOW_CHAIN_HEADER),
  );
  if (hasWorkflowInChain(incomingChain, workflowId)) {
    throw createError({
      statusCode: 409,
      statusMessage: "Workflow recursion detected",
    });
  }

  // Check graphData for CONNECTED webhook trigger
  // Trigger must exist AND have at least one outgoing connection
  if (!hasConnectedWebhookTrigger(workflow.graphData)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Workflow does not have a connected webhook trigger",
    });
  }

  const payload = await readBody(event);

  const execution = await prisma.execution.create({
    data: {
      workflowId: workflow.id,
      status: "PENDING",
      logs: [
        {
          at: new Date().toISOString(),
          level: "info",
          message: "Webhook received",
        },
      ],
    },
  });

  await enqueueWorkflow({
    workflowId: workflow.id,
    executionId: execution.id,
    payload,
    source: "webhook",
    chain: appendWorkflowToChain(incomingChain, workflow.id),
  });

  return { queued: true, executionId: execution.id };
});
