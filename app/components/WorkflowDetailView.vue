<template>
  <div class="space-y-4 4xs:space-y-6">
    <div
      class="rounded-xl 4xs:rounded-2xl border border-orange-500/30 bg-zinc-800/90 p-3 4xs:p-4 3xs:p-5"
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div
            class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 uppercase tracking-wider text-zinc-100/60"
          >
            {{ t("workflows.overview") }}
          </div>
          <div
            class="mt-1 text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold text-zinc-100"
          >
            {{ workflow?.name || t("workflows.selectWorkflow") }}
          </div>
        </div>
        <div class="flex items-center gap-2">
          <UBadge
            v-if="workflow"
            color="primary"
            variant="solid"
            :ui="{ base: 'bg-orange-500 text-zinc-950 ring-0' }"
          >
            {{ workflow.status }}
          </UBadge>
          <NuxtLink
            v-if="workflow"
            :to="`/workflows/editor?workflowId=${workflow.id}`"
            class="rounded-md border border-orange-500/30 bg-zinc-800/90 px-3 4xs:px-4 py-2 4xs:py-2.5 text-zinc-100 transition hover:border-orange-500/70 hover:bg-zinc-800"
          >
            <span
              class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold"
            >
              {{ t("common.edit") }}
            </span>
          </NuxtLink>
          <button
            v-if="workflow"
            type="button"
            @click="emit('delete', workflow.id)"
            class="rounded-md border border-red-500/30 bg-red-500/20 px-3 4xs:px-4 py-2 4xs:py-2.5 text-red-400 transition hover:border-red-500/70 hover:bg-red-500/30"
          >
            <span
              class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold"
            >
              {{ t("common.delete") }}
            </span>
          </button>
        </div>
      </div>

      <div
        v-if="statsPending"
        class="mt-4 text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/70"
      >
        {{ t("workflows.loadingStats") }}
      </div>
      <div v-else class="mt-4 space-y-4">
        <div v-if="workflow" class="grid gap-4 sm:grid-cols-2">
          <div
            class="rounded-xl border border-orange-500/30 bg-zinc-800/50 p-3 4xs:p-4"
          >
            <div
              class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/70"
            >
              {{ t("workflows.triggerType") }}
            </div>
            <div
              class="mt-1 text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold text-zinc-100"
            >
              {{ workflow.triggerType }}
            </div>
            <div
              v-if="triggerEndpoint"
              class="mt-2 text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/70"
            >
              {{ t("workflows.endpoint") }}: {{ triggerEndpoint }}
            </div>
          </div>
          <div
            class="rounded-xl border border-orange-500/30 bg-zinc-800/50 p-3 4xs:p-4"
          >
            <div
              class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/70"
            >
              {{ t("workflows.lastUpdated") }}
            </div>
            <div
              class="mt-1 text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold text-zinc-100"
            >
              {{ formatDate(workflow.updatedAt) }}
            </div>
            <div
              class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/70"
            >
              {{ t("workflows.created") }} {{ formatDate(workflow.createdAt) }}
            </div>
          </div>
        </div>
        <div v-if="stats" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div
            class="rounded-xl border border-orange-500/30 bg-zinc-800/50 p-3 4xs:p-4"
          >
            <div
              class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/70"
            >
              {{ t("workflows.totalRuns") }}
            </div>
            <div
              class="mt-1 text-[7px] 4xs:text-[8px] 3xs:text-[9px] 2xs:text-[10px] xs:text-[11px] sm:text-sm md:text-md lg:text-md 2xl:text-lg 3xl:text-lg/6 4xl:text-2xl/8 5xl:text-3xl/10 font-bold text-zinc-100"
            >
              {{ stats.total }}
            </div>
          </div>
          <div
            class="rounded-xl border border-orange-500/30 bg-zinc-800/50 p-3 4xs:p-4"
          >
            <div
              class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/70"
            >
              {{ t("workflows.successRate") }}
            </div>
            <div
              class="mt-1 text-[7px] 4xs:text-[8px] 3xs:text-[9px] 2xs:text-[10px] xs:text-[11px] sm:text-sm md:text-md lg:text-md 2xl:text-lg 3xl:text-lg/6 4xl:text-2xl/8 5xl:text-3xl/10 font-bold text-zinc-100"
            >
              {{ formatPercent(stats.successRate) }}
            </div>
          </div>
          <div
            class="rounded-xl border border-orange-500/30 bg-zinc-800/50 p-3 4xs:p-4"
          >
            <div
              class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/70"
            >
              {{ t("workflows.avgDuration") }}
            </div>
            <div
              class="mt-1 text-[7px] 4xs:text-[8px] 3xs:text-[9px] 2xs:text-[10px] xs:text-[11px] sm:text-sm md:text-md lg:text-md 2xl:text-lg 3xl:text-lg/6 4xl:text-2xl/8 5xl:text-3xl/10 font-bold text-zinc-100"
            >
              {{ formatDuration(stats.avgDurationMs) }}
            </div>
          </div>
          <div
            class="rounded-xl border border-orange-500/30 bg-zinc-800/50 p-3 4xs:p-4"
          >
            <div
              class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/70"
            >
              {{ t("workflows.lastRun") }}
            </div>
            <div
              class="mt-1 text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold text-zinc-100"
            >
              {{ stats.lastRunAt ? formatDate(stats.lastRunAt) : "-" }}
            </div>
            <div
              class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/70"
            >
              {{ stats.lastStatus || t("workflows.noRunsYet") }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      class="rounded-xl 4xs:rounded-2xl border border-orange-500/30 bg-zinc-800/90 p-3 4xs:p-4 3xs:p-5"
    >
      <div
        class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 uppercase tracking-wider text-zinc-100/60"
      >
        {{ t("workflows.executionHistory") }}
      </div>
      <div class="mt-3 4xs:mt-4">
        <div
          v-if="executionsPending"
          class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/70"
        >
          {{ t("workflows.loadingExecutions") }}
        </div>
        <div
          v-else-if="executions && executions.length === 0"
          class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/70"
        >
          {{ t("workflows.noExecutionsYet") }}
        </div>
        <div v-else-if="executions" class="space-y-2">
          <div
            v-for="execution in executions"
            :key="execution.id"
            class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-orange-500/30 bg-zinc-800/50 px-3 py-2"
          >
            <div>
              <div
                class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold text-zinc-100"
              >
                {{ formatDate(execution.startedAt) }}
              </div>
              <div
                class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/70"
              >
                {{ t("workflows.steps") }}: {{ execution.steps.length }}
              </div>
            </div>
            <div class="flex items-center gap-2">
              <UBadge
                :color="badgeColor(execution.status)"
                variant="soft"
              >
                {{ execution.status }}
              </UBadge>
              <span
                class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/70"
              >
                {{ formatDuration(durationMs(execution)) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();

const props = defineProps<{
  workflow: {
    id: string;
    name: string;
    status: string;
    triggerType: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  stats: {
    total: number;
    successRate: number;
    avgDurationMs: number;
    lastRunAt: string | null;
    lastStatus: string | null;
  } | null;
  statsPending: boolean;
  executions: Array<{
    id: string;
    status: string;
    startedAt: string;
    finishedAt: string | null;
    steps: Array<{ id: string }>;
  }> | null;
  executionsPending: boolean;
  triggerEndpoint: string;
}>();

const emit = defineEmits<{
  delete: [workflowId: string];
}>();

function badgeColor(status: string): "success" | "error" | "warning" | "info" | "neutral" {
  switch (status) {
    case "SUCCESS":
      return "success";
    case "FAIL":
      return "error";
    case "PAUSED":
      return "warning";
    case "RUNNING":
      return "info";
    default:
      return "neutral";
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatDuration(value: number) {
  if (!value || value <= 0) {
    return "-";
  }
  if (value < 1000) {
    return `${value} ms`;
  }
  const seconds = Math.round(value / 100) / 10;
  return `${seconds} s`;
}

function durationMs(execution: {
  startedAt: string;
  finishedAt: string | null;
}) {
  if (!execution.finishedAt) {
    return 0;
  }
  return (
    new Date(execution.finishedAt).getTime() -
    new Date(execution.startedAt).getTime()
  );
}
</script>
