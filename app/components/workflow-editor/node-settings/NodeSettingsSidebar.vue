<script setup lang="ts">
import { useWorkflowEditorContext } from "../workflowEditorContext";
import NodeSettingsAbout from "./NodeSettingsAbout.vue";
import NodeSettingsTriggerPanel from "./NodeSettingsTriggerPanel.vue";
import NodeSettingsActionPanel from "./NodeSettingsActionPanel.vue";

const { t } = useI18n();
const {
  nodeSettingsMenuOpen,
  selectedLabel,
  selectedNode,
  selectedNodeId,
  selectedRole,
  removeSelectedNode,
} = useWorkflowEditorContext();
</script>

<template>
  <aside
    :class="[
      'flex w-100 flex-shrink-0 flex-col border-l border-orange-500/30 bg-zinc-800 max-w-[100vw] min-w-0',
      'fixed lg:static right-0 bottom-0 z-50 lg:z-auto',
      'top-10 4xs:top-10 3xs:top-11 2xs:top-12 xs:top-14 sm:top-16 md:top-20 lg:top-0 rounded-t-md',
      'transform transition-transform duration-300 ease-in-out ',
      nodeSettingsMenuOpen
        ? 'translate-x-0'
        : 'translate-x-full lg:translate-x-0',
    ]"
  >
    <div class="relative flex h-full flex-col scale-[0.95] origin-top-right">
      <div
        class="flex-shrink-0 border-b border-orange-500/30 px-1 4xs:pl-6 4xs:pr-2 py-1 4xs:py-1"
      >
        <div class="flex items-start justify-between gap-1 min-w-0">
          <div class="min-w-0 flex-1">
            <div
              class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold uppercase tracking-wider text-zinc-100/60"
            >
              {{ t("editor.nodeSettings") }}
            </div>
            <div
              class="mt-1 truncate text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold text-zinc-100"
            >
              {{ selectedLabel }}
            </div>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <button
              v-if="selectedNode"
              type="button"
              class="inline-flex items-center justify-center rounded-md border border-red-500/30 bg-red-500/20 px-2 4xs:px-2.5 py-1 4xs:py-1.5 text-red-400 transition hover:border-red-500/70 hover:bg-red-500/30"
              @click="removeSelectedNode"
            >
              <span
                class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold text-center"
              >
                {{ t("editor.delete") }}
              </span>
            </button>
            <button
              type="button"
              @click="nodeSettingsMenuOpen = false"
              class="lg:hidden flex-shrink-0 rounded-md border border-orange-500/30 bg-zinc-800/90 px-2 py-1 text-zinc-100 hover:border-orange-500/70 hover:bg-zinc-800 transition"
              aria-label="Close node settings menu"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div
        class="flex-1 min-h-0 space-y-4 overflow-y-auto px-3 4xs:px-5 py-2.5 4xs:py-3"
      >
        <div
          v-if="!selectedNode"
          class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/70"
        >
          {{ t("editor.selectNode") }}
        </div>

        <template v-else>
          <div class="space-y-6" :key="selectedNodeId || 'empty'">
            <NodeSettingsAbout />
            <NodeSettingsTriggerPanel v-if="selectedRole === 'trigger'" />
            <NodeSettingsActionPanel v-else-if="selectedRole === 'action'" />
          </div>
        </template>
      </div>
    </div>
  </aside>
</template>
