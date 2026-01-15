<script setup lang="ts">
import { useWorkflowEditorContext } from "./workflowEditorContext";

const { t } = useI18n();
const {
  blocksMenuOpen,
  blockDetailsExpanded,
  translatedPalette,
  selectedPaletteId,
  palette,
  getTranslatedRole,
  selectPalette,
  addNodeFromPalette,
  toast,
  isMobileViewport,
  translatedSelectedPalette,
  selectedPalette,
  onDragStart,
  onDragEnd,
} = useWorkflowEditorContext();

function handleAddNode(item: (typeof palette)[number] | undefined) {
  if (!item) {
    return;
  }
  addNodeFromPalette(item);
  if (isMobileViewport()) {
    toast.add({
      title: t("editor.addedToCanvas"),
      icon: "i-heroicons-check-circle",
      timeout: 2000,
    });
  }
}
</script>

<template>
  <aside
    :class="[
      'flex w-100 max-w-[100vw] flex-shrink-0 flex-col border-r border-orange-500/30 bg-zinc-800 p-2 4xs:p-3 lg:w-64',
      'fixed lg:static left-0 bottom-0 z-50 lg:z-auto',
      'top-10 4xs:top-10 3xs:top-11 2xs:top-12 xs:top-14 sm:top-16 md:top-20 lg:top-0 rounded-t-md',
      'transform transition-transform duration-300 ease-in-out',
      blocksMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
    ]"
  >
    <div class="relative flex h-full flex-col scale-[0.95] origin-top-left">
      <button
        type="button"
        @click="blocksMenuOpen = false"
        class="lg:hidden absolute top-2 right-2 rounded-md border border-orange-500/30 bg-zinc-800/90 px-2 py-2 text-zinc-100 hover:border-orange-500/70 hover:bg-zinc-800 transition"
        aria-label="Close blocks menu"
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
      <div
        class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold uppercase tracking-wider text-zinc-100/60"
      >
        {{ t("editor.blocks") }}
      </div>
      <div class="mt-3 4xs:mt-4 flex-1 overflow-y-auto space-y-2 pr-1">
        <div
          v-for="item in translatedPalette"
          :key="item.id"
          class="group flex w-full select-none flex-col gap-1 rounded-lg border px-2 4xs:px-2.5 3xs:px-3 py-1.5 4xs:py-2 text-left transition-colors cursor-grab active:cursor-grabbing hover:border-orange-500/50 hover:bg-zinc-700/50"
          :class="
            item.id === selectedPaletteId
              ? 'border-orange-500/80 bg-zinc-800 text-zinc-100'
              : 'border-orange-500/25 bg-zinc-800/50 text-zinc-100/90 hover:border-orange-500/70 hover:bg-zinc-800/80'
          "
          draggable="true"
          role="button"
          tabindex="0"
          @dragstart="
            onDragStart($event, palette.find((p) => p.id === item.id)!)
          "
          @dragend="onDragEnd"
          @click="selectPalette(palette.find((p) => p.id === item.id)!)"
          @dblclick="handleAddNode(palette.find((p) => p.id === item.id)!)"
          @keydown.enter.prevent="
            handleAddNode(palette.find((p) => p.id === item.id)!)
          "
          @keydown.space.prevent="
            handleAddNode(palette.find((p) => p.id === item.id)!)
          "
        >
          <div class="flex items-center justify-between gap-2 min-w-0">
            <span
              class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold truncate"
            >
              {{ item.label }}
            </span>
            <span
              class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 uppercase text-zinc-100/50 flex-shrink-0"
            >
              {{ getTranslatedRole(item.role) }}
            </span>
          </div>
          <span
            class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-normal text-zinc-100/70"
          >
            {{ item.summary }}
          </span>
        </div>
      </div>
      <div
        class="mt-4 4xs:mt-6 rounded-lg border border-orange-500/30 bg-zinc-800/50 p-2.5"
      >
        <button
          type="button"
          @click="blockDetailsExpanded = !blockDetailsExpanded"
          class="flex w-full items-center justify-between text-left"
        >
          <div
            class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold uppercase tracking-wider text-zinc-100/60"
          >
            {{ t("editor.blockDetails") }}
          </div>
          <svg
            class="h-3 w-3 4xs:h-4 4xs:w-4 text-zinc-100/60 transition-transform"
            :class="{ 'rotate-180': blockDetailsExpanded }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        <div
          v-show="blockDetailsExpanded"
          class="mt-2 max-h-[40vh] overflow-y-auto space-y-2"
        >
          <div v-if="translatedSelectedPalette" class="space-y-2">
            <div
              class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold text-zinc-100"
            >
              {{ translatedSelectedPalette.label }}
            </div>
            <p
              class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/70"
            >
              {{ translatedSelectedPalette.details }}
            </p>
            <div
              v-if="translatedSelectedPalette.tips?.length"
              class="space-y-1 text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/70"
            >
              <div v-for="tip in translatedSelectedPalette.tips" :key="tip">
                - {{ tip }}
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <button
                type="button"
                class="rounded-md border border-orange-500/30 bg-zinc-800/90 px-2 4xs:px-2.5 py-1 4xs:py-1.5 text-zinc-100 transition hover:border-orange-500/70 hover:bg-zinc-800"
                @click="handleAddNode(selectedPalette!)"
              >
                <span
                  class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold"
                >
                  {{ t("editor.addToCanvas") }}
                </span>
              </button>
              <span
                class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/50"
              >
                {{ t("editor.tipDrag") }}
              </span>
            </div>
          </div>
          <div
            v-else
            class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/70"
          >
            {{ t("editor.clickBlock") }}
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>
