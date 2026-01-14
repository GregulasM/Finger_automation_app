<template>
  <div class="fixed inset-0 bg-zinc-950 overflow-hidden flex flex-col pt-10 4xs:pt-10 3xs:pt-11 2xs:pt-12 xs:pt-14 sm:pt-12 lg:pt-16 xl:pt-18 2xl:pt-20 3xl:pt-24 4xl:pt-28 5xl:pt-32">
    <!-- Mobile: List View -->
    <div
      v-if="mobileView === 'list'"
      class="lg:hidden flex-1 overflow-y-auto flex flex-col px-2 4xs:px-3 3xs:px-4 xs:px-6 py-4 4xs:py-6 3xs:py-8"
    >
      <div class="flex flex-col gap-3 4xs:gap-4 mb-4 4xs:mb-6">
        <div class="flex flex-col gap-2">
          <h1
            class="text-[7px] 4xs:text-[8px] 3xs:text-[9px] 2xs:text-[10px] xs:text-[11px] sm:text-sm md:text-md lg:text-md 2xl:text-lg 3xl:text-lg/6 4xl:text-2xl/8 5xl:text-3xl/10 font-bold text-zinc-100"
          >
            Workflows
          </h1>
          <p
            class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/70"
          >
            Track activity, performance, and recent executions.
          </p>
        </div>
        <NuxtLink
          to="/workflows/editor"
          class="self-start rounded-md border border-orange-500 bg-orange-500 px-3 4xs:px-4 3xs:px-5 xs:px-6 py-2 4xs:py-2.5 3xs:py-3 text-zinc-950 transition hover:brightness-110"
        >
          <span
            class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold"
          >
            {{ t("workflows.newWorkflow") }}
          </span>
        </NuxtLink>
      </div>

      <div
        class="rounded-xl 4xs:rounded-2xl border border-orange-500/30 bg-zinc-800/90 p-3 4xs:p-4"
      >
        <div
          class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold uppercase tracking-wider text-zinc-100/60"
        >
          {{ t("workflows.workflowList") }}
        </div>
        <div class="mt-3 4xs:mt-4 space-y-2">
          <div
            v-if="workflowsPending"
            class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/70"
          >
            {{ t("workflows.loadingWorkflows") }}
          </div>
          <div
            v-else-if="workflowError"
            class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-red-400"
          >
            {{ workflowError }}
          </div>
          <button
            v-for="workflow in workflows"
            :key="workflow.id"
            type="button"
            class="flex w-full flex-col gap-1 rounded-lg border px-2 4xs:px-3 py-2 text-left transition border-orange-500/25 bg-zinc-800/50 text-zinc-100/90 hover:border-orange-500/70 hover:bg-zinc-800/80"
            @click="handleWorkflowClick(workflow.id)"
          >
            <span
              class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold"
            >
              {{ workflow.name }}
            </span>
            <span
              class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/70"
            >
              {{ workflow.triggerType }} • {{ workflow.status }}
            </span>
            <span
              class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/50"
            >
              {{ t("workflows.updated") }} {{ formatDate(workflow.updatedAt) }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile: Detail View -->
    <div
      v-else-if="mobileView === 'detail'"
      class="lg:hidden flex-1 overflow-y-auto flex flex-col px-2 4xs:px-3 3xs:px-4 xs:px-6 py-4 4xs:py-6 3xs:py-8"
    >
      <button
        type="button"
        @click="mobileView = 'list'"
        class="self-start mb-4 4xs:mb-6 rounded-md border border-orange-500/30 bg-zinc-800/90 px-3 4xs:px-4 py-2 4xs:py-2.5 text-zinc-100 transition hover:border-orange-500/70 hover:bg-zinc-800"
      >
        <span
          class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold"
        >
          {{ t("common.back") }}
        </span>
      </button>
      <WorkflowDetailView
        :workflow="selectedWorkflow ?? null"
        :stats="stats ?? null"
        :stats-pending="statsPending"
        :executions="executions ?? null"
        :executions-pending="executionsPending"
        :trigger-endpoint="triggerEndpoint"
        @delete="handleDelete"
      />
    </div>

    <!-- Desktop: Split View -->
    <div
      class="hidden lg:flex flex-1 overflow-hidden flex-col px-2 4xs:px-3 3xs:px-4 xs:px-6 py-4 4xs:py-6 3xs:py-8"
    >
      <div class="flex flex-col gap-3 4xs:gap-4 mb-4 4xs:mb-6">
        <div class="flex flex-col gap-2">
          <h1
            class="text-[7px] 4xs:text-[8px] 3xs:text-[9px] 2xs:text-[10px] xs:text-[11px] sm:text-sm md:text-md lg:text-md 2xl:text-lg 3xl:text-lg/6 4xl:text-2xl/8 5xl:text-3xl/10 font-bold text-zinc-100"
          >
            Workflows
          </h1>
          <p
            class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/70"
          >
            Track activity, performance, and recent executions.
          </p>
        </div>
        <NuxtLink
          to="/workflows/editor"
          class="self-start rounded-md border border-orange-500 bg-orange-500 px-3 4xs:px-4 3xs:px-5 xs:px-6 py-2 4xs:py-2.5 3xs:py-3 text-zinc-950 transition hover:brightness-110"
        >
          <span
            class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold"
          >
            {{ t("workflows.newWorkflow") }}
          </span>
        </NuxtLink>
      </div>

      <div class="flex-1 overflow-hidden grid gap-4 4xs:gap-6 lg:grid-cols-[280px_1fr]">
        <div
          class="rounded-xl 4xs:rounded-2xl border border-orange-500/30 bg-zinc-800/90 p-3 4xs:p-4 overflow-y-auto"
        >
          <div
          class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold uppercase tracking-wider text-zinc-100/60"
        >
          {{ t("workflows.workflowList") }}
        </div>
        <div class="mt-3 4xs:mt-4 space-y-2">
          <div
            v-if="workflowsPending"
            class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/70"
          >
            {{ t("workflows.loadingWorkflows") }}
          </div>
            <div
              v-else-if="workflowError"
              class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-red-400"
            >
              {{ workflowError }}
            </div>
            <button
              v-for="workflow in workflows"
              :key="workflow.id"
              type="button"
              class="flex w-full flex-col gap-1 rounded-lg border px-2 4xs:px-3 py-2 text-left transition"
              :class="
                workflow.id === selectedWorkflowId
                  ? 'border-orange-500/80 bg-zinc-800 text-zinc-100'
                  : 'border-orange-500/25 bg-zinc-800/50 text-zinc-100/90 hover:border-orange-500/70 hover:bg-zinc-800/80'
              "
              @click="selectedWorkflowId = workflow.id"
            >
              <span
                class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold"
              >
                {{ workflow.name }}
              </span>
              <span
                class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/70"
              >
                {{ workflow.triggerType }} • {{ workflow.status }}
              </span>
              <span
                class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/50"
              >
                {{ t("workflows.updated") }} {{ formatDate(workflow.updatedAt) }}
              </span>
            </button>
          </div>
        </div>

        <div class="overflow-y-auto space-y-4 4xs:space-y-6">
          <WorkflowDetailView
            :workflow="selectedWorkflow ?? null"
            :stats="stats ?? null"
            :stats-pending="statsPending"
            :executions="executions ?? null"
            :executions-pending="executionsPending"
            :trigger-endpoint="triggerEndpoint"
            @delete="handleDelete"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed, ref, watch } from "vue";

const { t } = useI18n();

type WorkflowListItem = {
  id: string;
  name: string;
  status: string;
  triggerType: string;
  createdAt: string;
  updatedAt: string;
  lastRun: string | null;
  lastStatus: string | null;
};

type WorkflowStats = {
  total: number;
  successRate: number;
  avgDurationMs: number;
  lastRunAt: string | null;
  lastStatus: string | null;
};

type WorkflowDetail = {
  id: string;
  name: string;
  status: string;
  triggerType: string;
  createdAt: string;
  updatedAt: string;
};

type ExecutionRecord = {
  id: string;
  status: string;
  startedAt: string;
  finishedAt: string | null;
  steps: Array<{ id: string }>;
};

const runtimeConfig = useRuntimeConfig();
const appUrl = runtimeConfig.public?.appUrl ?? "";
const selectedWorkflowId = ref<string | null>(null);
const mobileView = ref<"list" | "detail">("list");
const auth = useAuthStore();
const { loggedIn } = storeToRefs(auth);

const {
  data: workflowsData,
  pending: workflowsPending,
  error: workflowsError,
  refresh: refreshWorkflows,
} = await useFetch<WorkflowListItem[]>("/api/workflows", {
  credentials: "include",
  immediate: loggedIn.value,
  watch: [loggedIn],
});

const workflows = computed(() => workflowsData.value ?? []);
const workflowError = computed(() => workflowsError.value?.message ?? "");

watch(
  workflows,
  (items) => {
    if (!selectedWorkflowId.value && items.length > 0 && items[0]) {
      selectedWorkflowId.value = items[0].id;
    }
  },
  { immediate: true },
);

const { data: selectedWorkflow } = await useAsyncData<WorkflowDetail | null>(
  "workflow-detail",
  async () => {
    if (!selectedWorkflowId.value || !loggedIn.value) {
      return null;
    }
    return await $fetch(`/api/workflows/${selectedWorkflowId.value}`, {
      credentials: "include",
    });
  },
  { watch: [selectedWorkflowId, loggedIn] },
);

const triggerEndpoint = computed(() => {
  if (!selectedWorkflow.value) {
    return "";
  }
  if (selectedWorkflow.value.triggerType === "WEBHOOK") {
    return `${appUrl}/api/hooks/${selectedWorkflow.value.id}`;
  }
  if (selectedWorkflow.value.triggerType === "EMAIL") {
    return `${appUrl}/api/email/inbound/${selectedWorkflow.value.id}`;
  }
  return "";
});

const { data: stats, pending: statsPending } =
  await useAsyncData<WorkflowStats | null>(
    "workflow-stats",
    async () => {
      if (!selectedWorkflowId.value || !loggedIn.value) {
        return null;
      }
      return await $fetch(`/api/workflows/${selectedWorkflowId.value}/stats`, {
        credentials: "include",
      });
    },
    { watch: [selectedWorkflowId, loggedIn] },
  );

const { data: executions, pending: executionsPending } = await useAsyncData<
  ExecutionRecord[]
>(
  "workflow-executions",
  async () => {
    if (!selectedWorkflowId.value || !loggedIn.value) {
      return [];
    }
    return await $fetch(
      `/api/workflows/${selectedWorkflowId.value}/executions`,
      {
        credentials: "include",
        query: { limit: 10 },
      },
    );
  },
  { watch: [selectedWorkflowId, loggedIn] },
);

function handleWorkflowClick(workflowId: string) {
  selectedWorkflowId.value = workflowId;
  // Check if mobile using window width (more reliable than ref on first render)
  if (process.client && window.innerWidth < 1024) {
    mobileView.value = "detail";
  }
}

async function handleDelete(workflowId: string) {
  if (!confirm(t("workflows.deleteConfirm"))) {
    return;
  }

  try {
    await $fetch(`/api/workflows/${workflowId}`, {
      method: "DELETE",
      credentials: "include",
    });
    
    await refreshWorkflows();
    
    if (workflows.value.length > 0 && workflows.value[0]) {
      selectedWorkflowId.value = workflows.value[0].id;
    } else {
      selectedWorkflowId.value = null;
    }
    
    // Check if mobile using window width
    if (process.client && window.innerWidth < 1024) {
      mobileView.value = "list";
    }
  } catch (error) {
    console.error("Failed to delete workflow:", error);
    alert(t("workflows.deleteFailed"));
  }
}

function badgeColor(status: string) {
  switch (status) {
    case "SUCCESS":
      return "green";
    case "FAIL":
      return "red";
    case "PAUSED":
      return "amber";
    case "RUNNING":
      return "blue";
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

function durationMs(execution: ExecutionRecord) {
  if (!execution.finishedAt) {
    return 0;
  }
  return (
    new Date(execution.finishedAt).getTime() -
    new Date(execution.startedAt).getTime()
  );
}
</script>
