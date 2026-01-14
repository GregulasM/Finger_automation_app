<template>
  <div class="fixed inset-0 bg-zinc-950 overflow-y-auto flex flex-col pt-10 4xs:pt-10 3xs:pt-11 2xs:pt-12 xs:pt-14 sm:pt-12 lg:pt-16 xl:pt-18 2xl:pt-20 3xl:pt-24 4xl:pt-28 5xl:pt-32">
    <div class="flex-1 overflow-y-auto flex flex-col px-2 4xs:px-3 3xs:px-4 xs:px-6 py-4 4xs:py-6 3xs:py-8">
      <div class="mb-3 4xs:mb-4 flex-shrink-0">
        <h1
          class="text-[7px] 4xs:text-[8px] 3xs:text-[9px] 2xs:text-[10px] xs:text-[11px] sm:text-sm md:text-md lg:text-md 2xl:text-lg 3xl:text-lg/6 4xl:text-2xl/8 5xl:text-3xl/10 font-bold text-zinc-100"
        >
          {{ t("editor.title") }}
        </h1>
        <p
          class="mt-1 text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/70"
        >
          {{ t("editor.description") }}
        </p>
      </div>
      <div class="flex-1 overflow-hidden min-h-0">
        <WorkflowEditor :workflow-id="workflowId" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const { t } = useI18n();
const route = useRoute();
const workflowId = computed(() =>
  typeof route.query.workflowId === "string" ? route.query.workflowId : null,
);
</script>
