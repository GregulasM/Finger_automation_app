import { createError, getRouterParam } from "h3";
import { prisma } from "../../../app/lib/prisma";
import { requireAuthUser } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  const workflowId = getRouterParam(event, "id");
  if (!workflowId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing workflow id",
    });
  }

  const authUser = await requireAuthUser(event);

  const existing = await prisma.workflow.findUnique({
    where: { id: workflowId },
    select: { userId: true },
  });

  if (!existing || existing.userId !== authUser.id) {
    throw createError({
      statusCode: 404,
      statusMessage: "Workflow not found",
    });
  }

  await prisma.workflow.delete({
    where: { id: workflowId },
  });

  return { success: true };
});
