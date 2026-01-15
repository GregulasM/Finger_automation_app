<script setup lang="ts">
import { useWorkflowEditorContext } from "./workflowEditorContext";
import WorkflowBlocksSidebar from "./WorkflowBlocksSidebar.vue";
import WorkflowEditorCanvas from "./WorkflowEditorCanvas.vue";
import NodeSettingsSidebar from "./node-settings/NodeSettingsSidebar.vue";

const { t } = useI18n();
const {
  loadingWorkflow,
  blocksMenuOpen,
  nodeSettingsMenuOpen,
  editorPanelOpen,
  mobileHintDismissed,
  multiSelectHintDismissed,
} = useWorkflowEditorContext();
</script>

<template>
  <div
    class="flex flex-row flex-1 min-h-0 w-full overflow-hidden rounded-lg border border-orange-500/30 bg-zinc-800/50 relative"
  >
    <div
      v-if="loadingWorkflow"
      class="absolute inset-0 z-50 flex flex-col gap-3 4xs:gap-4 bg-zinc-900/80 backdrop-blur-sm p-3 4xs:p-4 cursor-wait"
    >
      <div
        class="flex items-center gap-2 text-[10px] xs:text-[11px] sm:text-xs text-zinc-100/70"
      >
        <UIcon
          name="i-heroicons-arrow-path-20-solid"
          class="h-4 w-4 animate-spin"
        />
        {{ t("common.loading") }}
      </div>
      <div
        class="relative h-[3px] w-full overflow-hidden rounded-full bg-zinc-700/60 after:absolute after:left-0 after:top-0 after:bottom-0 after:w-[45%] after:rounded-full after:content-[''] after:bg-gradient-to-r after:from-transparent after:via-orange-500/80 after:to-transparent after:animate-[loading-bar-slide_1.2s_ease-in-out_infinite]"
      ></div>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="n in 3"
          :key="`editor-skeleton-${n}`"
          class="animate-pulse rounded-lg border border-orange-500/20 bg-zinc-800/60 px-3 py-4"
        >
          <div class="h-2 w-1/2 rounded bg-zinc-700/60"></div>
          <div class="mt-2 h-2 w-3/5 rounded bg-zinc-700/50"></div>
          <div class="mt-3 h-2 w-2/5 rounded bg-zinc-700/40"></div>
        </div>
      </div>
      <div
        class="flex-1 animate-pulse rounded-lg border border-orange-500/20 bg-zinc-800/40"
      ></div>
    </div>

    <button
      v-if="!blocksMenuOpen"
      type="button"
      @click="
        blocksMenuOpen = true;
        nodeSettingsMenuOpen = false;
      "
      class="lg:hidden fixed left-2 top-16 z-60 rounded-md border border-orange-500/30 bg-zinc-800/90 px-2 py-2 text-zinc-100 hover:border-orange-500/70 hover:bg-zinc-800 transition"
      aria-label="Open blocks menu"
    >
      <svg
        class="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>

    <button
      v-if="!nodeSettingsMenuOpen"
      type="button"
      @click="
        nodeSettingsMenuOpen = true;
        blocksMenuOpen = false;
      "
      class="lg:hidden fixed right-2 top-16 z-60 rounded-md border border-orange-500/30 bg-zinc-800/90 px-2 py-2 text-zinc-100 hover:border-orange-500/70 hover:bg-zinc-800 transition"
      aria-label="Open node settings menu"
    >
      <svg
        class="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
        />
      </svg>
    </button>

    <button
      type="button"
      class="lg:hidden fixed right-2 top-32 z-60 rounded-md border border-orange-500/30 bg-zinc-800/90 px-2 py-2 text-zinc-100 hover:border-orange-500/70 hover:bg-zinc-800 transition"
      :aria-expanded="editorPanelOpen ? 'true' : 'false'"
      :title="t('editor.save')"
      aria-label="Toggle editor panel"
      @click="
        editorPanelOpen = !editorPanelOpen;
        if (editorPanelOpen) {
          blocksMenuOpen = false;
          nodeSettingsMenuOpen = false;
        }
      "
    >
      <UIcon name="mingcute:save-2-line" class="h-4 w-4" />
    </button>

    <div
      v-if="!mobileHintDismissed"
      class="lg:hidden fixed left-0 right-0 bottom-4 mx-10 z-50 flex items-center gap-2 rounded-lg border border-orange-500/30 bg-zinc-900/95 px-3 pt-2 pb-4 text-zinc-100 text-[10px] xs:text-[11px] sm:text-xs shadow-lg"
    >
      <span class="flex-1">{{ t("editor.mobileHint") }}</span>
      <button
        @click="mobileHintDismissed = true"
        class="flex-shrink-0 rounded p-1 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100 transition-colors"
        :aria-label="t('common.close')"
      >
        <UIcon name="i-lucide-x" class="w-4 h-4" />
      </button>
    </div>

    <div
      v-if="!multiSelectHintDismissed"
      class="hidden lg:flex fixed left-1/2 -translate-x-1/2 top-28 z-50 items-center gap-2 rounded-lg border border-cyan-500/30 bg-zinc-900/95 px-3 py-2 text-zinc-100 text-[10px] xs:text-[11px] sm:text-xs shadow-lg"
    >
      <svg
        class="w-4 h-4 text-cyan-400 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span class="flex-1">{{ t("editor.multiSelectHint") }}</span>
      <button
        @click="multiSelectHintDismissed = true"
        class="flex-shrink-0 rounded p-1 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100 transition-colors"
        :aria-label="t('common.close')"
      >
        <UIcon name="i-lucide-x" class="w-4 h-4" />
      </button>
    </div>

    <div
      v-if="blocksMenuOpen || nodeSettingsMenuOpen"
      class="lg:hidden fixed inset-0 bg-zinc-950/70 z-40"
      @click="
        blocksMenuOpen = false;
        nodeSettingsMenuOpen = false;
      "
    ></div>

    <WorkflowBlocksSidebar />
    <WorkflowEditorCanvas />
    <NodeSettingsSidebar />
  </div>
</template>
