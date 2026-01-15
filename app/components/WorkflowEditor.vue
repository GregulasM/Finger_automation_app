<template>
  <div class="h-full flex flex-col space-y-1 4xs:space-y-2">
    <div
      class="flex flex-col lg:flex-row flex-wrap items-stretch lg:items-center justify-between gap-2 rounded-lg border border-orange-500/30 bg-zinc-800/90 px-2 4xs:px-3 py-2"
    >
      <div class="flex flex-1 min-w-0 flex-col 2xs:flex-row flex-wrap items-start 2xs:items-center gap-3">
        <UInput
          v-model="workflowName"
          :placeholder="t('editor.workflowName')"
          class="w-full 2xs:w-auto min-w-[240px] lg:min-w-[320px] flex-1"
          :ui="titleInputStyles"
        />
        <div
          class="flex items-center gap-2 text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/70"
        >
          <USwitch v-model="workflowActive" :ui="{ root: 'ring-0' }" />
          <span>{{ t("editor.active") }}</span>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-2 justify-end mt-2 sm:mt-0 w-full lg:w-auto">
        <UBadge color="neutral" variant="soft" :ui="{ root: 'ring-0', base: 'bg-zinc-800 border-orange-500/30 text-zinc-100' }">
          {{ t("editor.trigger") }}: {{ triggerLabel }}
        </UBadge>
        
        <!-- Templates dropdown -->
        <UDropdownMenu
          :items="templateItems"
          :content="{ align: 'end' }"
          :ui="{ 
            content: 'min-w-[220px] bg-zinc-800 border border-orange-500/30 p-1',
            item: 'text-zinc-100 hover:bg-zinc-700 data-highlighted:bg-zinc-700 rounded px-3 py-2 cursor-pointer',
            itemLeadingIcon: 'text-zinc-400',
            label: 'text-zinc-100 font-medium'
          }"
        >
          <button
            type="button"
            class="rounded-md border border-orange-500/30 bg-zinc-800/90 px-3 4xs:px-4 py-2 4xs:py-2.5 text-zinc-100 transition hover:border-orange-500/70 hover:bg-zinc-800 flex items-center gap-1"
          >
            <svg class="w-3 h-3 4xs:w-4 4xs:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            <span
              class="hidden xs:inline text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold"
            >
              {{ t("editor.templates") }}
            </span>
          </button>
        </UDropdownMenu>
        
        <button
          type="button"
          :disabled="saving || loadingWorkflow"
          class="rounded-md border border-orange-500 bg-orange-500 px-3 4xs:px-4 py-2 4xs:py-2.5 text-zinc-950 transition hover:brightness-110 disabled:opacity-50"
          @click="saveWorkflow"
        >
          <span
            class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold"
          >
            <span v-if="saving || loadingWorkflow">{{ t("editor.saving") }}</span>
            <span v-else>{{ t("editor.save") }}</span>
          </span>
        </button>
      </div>
    </div>

    <UAlert
      v-if="saveError"
      color="error"
      variant="soft"
      :title="t('editor.saveFailed')"
      :description="saveError"
      :ui="{ root: 'ring-0 py-1 text-xs' }"
    />
    <UAlert
      v-if="loadError"
      color="error"
      variant="soft"
      :title="t('editor.loadFailed')"
      :description="loadError"
      :ui="{ root: 'ring-0 py-1 text-xs' }"
    />

    <div
      class="flex flex-row flex-1 min-h-0 w-full overflow-hidden rounded-lg border border-orange-500/30 bg-zinc-800/50 relative"
    >
      <!-- Mobile menu buttons with helper text -->
      <button
        v-if="!blocksMenuOpen"
        type="button"
        @click="blocksMenuOpen = true"
        class="lg:hidden fixed left-2 top-16 z-60 rounded-md border border-orange-500/30 bg-zinc-800/90 px-2 py-2 text-zinc-100 hover:border-orange-500/70 hover:bg-zinc-800 transition"
        aria-label="Open blocks menu"
      >
        <svg
          class="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <button
        v-if="!nodeSettingsMenuOpen"
        type="button"
        @click="nodeSettingsMenuOpen = true"
        class="lg:hidden fixed right-2 top-16 z-60 rounded-md border border-orange-500/30 bg-zinc-800/90 px-2 py-2 text-zinc-100 hover:border-orange-500/70 hover:bg-zinc-800 transition"
        aria-label="Open node settings menu"
      >
        <svg
          class="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      </button>

      <!-- Mobile helper hint (dismissible) -->
      <div
        v-if="!mobileHintDismissed"
        class="lg:hidden fixed left-2 right-2 top-28 z-50 flex items-center gap-2 rounded-lg border border-orange-500/30 bg-zinc-900/95 px-3 py-2 text-zinc-100 text-[10px] xs:text-[11px] sm:text-xs shadow-lg"
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

      <!-- Desktop multi-select hint (dismissible) -->
      <div
        v-if="!multiSelectHintDismissed"
        class="hidden lg:flex fixed left-1/2 -translate-x-1/2 top-28 z-50 items-center gap-2 rounded-lg border border-cyan-500/30 bg-zinc-900/95 px-3 py-2 text-zinc-100 text-[10px] xs:text-[11px] sm:text-xs shadow-lg"
      >
        <svg class="w-4 h-4 text-cyan-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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

      <!-- Overlay for mobile -->
      <div
        v-if="blocksMenuOpen || nodeSettingsMenuOpen"
        class="lg:hidden fixed inset-0 bg-zinc-950/70 z-40"
        @click="blocksMenuOpen = false; nodeSettingsMenuOpen = false"
      ></div>

      <!-- Blocks sidebar -->
      <aside
        :class="[
          'flex w-64 flex-shrink-0 flex-col border-r border-orange-500/30 bg-zinc-800 p-3 4xs:p-4',
          'fixed lg:static left-0 bottom-0 z-50 lg:z-auto',
          'top-10 4xs:top-10 3xs:top-11 2xs:top-12 xs:top-14 sm:top-16 md:top-20 lg:top-0 rounded-t-md',
          'transform transition-transform duration-300 ease-in-out',
          blocksMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        ]"
      >
        <!-- Close button for mobile -->
        <button
          type="button"
          @click="blocksMenuOpen = false"
          class="lg:hidden absolute top-2 right-2 rounded-md border border-orange-500/30 bg-zinc-800/90 px-2 py-1 text-zinc-100 hover:border-orange-500/70 hover:bg-zinc-800 transition"
          aria-label="Close blocks menu"
        >
          <svg
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
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
            class="group flex w-full select-none flex-col gap-1 rounded-lg border px-2 4xs:px-3 py-2 text-left transition-colors cursor-grab active:cursor-grabbing hover:border-orange-500/50 hover:bg-zinc-700/50"
            :class="
              item.id === selectedPaletteId
                ? 'border-orange-500/80 bg-zinc-800 text-zinc-100'
                : 'border-orange-500/25 bg-zinc-800/50 text-zinc-100/90 hover:border-orange-500/70 hover:bg-zinc-800/80'
            "
            draggable="true"
            role="button"
            tabindex="0"
            @dragstart="onDragStart($event, palette.find(p => p.id === item.id)!)"
            @dragend="onDragEnd"
            @click="selectPalette(palette.find(p => p.id === item.id)!)"
            @dblclick="addNodeFromPalette(palette.find(p => p.id === item.id)!)"
            @keydown.enter.prevent="addNodeFromPalette(palette.find(p => p.id === item.id)!)"
            @keydown.space.prevent="addNodeFromPalette(palette.find(p => p.id === item.id)!)"
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
        <div class="mt-4 4xs:mt-6 rounded-lg border border-orange-500/30 bg-zinc-800/50 p-3">
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
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
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
                  class="rounded-md border border-orange-500/30 bg-zinc-800/90 px-2 4xs:px-3 py-1.5 4xs:py-2 text-zinc-100 transition hover:border-orange-500/70 hover:bg-zinc-800"
                  @click="addNodeFromPalette(selectedPalette!)"
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
      </aside>

      <div
        ref="flowWrapper"
        class="relative flex-1 min-h-0 z-10"
        @drop="onDrop"
        @dragover="onDragOver"
      >
        <ClientOnly>
          <VueFlow
            :id="flowId"
            v-model:nodes="nodes"
            v-model:edges="edges"
            class="h-full w-full workflow-canvas"
            :fit-view-on-init="true"
            :min-zoom="0.1"
            :max-zoom="2"
            :snap-to-grid="false"
            :only-render-visible-elements="true"
            :edges-updatable="true"
            :default-edge-options="{ deletable: true, selectable: true }"
            @connect="onConnect"
            @node-click="onNodeClick"
            @edge-click="onEdgeClick"
            @pane-click="clearSelection"
          >
            <!-- Custom node template with labeled handles -->
            <template #node-default="{ data, sourcePosition, targetPosition }">
              <div class="custom-node">
                <!-- Input handle (target) -->
                <Handle
                  type="target"
                  :position="targetPosition || Position.Left"
                  class="handle-input"
                />
                <!-- Node label -->
                <div class="node-label">{{ data.label }}</div>
                <!-- Output handle (source) -->
                <Handle
                  type="source"
                  :position="sourcePosition || Position.Right"
                  class="handle-output"
                />
              </div>
            </template>

            <!-- Custom edge with delete button on hover -->
            <template #edge-default="{ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd, selected }">
              <BaseEdge
                :id="id"
                :path="getSmoothStepPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition })[0]"
                :marker-end="markerEnd"
                :class="['custom-edge', { 'edge-selected': selected || selectedEdgeId === id }]"
              />
              <!-- Delete button on edge -->
              <EdgeLabelRenderer>
                <div
                  :style="{
                    position: 'absolute',
                    transform: `translate(-50%, -50%) translate(${(sourceX + targetX) / 2}px, ${(sourceY + targetY) / 2}px)`,
                    pointerEvents: 'all',
                  }"
                  class="edge-delete-button"
                  :class="{ 'visible': selected || selectedEdgeId === id }"
                  @click.stop="removeEdgeById(id)"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </EdgeLabelRenderer>
            </template>
          </VueFlow>
        </ClientOnly>
      </div>

      <!-- Node settings sidebar -->
      <aside
        :class="[
          'flex w-80 flex-shrink-0 flex-col border-l border-orange-500/30 bg-zinc-800 max-w-[30vw] min-w-0',
          'fixed lg:static right-0 bottom-0 z-50 lg:z-auto',
          'top-10 4xs:top-10 3xs:top-11 2xs:top-12 xs:top-14 sm:top-12 lg:top-0',
          'transform transition-transform duration-300 ease-in-out',
          nodeSettingsMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        ]"
      >
        <div class="flex-shrink-0 border-b border-orange-500/30 px-4 4xs:px-6 py-3 4xs:py-4">
          <div class="flex items-start justify-between gap-3 min-w-0">
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
            <!-- Close button for mobile -->
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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="flex items-start justify-between gap-3 min-w-0 mt-2">
            <button
              v-if="selectedNode"
              type="button"
              class="flex-shrink-0 rounded-md border border-red-500/30 bg-red-500/20 px-2 4xs:px-3 py-1.5 4xs:py-2 text-red-400 transition hover:border-red-500/70 hover:bg-red-500/30"
              @click="removeSelectedNode"
            >
              <span
                class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold"
              >
                {{ t("editor.delete") }}
              </span>
            </button>
          </div>
        </div>
        <div class="flex-1 min-h-0 space-y-4 overflow-y-auto px-4 4xs:px-6 py-3 4xs:py-4">
          <div
            v-if="!selectedNode"
            class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/70"
          >
            {{ t("editor.selectNode") }}
          </div>

          <template v-else>
            <div class="space-y-6" :key="selectedNodeId || 'empty'">
              <div
                class="rounded-lg border border-orange-500/30 bg-zinc-800/50 p-3"
              >
                <div
                  class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold uppercase tracking-wider text-zinc-100/60"
                >
                  {{ t("editor.aboutBlock") }}
                </div>
                <div
                  class="mt-1 text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold text-zinc-100"
                >
                  {{ translatedSelectedHelp?.label || selectedLabel }}
                </div>
                <p
                  class="mt-1 text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/70"
                >
                  {{
                    translatedSelectedHelp?.details ||
                    t("editor.configureBlock")
                  }}
                </p>
                <div
                  v-if="translatedSelectedHelp?.tips?.length"
                  class="mt-2 space-y-1 text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/70"
                >
                  <div v-for="tip in translatedSelectedHelp.tips" :key="tip">
                    - {{ tip }}
                  </div>
                </div>
              </div>

              <div v-if="selectedRole === 'trigger'" class="space-y-4">
                <!-- Webhook Trigger -->
                <div v-if="selectedType === 'Webhook'" class="space-y-4">
                  <!-- How it works -->
                  <div class="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3">
                    <div class="flex items-start gap-2">
                      <svg class="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <div class="text-zinc-400 text-[9px] xs:text-[10px] sm:text-[11px]">
                        <div class="font-semibold text-cyan-400 mb-1">{{ t('editor.webhook.howItWorks') }}</div>
                        {{ t('editor.webhook.description') }}
                      </div>
                    </div>
                  </div>

                  <!-- Webhook URL -->
                  <UFormField :label="t('editor.webhookUrl')" :ui="formFieldStyles">
                    <div class="flex gap-2">
                      <UInput
                        :model-value="webhookEndpoint"
                        :placeholder="t('editor.saveToGenerateWebhook')"
                        readonly
                        :ui="inputStyles"
                        class="flex-1"
                      />
                      <button
                        v-if="webhookEndpoint"
                        type="button"
                        class="px-3 py-2 rounded-md border border-orange-500/50 bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition text-[9px] xs:text-[10px] font-semibold"
                        @click="copyToClipboard(webhookEndpoint)"
                      >
                        {{ clipboardCopied === 'webhook' ? '✓' : t('editor.webhook.copy') }}
                      </button>
                    </div>
                    <template #hint>
                      <span class="text-zinc-400 text-[9px] xs:text-[10px] sm:text-[11px]">
                        {{ t('editor.webhook.urlHint') }}
                      </span>
                    </template>
                  </UFormField>

                  <!-- Generate button if no ID -->
                  <div v-if="!workflowId" class="flex items-center gap-3">
                    <button
                      type="button"
                      :disabled="saving"
                      class="rounded-md border border-orange-500 bg-orange-500 px-4 py-2 text-zinc-950 transition hover:brightness-110 disabled:opacity-50"
                      @click="saveWorkflow"
                    >
                      <span class="text-[9px] xs:text-[10px] sm:text-[11px] font-semibold">
                        {{ saving ? t('editor.saving') : t('editor.webhook.generate') }}
                      </span>
                    </button>
                    <span class="text-zinc-400 text-[9px] xs:text-[10px] sm:text-[11px]">
                      {{ t('editor.webhook.saveFirst') }}
                    </span>
                  </div>

                  <!-- Usage examples -->
                  <div class="rounded-lg border border-orange-500/20 bg-zinc-900/50 p-3">
                    <div class="text-[9px] xs:text-[10px] sm:text-[11px] font-semibold text-zinc-400 mb-2">
                      {{ t('editor.webhook.usageExamples') }}
                    </div>
                    <div class="space-y-2">
                      <div class="text-[8px] xs:text-[9px] text-zinc-500">cURL:</div>
                      <code class="block text-[8px] xs:text-[9px] text-orange-400 font-mono bg-zinc-800/50 p-2 rounded break-all">
                        curl -X POST {{ webhookEndpoint || 'YOUR_URL' }} -H "Content-Type: application/json" -d '{"data": "test"}'
                      </code>
                    </div>
                  </div>

                  <!-- Data flow info -->
                  <div class="rounded-lg border border-green-500/20 bg-green-500/5 p-3">
                    <div class="flex items-start gap-2">
                      <svg class="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span class="text-zinc-400 text-[9px] xs:text-[10px] sm:text-[11px]">
                        {{ t('editor.webhook.dataFlowHint') }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Schedule Trigger -->
                <div v-if="selectedType === 'Schedule'" class="space-y-4">
                  <!-- How it works -->
                  <div class="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3">
                    <div class="flex items-start gap-2">
                      <svg class="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div class="text-zinc-400 text-[9px] xs:text-[10px] sm:text-[11px]">
                        <div class="font-semibold text-cyan-400 mb-1">{{ t('editor.schedule.howItWorks') }}</div>
                        {{ t('editor.schedule.description') }}
                      </div>
                    </div>
                  </div>

                  <!-- Cron Expression -->
                  <UFormField :label="t('editor.cronExpression')" :ui="formFieldStyles">
                    <UInput
                      :model-value="String(selectedConfig.cron ?? '')"
                      placeholder="*/5 * * * *"
                      :ui="inputStyles"
                      @update:model-value="
                        (value) => updateTextConfig('cron', String(value))
                      "
                    />
                    <template #hint>
                      <span class="text-zinc-400 text-[9px] xs:text-[10px] sm:text-[11px]">
                        {{ t('editor.schedule.cronHint') }}
                      </span>
                    </template>
                  </UFormField>

                  <!-- Quick cron presets -->
                  <div class="flex flex-wrap gap-1">
                    <button
                      v-for="preset in cronPresets"
                      :key="preset.value"
                      type="button"
                      class="px-2 py-1 rounded text-[8px] xs:text-[9px] font-semibold transition-colors"
                      :class="String(selectedConfig.cron ?? '') === preset.value
                        ? 'bg-orange-500 text-zinc-950'
                        : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'"
                      @click="updateTextConfig('cron', preset.value)"
                    >
                      {{ preset.label }}
                    </button>
                  </div>

                  <!-- Cron format explanation -->
                  <div class="rounded-lg border border-orange-500/20 bg-zinc-900/50 p-3">
                    <div class="text-[9px] xs:text-[10px] sm:text-[11px] font-semibold text-zinc-400 mb-2">
                      {{ t('editor.schedule.cronFormat') }}
                    </div>
                    <div class="font-mono text-[9px] xs:text-[10px] text-orange-400 mb-2">
                      ┌───────────── {{ t('editor.schedule.minute') }} (0-59)<br>
                      │ ┌─────────── {{ t('editor.schedule.hour') }} (0-23)<br>
                      │ │ ┌───────── {{ t('editor.schedule.dayMonth') }} (1-31)<br>
                      │ │ │ ┌─────── {{ t('editor.schedule.month') }} (1-12)<br>
                      │ │ │ │ ┌───── {{ t('editor.schedule.dayWeek') }} (0-6)<br>
                      * * * * *
                    </div>
                    <div class="text-zinc-500 text-[8px] xs:text-[9px] space-y-1">
                      <div><code class="text-orange-400">*</code> — {{ t('editor.schedule.any') }}</div>
                      <div><code class="text-orange-400">*/5</code> — {{ t('editor.schedule.every5') }}</div>
                      <div><code class="text-orange-400">0,30</code> — {{ t('editor.schedule.specific') }}</div>
                    </div>
                  </div>

                  <!-- Timezone -->
                  <UFormField :label="t('editor.timezone')" :ui="formFieldStyles">
                    <div class="flex gap-2">
                      <UInput
                        :model-value="String(selectedConfig.timezone ?? 'UTC')"
                        placeholder="UTC"
                        :ui="inputStyles"
                        class="flex-1"
                        @update:model-value="
                          (value) => updateTextConfig('timezone', String(value))
                        "
                      />
                    </div>
                    <template #hint>
                      <span class="text-zinc-400 text-[9px] xs:text-[10px] sm:text-[11px]">
                        {{ t('editor.schedule.timezoneHint') }}
                      </span>
                    </template>
                  </UFormField>

                  <!-- Common timezones -->
                  <div class="flex flex-wrap gap-1">
                    <button
                      v-for="tz in commonTimezones"
                      :key="tz"
                      type="button"
                      class="px-2 py-1 rounded text-[8px] xs:text-[9px] font-semibold transition-colors"
                      :class="String(selectedConfig.timezone ?? 'UTC') === tz
                        ? 'bg-orange-500 text-zinc-950'
                        : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'"
                      @click="updateTextConfig('timezone', tz)"
                    >
                      {{ tz }}
                    </button>
                  </div>

                  <!-- Next run preview -->
                  <div class="rounded-lg border border-green-500/20 bg-green-500/5 p-3">
                    <div class="flex items-start gap-2">
                      <svg class="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span class="text-zinc-400 text-[9px] xs:text-[10px] sm:text-[11px]">
                        {{ t('editor.schedule.dataFlowHint') }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Email Trigger -->
                <div v-if="selectedType === 'Email'" class="space-y-4">
                  <!-- How it works -->
                  <div class="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3">
                    <div class="flex items-start gap-2">
                      <svg class="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <div class="text-zinc-400 text-[9px] xs:text-[10px] sm:text-[11px]">
                        <div class="font-semibold text-cyan-400 mb-1">{{ t('editor.emailTrigger.howItWorks') }}</div>
                        {{ t('editor.emailTrigger.imapDescription') }}
                      </div>
                    </div>
                  </div>

                  <!-- IMAP Email -->
                  <UFormField :label="t('editor.emailTrigger.imapEmail')" :ui="formFieldStyles">
                    <UInput
                      :model-value="String(selectedConfig.imapEmail ?? '')"
                      placeholder="your-email@gmail.com"
                      :ui="inputStyles"
                      @update:model-value="(value) => updateTextConfig('imapEmail', String(value))"
                    />
                    <template #hint>
                      <span class="text-zinc-400 text-[9px] xs:text-[10px] sm:text-[11px]">
                        {{ t('editor.emailTrigger.imapEmailHint') }}
                      </span>
                    </template>
                  </UFormField>

                  <!-- IMAP Password (App Password) -->
                  <UFormField :label="t('editor.emailTrigger.imapPassword')" :ui="formFieldStyles">
                    <UInput
                      :model-value="String(selectedConfig.imapPassword ?? '')"
                      type="password"
                      :placeholder="t('editor.emailTrigger.appPasswordPlaceholder')"
                      :ui="inputStyles"
                      @update:model-value="(value) => updateTextConfig('imapPassword', String(value))"
                    />
                    <template #hint>
                      <span class="text-zinc-400 text-[9px] xs:text-[10px] sm:text-[11px]">
                        {{ t('editor.emailTrigger.appPasswordHint') }}
                      </span>
                    </template>
                  </UFormField>

                  <!-- App Password Instructions -->
                  <div class="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                    <div class="flex items-start gap-2">
                      <svg class="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div class="text-zinc-400 text-[9px] xs:text-[10px] sm:text-[11px]">
                        <div class="font-semibold text-amber-400 mb-1">{{ t('editor.emailTrigger.appPasswordTitle') }}</div>
                        <div class="space-y-1.5">
                          <div>
                            <span class="font-semibold text-zinc-300">Gmail:</span>
                            <a href="https://myaccount.google.com/apppasswords" target="_blank" class="text-cyan-400 hover:underline ml-1">
                              {{ t('editor.emailTrigger.createAppPassword') }} →
                            </a>
                          </div>
                          <div>
                            <span class="font-semibold text-zinc-300">Mail.ru:</span>
                            {{ t('editor.emailTrigger.mailruInstructions') }}
                          </div>
                          <div>
                            <span class="font-semibold text-zinc-300">Yandex:</span>
                            {{ t('editor.emailTrigger.yandexInstructions') }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Advanced IMAP Settings (collapsible) -->
                  <details class="rounded-lg border border-zinc-700 bg-zinc-800/50">
                    <summary class="p-3 cursor-pointer text-[9px] xs:text-[10px] sm:text-[11px] font-semibold text-zinc-400 hover:text-zinc-300">
                      {{ t('editor.emailTrigger.advancedSettings') }}
                    </summary>
                    <div class="p-3 pt-0 space-y-3">
                      <!-- IMAP Server -->
                      <UFormField :label="t('editor.emailTrigger.imapServer')" :ui="formFieldStyles">
                        <UInput
                          :model-value="String(selectedConfig.imapHost ?? '')"
                          :placeholder="t('editor.emailTrigger.autoDetect')"
                          :ui="inputStyles"
                          @update:model-value="(value) => updateTextConfig('imapHost', String(value))"
                        />
                        <template #hint>
                          <span class="text-zinc-400 text-[9px] xs:text-[10px] sm:text-[11px]">
                            {{ t('editor.emailTrigger.imapServerHint') }}
                          </span>
                        </template>
                      </UFormField>

                      <!-- IMAP Port -->
                      <UFormField :label="t('editor.emailTrigger.imapPort')" :ui="formFieldStyles">
                        <UInput
                          :model-value="String(selectedConfig.imapPort ?? '')"
                          placeholder="993"
                          type="number"
                          :ui="inputStyles"
                          @update:model-value="(value) => updateTextConfig('imapPort', value ? Number(value) : '')"
                        />
                      </UFormField>

                      <!-- Folder -->
                      <UFormField :label="t('editor.emailTrigger.folder')" :ui="formFieldStyles">
                        <UInput
                          :model-value="String(selectedConfig.imapFolder ?? '')"
                          placeholder="INBOX"
                          :ui="inputStyles"
                          @update:model-value="(value) => updateTextConfig('imapFolder', String(value))"
                        />
                      </UFormField>

                      <!-- Filter by sender -->
                      <UFormField :label="t('editor.emailTrigger.filterFrom')" :ui="formFieldStyles">
                        <UInput
                          :model-value="String(selectedConfig.filterFrom ?? '')"
                          :placeholder="t('editor.emailTrigger.filterFromPlaceholder')"
                          :ui="inputStyles"
                          @update:model-value="(value) => updateTextConfig('filterFrom', String(value))"
                        />
                      </UFormField>

                      <!-- Filter by subject -->
                      <UFormField :label="t('editor.emailTrigger.filterSubject')" :ui="formFieldStyles">
                        <UInput
                          :model-value="String(selectedConfig.filterSubject ?? '')"
                          :placeholder="t('editor.emailTrigger.filterSubjectPlaceholder')"
                          :ui="inputStyles"
                          @update:model-value="(value) => updateTextConfig('filterSubject', String(value))"
                        />
                      </UFormField>
                    </div>
                  </details>

                  <!-- Test Connection Button -->
                  <div class="flex items-center gap-3">
                    <button
                      type="button"
                      :disabled="imapTesting || !selectedConfig.imapEmail || !selectedConfig.imapPassword"
                      class="rounded-md border border-cyan-500 bg-cyan-500/20 px-4 py-2 text-cyan-400 transition hover:bg-cyan-500/30 disabled:opacity-50"
                      @click="testImapConnection"
                    >
                      <span class="text-[9px] xs:text-[10px] sm:text-[11px] font-semibold flex items-center gap-2">
                        <svg v-if="imapTesting" class="h-3 w-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {{ imapTesting ? t('editor.emailTrigger.testing') : t('editor.emailTrigger.testConnection') }}
                      </span>
                    </button>
                    <span v-if="imapTestResult" :class="[
                      'text-[9px] xs:text-[10px] sm:text-[11px]',
                      imapTestResult.ok ? 'text-green-400' : 'text-red-400'
                    ]">
                      {{ imapTestResult.ok ? t('editor.emailTrigger.connectionSuccess') : imapTestResult.error }}
                    </span>
                  </div>

                  <!-- Supported providers -->
                  <div class="rounded-lg border border-zinc-700 bg-zinc-800/50 p-3">
                    <div class="text-[9px] xs:text-[10px] sm:text-[11px] font-semibold text-zinc-400 mb-2">
                      {{ t('editor.emailTrigger.supportedProviders') }}
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <span class="px-2 py-1 rounded bg-zinc-700 text-zinc-300 text-[8px] xs:text-[9px]">Gmail</span>
                      <span class="px-2 py-1 rounded bg-zinc-700 text-zinc-300 text-[8px] xs:text-[9px]">Mail.ru</span>
                      <span class="px-2 py-1 rounded bg-zinc-700 text-zinc-300 text-[8px] xs:text-[9px]">Yandex</span>
                      <span class="px-2 py-1 rounded bg-zinc-700 text-zinc-300 text-[8px] xs:text-[9px]">Yahoo</span>
                      <span class="px-2 py-1 rounded bg-zinc-700 text-zinc-300 text-[8px] xs:text-[9px]">Outlook</span>
                      <span class="px-2 py-1 rounded bg-zinc-700 text-zinc-300 text-[8px] xs:text-[9px]">iCloud</span>
                    </div>
                  </div>

                  <!-- Polling info -->
                  <div class="rounded-lg border border-green-500/20 bg-green-500/5 p-3">
                    <div class="flex items-start gap-2">
                      <svg class="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span class="text-zinc-400 text-[9px] xs:text-[10px] sm:text-[11px]">
                        {{ t('editor.emailTrigger.pollingInfo') }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="selectedRole === 'action'" class="space-y-6">
                <!-- HTTP Request Action -->
                <div
                  v-if="selectedActionType === 'HTTP Request'"
                  class="space-y-4"
                >
                  <!-- URL -->
                  <UFormField :label="t('editor.url')" :ui="formFieldStyles">
                    <UInput
                      :model-value="String(selectedConfig.url ?? '')"
                      placeholder="https://api.example.com/endpoint"
                      :ui="inputStyles"
                      @update:model-value="
                        (value) => updateTextConfig('url', String(value))
                      "
                    />
                    <template #hint>
                      <span class="text-zinc-400 text-[9px] xs:text-[10px] sm:text-[11px]">
                        {{ t('editor.http.urlHint') }}
                      </span>
                    </template>
                  </UFormField>

                  <!-- Method -->
                  <UFormField :label="t('editor.method')" :ui="formFieldStyles">
                    <div class="flex gap-1 flex-wrap">
                      <button
                        v-for="method in httpMethods"
                        :key="method"
                        type="button"
                        class="px-3 py-1.5 rounded text-[9px] xs:text-[10px] sm:text-[11px] font-semibold transition-colors"
                        :class="String(selectedConfig.method ?? 'POST') === method
                          ? 'bg-orange-500 text-zinc-950'
                          : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'"
                        @click="updateTextConfig('method', method)"
                      >
                        {{ method }}
                      </button>
                    </div>
                    <template #hint>
                      <span class="text-zinc-400 text-[9px] xs:text-[10px] sm:text-[11px]">
                        {{ t('editor.http.methodHint') }}
                      </span>
                    </template>
                  </UFormField>

                  <!-- Headers -->
                  <UFormField :label="t('editor.headers')" :ui="formFieldStyles">
                    <UTextarea
                      :model-value="formatJsonConfig(selectedConfig.headers, '{}')"
                      :placeholder="t('editor.http.headersPlaceholder')"
                      :ui="textareaStyles"
                      :rows="3"
                      @update:model-value="
                        (value) => updateTextConfig('headers', String(value))
                      "
                    />
                    <template #hint>
                      <span class="text-zinc-400 text-[9px] xs:text-[10px] sm:text-[11px]">
                        {{ t('editor.http.headersHint') }}
                      </span>
                    </template>
                  </UFormField>

                  <!-- Body -->
                  <UFormField :label="t('editor.body')" :ui="formFieldStyles">
                    <UTextarea
                      :model-value="String(selectedConfig.body ?? '')"
                      :placeholder="t('editor.http.bodyPlaceholder')"
                      :ui="textareaStyles"
                      :rows="4"
                      @update:model-value="
                        (value) => updateTextConfig('body', String(value))
                      "
                    />
                    <template #hint>
                      <span class="text-zinc-400 text-[9px] xs:text-[10px] sm:text-[11px]">
                        {{ t('editor.http.bodyHint') }}
                      </span>
                    </template>
                  </UFormField>

                  <!-- Test HTTP Request -->
                  <div class="flex flex-col gap-3 pt-2">
                    <div class="flex items-center gap-3">
                      <button
                        type="button"
                        :disabled="!canTestHttp || httpTesting"
                        class="rounded-md border border-cyan-500/50 bg-cyan-500/20 px-3 py-2 text-cyan-400 transition hover:bg-cyan-500/30 hover:border-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed"
                        @click="testHttpRequest"
                      >
                        <span class="text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs font-semibold flex items-center gap-2">
                          <svg v-if="httpTesting" class="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <svg v-else class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          {{ httpTesting ? t('editor.http.testing') : t('editor.http.testRequest') }}
                        </span>
                      </button>
                    </div>

                    <!-- HTTP Response Preview -->
                    <div 
                      v-if="httpTestResult"
                      class="rounded-lg border p-3 text-[9px] xs:text-[10px] sm:text-[11px]"
                      :class="httpTestResult.ok 
                        ? 'border-green-500/30 bg-green-500/10' 
                        : 'border-red-500/30 bg-red-500/10'"
                    >
                      <div class="flex items-center gap-2 mb-2">
                        <span 
                          class="px-2 py-0.5 rounded font-mono font-bold"
                          :class="httpTestResult.ok ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'"
                        >
                          {{ httpTestResult.status }}
                        </span>
                        <span :class="httpTestResult.ok ? 'text-green-400' : 'text-red-400'">
                          {{ httpTestResult.ok ? t('editor.http.success') : t('editor.http.failed') }}
                        </span>
                      </div>
                      <pre class="text-zinc-300 whitespace-pre-wrap break-all max-h-32 overflow-auto font-mono text-[8px] xs:text-[9px]">{{ httpTestResult.data }}</pre>
                    </div>
                  </div>
                </div>

                <!-- Email Action -->
                <div v-if="selectedActionType === 'Email'" class="space-y-4">
                  <!-- Email Provider Selector -->
                  <div class="space-y-2">
                    <div class="text-zinc-400 text-[9px] xs:text-[10px] sm:text-[11px] font-semibold">
                      {{ t('editor.email.provider') }}
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <button
                        v-for="provider in emailProviders"
                        :key="provider.id"
                        type="button"
                        class="px-3 py-1.5 rounded text-[9px] xs:text-[10px] font-semibold transition-colors flex items-center gap-1.5"
                        :class="emailProvider === provider.id ? 'bg-orange-500 text-zinc-950' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'"
                        @click="setEmailProvider(provider.id)"
                      >
                        <span v-html="provider.icon" class="w-3 h-3"></span>
                        {{ provider.name }}
                      </button>
                    </div>
                  </div>

                  <!-- Provider Info Box -->
                  <div class="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3">
                    <div class="flex items-start gap-2">
                      <svg class="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div class="text-zinc-400 text-[9px] xs:text-[10px] sm:text-[11px]">
                        <div v-if="emailProvider === 'gmail'" class="space-y-1">
                          <div class="font-semibold text-cyan-400">{{ t('editor.email.gmailTitle') }}</div>
                          <p>{{ t('editor.email.gmailDesc') }}</p>
                          <a href="https://myaccount.google.com/apppasswords" target="_blank" class="text-orange-400 hover:underline block">
                            {{ t('editor.email.getAppPassword') }} →
                          </a>
                        </div>
                        <div v-else-if="emailProvider === 'sendgrid'" class="space-y-1">
                          <div class="font-semibold text-cyan-400">{{ t('editor.email.sendgridTitle') }}</div>
                          <p>{{ t('editor.email.sendgridDesc') }}</p>
                          <a href="https://app.sendgrid.com/settings/api_keys" target="_blank" class="text-orange-400 hover:underline block">
                            {{ t('editor.email.getSendGridKey') }} →
                          </a>
                        </div>
                        <div v-else class="space-y-1">
                          <div class="font-semibold text-cyan-400">{{ t('editor.email.resendTitle') }}</div>
                          <p>{{ t('editor.email.resendDesc') }}</p>
                          <a href="https://resend.com/api-keys" target="_blank" class="text-orange-400 hover:underline block">
                            {{ t('editor.email.getResendKey') }} →
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Gmail SMTP Settings -->
                  <div v-if="emailProvider === 'gmail'" class="space-y-3 rounded-lg border border-zinc-700 bg-zinc-800/50 p-3">
                    <div class="text-[9px] xs:text-[10px] sm:text-[11px] font-semibold text-zinc-400">
                      {{ t('editor.email.gmailSettings') }}
                    </div>
                    <UFormField :label="t('editor.email.gmailEmail')" :ui="formFieldStyles">
                      <UInput
                        :model-value="String(selectedConfig.smtpEmail ?? '')"
                        placeholder="your-email@gmail.com"
                        type="email"
                        :ui="inputStyles"
                        @update:model-value="(value) => updateGmailConfig('smtpEmail', String(value))"
                      />
                    </UFormField>
                    <UFormField :label="t('editor.email.appPassword')" :ui="formFieldStyles">
                      <UInput
                        :model-value="String(selectedConfig.smtpPassword ?? '')"
                        placeholder="xxxx xxxx xxxx xxxx"
                        type="password"
                        :ui="inputStyles"
                        @update:model-value="(value) => updateGmailConfig('smtpPassword', String(value))"
                      />
                      <template #hint>
                        <span class="text-zinc-400 text-[9px] xs:text-[10px] sm:text-[11px]">
                          {{ t('editor.email.appPasswordHint') }}
                        </span>
                      </template>
                    </UFormField>
                  </div>

                  <!-- SendGrid Settings -->
                  <div v-if="emailProvider === 'sendgrid'" class="space-y-3 rounded-lg border border-zinc-700 bg-zinc-800/50 p-3">
                    <div class="text-[9px] xs:text-[10px] sm:text-[11px] font-semibold text-zinc-400">
                      {{ t('editor.email.sendgridSettings') }}
                    </div>
                    <UFormField :label="t('editor.email.sendgridApiKey')" :ui="formFieldStyles">
                      <UInput
                        :model-value="String(selectedConfig.sendgridApiKey ?? '')"
                        placeholder="SG.xxx..."
                        type="password"
                        :ui="inputStyles"
                        @update:model-value="(value) => updateSendGridConfig('sendgridApiKey', String(value))"
                      />
                    </UFormField>
                    <UFormField :label="t('editor.email.senderEmail')" :ui="formFieldStyles">
                      <UInput
                        :model-value="String(selectedConfig.from ?? '')"
                        placeholder="noreply@yourdomain.com"
                        type="email"
                        :ui="inputStyles"
                        @update:model-value="(value) => updateTextConfig('from', String(value))"
                      />
                      <template #hint>
                        <span class="text-zinc-400 text-[9px] xs:text-[10px] sm:text-[11px]">
                          {{ t('editor.email.senderHint') }}
                        </span>
                      </template>
                    </UFormField>
                  </div>

                  <!-- Test Connection Button -->
                  <div class="flex items-center gap-3">
                    <button
                      type="button"
                      :disabled="!canTestEmail || emailSmtpTesting"
                      class="px-3 py-1.5 rounded text-[9px] xs:text-[10px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      :class="canTestEmail ? 'bg-cyan-600 text-white hover:bg-cyan-500' : 'bg-zinc-700 text-zinc-400'"
                      @click="testEmailConnection"
                    >
                      <span class="flex items-center gap-1.5">
                        <svg v-if="emailSmtpTesting" class="h-3 w-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {{ emailSmtpTesting ? t('editor.email.testing') : t('editor.email.testConnection') }}
                      </span>
                    </button>
                    <span v-if="emailSmtpTestResult" :class="[
                      'text-[9px] xs:text-[10px] sm:text-[11px]',
                      emailSmtpTestResult.ok ? 'text-green-400' : 'text-red-400'
                    ]">
                      {{ emailSmtpTestResult.ok ? t('editor.email.connectionSuccess') : emailSmtpTestResult.error }}
                    </span>
                  </div>

                  <hr class="border-zinc-700">

                  <!-- Recipient -->
                  <UFormField :label="t('editor.to')" :ui="formFieldStyles">
                    <UInput
                      :model-value="String(selectedConfig.to ?? '')"
                      placeholder="user@example.com"
                      type="email"
                      :ui="inputStyles"
                      @update:model-value="
                        (value) => updateTextConfig('to', String(value))
                      "
                    />
                    <template #hint>
                      <span class="text-zinc-400 text-[9px] xs:text-[10px] sm:text-[11px]">
                        {{ t('editor.email.toHint') }}
                      </span>
                    </template>
                  </UFormField>

                  <!-- Subject -->
                  <UFormField :label="t('editor.subject')" :ui="formFieldStyles">
                    <UInput
                      :model-value="String(selectedConfig.subject ?? '')"
                      :placeholder="t('editor.email.subjectPlaceholder')"
                      :ui="inputStyles"
                      @update:model-value="
                        (value) => updateTextConfig('subject', String(value))
                      "
                    />
                    <template #hint>
                      <span class="text-zinc-400 text-[9px] xs:text-[10px] sm:text-[11px]">
                        {{ t('editor.email.subjectHint') }}
                      </span>
                    </template>
                  </UFormField>

                  <!-- Content Type Toggle -->
                  <div class="flex items-center gap-3">
                    <span class="text-zinc-400 text-[9px] xs:text-[10px] sm:text-[11px] font-semibold">
                      {{ t('editor.email.contentType') }}:
                    </span>
                    <div class="flex gap-1">
                      <button
                        type="button"
                        class="px-2 py-1 rounded text-[9px] xs:text-[10px] font-semibold transition-colors"
                        :class="emailContentMode === 'html' ? 'bg-orange-500 text-zinc-950' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'"
                        @click="emailContentMode = 'html'"
                      >
                        HTML
                      </button>
                      <button
                        type="button"
                        class="px-2 py-1 rounded text-[9px] xs:text-[10px] font-semibold transition-colors"
                        :class="emailContentMode === 'text' ? 'bg-orange-500 text-zinc-950' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'"
                        @click="emailContentMode = 'text'"
                      >
                        Text
                      </button>
                      <button
                        type="button"
                        class="px-2 py-1 rounded text-[9px] xs:text-[10px] font-semibold transition-colors"
                        :class="emailContentMode === 'both' ? 'bg-orange-500 text-zinc-950' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'"
                        @click="emailContentMode = 'both'"
                      >
                        {{ t('editor.email.both') }}
                      </button>
                    </div>
                  </div>

                  <!-- HTML Content -->
                  <UFormField 
                    v-if="emailContentMode === 'html' || emailContentMode === 'both'" 
                    :label="t('editor.html')" 
                    :ui="formFieldStyles"
                  >
                    <UTextarea
                      :model-value="String(selectedConfig.html ?? '')"
                      :placeholder="t('editor.email.htmlPlaceholder')"
                      :ui="textareaStyles"
                      :rows="5"
                      @update:model-value="
                        (value) => updateTextConfig('html', String(value))
                      "
                    />
                    <template #hint>
                      <span class="text-zinc-400 text-[9px] xs:text-[10px] sm:text-[11px]">
                        {{ t('editor.email.htmlHint') }}
                      </span>
                    </template>
                  </UFormField>

                  <!-- Text Content -->
                  <UFormField 
                    v-if="emailContentMode === 'text' || emailContentMode === 'both'" 
                    :label="t('editor.text')" 
                    :ui="formFieldStyles"
                  >
                    <UTextarea
                      :model-value="String(selectedConfig.text ?? '')"
                      :placeholder="t('editor.email.textPlaceholder')"
                      :ui="textareaStyles"
                      :rows="4"
                      @update:model-value="
                        (value) => updateTextConfig('text', String(value))
                      "
                    />
                    <template #hint>
                      <span class="text-zinc-400 text-[9px] xs:text-[10px] sm:text-[11px]">
                        {{ t('editor.email.textHint') }}
                      </span>
                    </template>
                  </UFormField>

                  <!-- Send Test Email Button -->
                  <div class="flex items-center gap-3">
                    <button
                      type="button"
                      :disabled="!canSendTestEmail || emailSending"
                      class="px-3 py-1.5 rounded text-[9px] xs:text-[10px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      :class="canSendTestEmail ? 'bg-green-600 text-white hover:bg-green-500' : 'bg-zinc-700 text-zinc-400'"
                      @click="sendTestEmail"
                    >
                      <span class="flex items-center gap-1.5">
                        <svg v-if="emailSending" class="h-3 w-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <svg v-else class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        {{ emailSending ? t('editor.email.sending') : t('editor.email.sendTest') }}
                      </span>
                    </button>
                    <span v-if="emailSendResult" :class="[
                      'text-[9px] xs:text-[10px] sm:text-[11px]',
                      emailSendResult.ok ? 'text-green-400' : 'text-red-400'
                    ]">
                      {{ emailSendResult.ok ? t('editor.email.sendSuccess') : emailSendResult.error }}
                    </span>
                  </div>

                  <!-- Auto-send info -->
                  <div class="rounded-lg border border-orange-500/20 bg-zinc-900/50 p-3">
                    <div class="flex items-start gap-2">
                      <svg class="h-4 w-4 text-orange-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span class="text-zinc-400 text-[9px] xs:text-[10px] sm:text-[11px]">
                        {{ t('editor.email.autoContentHint') }}
                      </span>
                    </div>
                  </div>
                </div>

                <div v-if="selectedActionType === 'Telegram'" class="space-y-4">
                  <!-- Bot Token -->
                  <UFormField :label="t('editor.botToken')" :ui="formFieldStyles">
                    <UInput
                      :model-value="String(selectedConfig.botToken ?? '')"
                      placeholder="123456789:ABCdefGHI..."
                      type="password"
                      :ui="inputStyles"
                      @update:model-value="
                        (value) => updateTextConfig('botToken', String(value))
                      "
                    />
                    <template #hint>
                      <span class="text-zinc-400 text-[9px] xs:text-[10px] sm:text-[11px]">
                        {{ t('editor.telegram.botTokenHint') }}
                        <a 
                          href="https://t.me/BotFather" 
                          target="_blank" 
                          class="text-orange-400 hover:text-orange-300 underline"
                        >
                          @BotFather
                        </a>
                      </span>
                    </template>
                  </UFormField>

                  <!-- Chat ID -->
                  <UFormField :label="t('editor.chatId')" :ui="formFieldStyles">
                    <UInput
                      :model-value="String(selectedConfig.chatId ?? '')"
                      placeholder="123456789"
                      :ui="inputStyles"
                      @update:model-value="
                        (value) => updateTextConfig('chatId', String(value))
                      "
                    />
                    <template #hint>
                      <span class="text-zinc-400 text-[9px] xs:text-[10px] sm:text-[11px]">
                        {{ t('editor.telegram.chatIdHint') }}
                        <a 
                          href="https://t.me/userinfobot" 
                          target="_blank" 
                          class="text-orange-400 hover:text-orange-300 underline"
                        >
                          @userinfobot
                        </a>
                      </span>
                    </template>
                  </UFormField>

                  <!-- Message -->
                  <UFormField :label="t('editor.message')" :ui="formFieldStyles">
                    <UTextarea
                      :model-value="String(selectedConfig.message ?? '')"
                      :placeholder="t('editor.telegram.messagePlaceholder')"
                      :ui="textareaStyles"
                      :rows="3"
                      @update:model-value="
                        (value) => updateTextConfig('message', String(value))
                      "
                    />
                    <template #hint>
                      <span class="text-zinc-400 text-[9px] xs:text-[10px] sm:text-[11px]">
                        {{ t('editor.telegram.messageHint') }}
                      </span>
                    </template>
                  </UFormField>

                  <!-- Parse Mode -->
                  <UFormField :label="t('editor.parseMode')" :ui="formFieldStyles">
                    <USelect
                      :items="telegramParseModes"
                      :model-value="
                        String(selectedConfig.parseMode ?? 'Markdown')
                      "
                      :ui="selectStyles"
                      @update:model-value="
                        (value) => updateTextConfig('parseMode', String(value))
                      "
                    />
                    <template #hint>
                      <span class="text-zinc-400 text-[9px] xs:text-[10px] sm:text-[11px]">
                        {{ t('editor.telegram.parseModeHint') }}
                      </span>
                    </template>
                  </UFormField>

                  <!-- Formatting preview -->
                  <div 
                    v-if="selectedConfig.message"
                    class="rounded-lg border border-orange-500/20 bg-zinc-900/50 p-3"
                  >
                    <div class="text-[9px] xs:text-[10px] sm:text-[11px] font-semibold text-zinc-400 mb-2">
                      {{ t('editor.telegram.preview') }}
                    </div>
                    <div class="text-zinc-100 text-[10px] xs:text-[11px] sm:text-xs whitespace-pre-wrap break-words">
                      {{ String(selectedConfig.message ?? '') }}
                    </div>
                  </div>

                  <!-- Test button -->
                  <div class="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      :disabled="!canTestTelegram || telegramTesting"
                      class="rounded-md border border-cyan-500/50 bg-cyan-500/20 px-3 py-2 text-cyan-400 transition hover:bg-cyan-500/30 hover:border-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed"
                      @click="testTelegramMessage"
                    >
                      <span class="text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs font-semibold flex items-center gap-2">
                        <svg v-if="telegramTesting" class="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <svg v-else class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        {{ telegramTesting ? t('editor.telegram.sending') : t('editor.telegram.testSend') }}
                      </span>
                    </button>
                    <span 
                      v-if="telegramTestResult" 
                      class="text-[9px] xs:text-[10px] sm:text-[11px]"
                      :class="telegramTestResult.ok ? 'text-green-400' : 'text-red-400'"
                    >
                      {{ telegramTestResult.message }}
                    </span>
                  </div>
                </div>

                <!-- Database Action -->
                <div v-if="selectedActionType === 'Database'" class="space-y-4">
                  <!-- Model Selection -->
                  <UFormField :label="t('editor.model')" :ui="formFieldStyles">
                    <div class="flex flex-wrap gap-1 mb-2">
                      <button
                        v-for="model in availableDbModels"
                        :key="model.value"
                        type="button"
                        class="px-2 py-1 rounded text-[9px] xs:text-[10px] font-semibold transition-colors"
                        :class="String(selectedConfig.model ?? '') === model.value
                          ? 'bg-orange-500 text-zinc-950'
                          : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'"
                        @click="updateTextConfig('model', model.value)"
                      >
                        {{ model.label }}
                      </button>
                    </div>
                    <UInput
                      :model-value="String(selectedConfig.model ?? '')"
                      :placeholder="t('editor.db.modelPlaceholder')"
                      :ui="inputStyles"
                      @update:model-value="
                        (value) => updateTextConfig('model', String(value))
                      "
                    />
                    <template #hint>
                      <span class="text-zinc-400 text-[9px] xs:text-[10px] sm:text-[11px]">
                        {{ t('editor.db.modelHint') }}
                      </span>
                    </template>
                  </UFormField>

                  <!-- Operation Selection -->
                  <UFormField :label="t('editor.operation')" :ui="formFieldStyles">
                    <div class="grid grid-cols-3 gap-1">
                      <button
                        v-for="op in dbOperationsWithDesc"
                        :key="op.value"
                        type="button"
                        class="flex flex-col items-start px-2 py-1.5 rounded text-left transition-colors"
                        :class="String(selectedConfig.operation ?? 'create') === op.value
                          ? 'bg-orange-500 text-zinc-950'
                          : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'"
                        @click="updateTextConfig('operation', op.value); updateDbArgsTemplate(op.value)"
                      >
                        <span class="text-[9px] xs:text-[10px] font-bold">{{ op.label }}</span>
                        <span class="text-[7px] xs:text-[8px] opacity-70">{{ op.desc }}</span>
                      </button>
                    </div>
                  </UFormField>

                  <!-- Args with template -->
                  <UFormField :label="t('editor.args')" :ui="formFieldStyles">
                    <UTextarea
                      :model-value="formatJsonConfig(selectedConfig.args, '{}')"
                      :placeholder="getDbArgsPlaceholder(String(selectedConfig.operation ?? 'create'))"
                      :ui="textareaStyles"
                      :rows="6"
                      @update:model-value="
                        (value) => updateTextConfig('args', String(value))
                      "
                    />
                    <template #hint>
                      <span class="text-zinc-400 text-[9px] xs:text-[10px] sm:text-[11px]">
                        {{ t('editor.db.argsHint') }}
                      </span>
                    </template>
                  </UFormField>

                  <!-- Args Template Helper -->
                  <div class="rounded-lg border border-orange-500/20 bg-zinc-900/50 p-3">
                    <div class="text-[9px] xs:text-[10px] sm:text-[11px] font-semibold text-zinc-400 mb-2">
                      {{ t('editor.db.exampleFor') }} {{ selectedConfig.operation ?? 'create' }}:
                    </div>
                    <pre class="text-zinc-300 text-[8px] xs:text-[9px] font-mono whitespace-pre-wrap">{{ getDbArgsExample(String(selectedConfig.operation ?? 'create')) }}</pre>
                    <button
                      type="button"
                      class="mt-2 text-[9px] xs:text-[10px] text-orange-400 hover:text-orange-300 underline"
                      @click="applyDbArgsTemplate(String(selectedConfig.operation ?? 'create'))"
                    >
                      {{ t('editor.db.useTemplate') }}
                    </button>
                  </div>

                  <!-- Auto-data info -->
                  <div class="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3">
                    <div class="flex items-start gap-2">
                      <svg class="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span class="text-zinc-400 text-[9px] xs:text-[10px] sm:text-[11px]">
                        {{ t('editor.db.autoDataHint') }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Transformation Action -->
                <div
                  v-if="selectedActionType === 'Transformation'"
                  class="space-y-4"
                >
                  <!-- Mode Toggle -->
                  <div class="flex items-center gap-3">
                    <span class="text-zinc-400 text-[9px] xs:text-[10px] sm:text-[11px] font-semibold">
                      {{ t('editor.transform.mode') }}:
                    </span>
                    <div class="flex gap-1">
                      <button
                        type="button"
                        class="px-2 py-1 rounded text-[9px] xs:text-[10px] font-semibold transition-colors"
                        :class="transformMode === 'expression' ? 'bg-orange-500 text-zinc-950' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'"
                        @click="transformMode = 'expression'"
                      >
                        {{ t('editor.transform.expression') }}
                      </button>
                      <button
                        type="button"
                        class="px-2 py-1 rounded text-[9px] xs:text-[10px] font-semibold transition-colors"
                        :class="transformMode === 'mapping' ? 'bg-orange-500 text-zinc-950' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'"
                        @click="transformMode = 'mapping'"
                      >
                        {{ t('editor.transform.mapping') }}
                      </button>
                    </div>
                  </div>

                  <!-- Expression Mode -->
                  <template v-if="transformMode === 'expression'">
                    <UFormField :label="t('editor.expression')" :ui="formFieldStyles">
                      <UTextarea
                        :model-value="String(selectedConfig.expression ?? '')"
                        :placeholder="t('editor.transform.expressionPlaceholder')"
                        :ui="textareaStyles"
                        :rows="4"
                        @update:model-value="
                          (value) => updateTextConfig('expression', String(value))
                        "
                      />
                      <template #hint>
                        <span class="text-zinc-400 text-[9px] xs:text-[10px] sm:text-[11px]">
                          {{ t('editor.transform.expressionHint') }}
                        </span>
                      </template>
                    </UFormField>

                    <!-- Expression Examples -->
                    <div class="rounded-lg border border-orange-500/20 bg-zinc-900/50 p-3">
                      <div class="text-[9px] xs:text-[10px] sm:text-[11px] font-semibold text-zinc-400 mb-2">
                        {{ t('editor.transform.examples') }}:
                      </div>
                      <div class="space-y-2">
                        <button
                          v-for="(example, idx) in expressionExamples"
                          :key="idx"
                          type="button"
                          class="w-full text-left p-2 rounded bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors"
                          @click="updateTextConfig('expression', example.code)"
                        >
                          <div class="text-[8px] xs:text-[9px] text-zinc-500 mb-1">{{ example.desc }}</div>
                          <code class="text-[8px] xs:text-[9px] text-orange-400 font-mono">{{ example.code }}</code>
                        </button>
                      </div>
                    </div>
                  </template>

                  <!-- Mapping Mode -->
                  <template v-if="transformMode === 'mapping'">
                    <UFormField :label="t('editor.mapping')" :ui="formFieldStyles">
                      <UTextarea
                        :model-value="formatJsonConfig(selectedConfig.mapping, '{}')"
                        :placeholder="t('editor.transform.mappingPlaceholder')"
                        :ui="textareaStyles"
                        :rows="6"
                        @update:model-value="
                          (value) => updateTextConfig('mapping', String(value))
                        "
                      />
                      <template #hint>
                        <span class="text-zinc-400 text-[9px] xs:text-[10px] sm:text-[11px]">
                          {{ t('editor.transform.mappingHint') }}
                        </span>
                      </template>
                    </UFormField>

                    <!-- Mapping Builder -->
                    <div class="rounded-lg border border-orange-500/20 bg-zinc-900/50 p-3">
                      <div class="text-[9px] xs:text-[10px] sm:text-[11px] font-semibold text-zinc-400 mb-2">
                        {{ t('editor.transform.mappingBuilder') }}:
                      </div>
                      <div class="space-y-2">
                        <div 
                          v-for="(field, idx) in mappingFields" 
                          :key="idx" 
                          class="flex gap-2 items-center"
                        >
                          <UInput
                            :model-value="field.key"
                            placeholder="outputField"
                            :ui="{ ...inputStyles, base: inputStyles.base + ' text-[9px]' }"
                            class="flex-1"
                            @update:model-value="(v) => updateMappingField(idx, 'key', String(v))"
                          />
                          <span class="text-zinc-500">←</span>
                          <UInput
                            :model-value="field.value"
                            placeholder="input.fieldPath"
                            :ui="{ ...inputStyles, base: inputStyles.base + ' text-[9px]' }"
                            class="flex-1"
                            @update:model-value="(v) => updateMappingField(idx, 'value', String(v))"
                          />
                          <button
                            type="button"
                            class="p-1 text-red-400 hover:text-red-300"
                            @click="removeMappingField(idx)"
                          >
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <button
                          type="button"
                          class="text-[9px] xs:text-[10px] text-orange-400 hover:text-orange-300"
                          @click="addMappingField"
                        >
                          + {{ t('editor.transform.addField') }}
                        </button>
                      </div>
                    </div>
                  </template>

                  <!-- Data flow explanation -->
                  <div class="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3">
                    <div class="flex items-start gap-2">
                      <svg class="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span class="text-zinc-400 text-[9px] xs:text-[10px] sm:text-[11px]">
                        {{ t('editor.transform.dataFlowHint') }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="border-t border-orange-500/30 pt-4">
                  <div
                    class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold text-zinc-100"
                  >
                    {{ t("editor.errorHandling") }}
                  </div>
                  <div class="mt-3 space-y-3">
                    <UFormField :label="t('editor.retryCount')" :ui="formFieldStyles">
                      <UInput
                        type="number"
                        :model-value="String(selectedConfig.retryCount ?? 0)"
                        :ui="inputStyles"
                        @update:model-value="
                          (value) => updateNumberConfig('retryCount', value)
                        "
                      />
                    </UFormField>
                    <UFormField :label="t('editor.retryDelay')" :ui="formFieldStyles">
                      <UInput
                        type="number"
                        :model-value="String(selectedConfig.retryDelayMs ?? 0)"
                        :ui="inputStyles"
                        @update:model-value="
                          (value) => updateNumberConfig('retryDelayMs', value)
                        "
                      />
                    </UFormField>
                    <UFormField :label="t('editor.onError')" :ui="formFieldStyles">
                      <USelect
                        :items="errorModes"
                        :model-value="String(selectedConfig.onError ?? 'fail')"
                        :ui="selectStyles"
                        @update:model-value="
                          (value) => updateTextConfig('onError', String(value))
                        "
                      />
                    </UFormField>
                    <UFormField :label="t('editor.notifyEmail')" :ui="formFieldStyles">
                      <UInput
                        :model-value="String(selectedConfig.notifyEmail ?? '')"
                        placeholder="alerts@example.com"
                        :ui="inputStyles"
                        @update:model-value="
                          (value) =>
                            updateTextConfig('notifyEmail', String(value))
                        "
                      />
                    </UFormField>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { $fetch } from "ofetch";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import {
  addEdge,
  BaseEdge,
  type Connection,
  type Edge,
  type EdgeMouseEvent,
  EdgeLabelRenderer,
  getSmoothStepPath,
  Handle,
  type Node,
  Position,
  useVueFlow,
  VueFlow,
} from "@vue-flow/core";

type NodeData = {
  label: string;
  type: string;
  role?: "trigger" | "action";
  actionType?: string;
  config?: Record<string, unknown>;
};

type PaletteItem = {
  id: string;
  label: string;
  type: string;
  role: "trigger" | "action";
  actionType?: string;
  config?: Record<string, unknown>;
  summary: string;
  details: string;
  tips?: string[];
};

const props = defineProps<{ workflowId?: string | null }>();
const flowId = "workflow-editor";

const palette: PaletteItem[] = [
  {
    id: "webhook",
    label: "Webhook",
    type: "Webhook",
    role: "trigger",
    summary: "Incoming HTTP request triggers the workflow.",
    details:
      "Expose a webhook endpoint and start the flow when data is posted.",
    tips: [
      "Use JSON payloads from external apps.",
      "Save once to generate the URL.",
    ],
    config: {},
  },
  {
    id: "schedule",
    label: "Schedule",
    type: "Schedule",
    role: "trigger",
    summary: "Run the workflow on a cron schedule.",
    details: "Define a cron expression and timezone to trigger automatically.",
    tips: ["Example: */5 * * * *", "Timezone defaults to UTC."],
    config: { cron: "*/5 * * * *", timezone: "UTC" },
  },
  {
    id: "email-trigger",
    label: "Email",
    type: "Email",
    role: "trigger",
    summary: "Trigger when an inbound email arrives.",
    details: "Point your inbound email provider to the generated endpoint.",
    tips: ["Providers can POST email payloads.", "Save once to get the URL."],
    config: {},
  },
  {
    id: "http-request",
    label: "HTTP Request",
    type: "HTTP Request",
    role: "action",
    actionType: "HTTP Request",
    summary: "Send an HTTP request to an API.",
    details:
      "Configure method, headers, and body. The response becomes the next step input.",
    tips: ["Use output from previous steps.", "Timeout defaults to 15s."],
    config: { url: "", method: "POST", headers: "{}", body: "" },
  },
  {
    id: "email-action",
    label: "Email",
    type: "Email",
    role: "action",
    actionType: "Email",
    summary: "Send an email notification.",
    details: "Uses your configured email service with HTML or text content.",
    tips: ["Provide recipient and subject.", "HTML is optional."],
    config: { to: "", subject: "", html: "", text: "" },
  },
  {
    id: "telegram",
    label: "Telegram",
    type: "Telegram",
    role: "action",
    actionType: "Telegram",
    summary: "Send a message to Telegram.",
    details: "Requires a bot token and the target chat ID.",
    tips: ["Create a bot via BotFather.", "Use the chat ID of your target."],
    config: { botToken: "", chatId: "", message: "", parseMode: "Markdown" },
  },
  {
    id: "database",
    label: "Database",
    type: "Database",
    role: "action",
    actionType: "Database",
    summary: "Run a database operation.",
    details: "Executes a Prisma operation against your database.",
    tips: ["Model name matches Prisma client.", "Args must be valid JSON."],
    config: { model: "", operation: "create", args: "{}" },
  },
  {
    id: "transformation",
    label: "Transformation",
    type: "Transformation",
    role: "action",
    actionType: "Transformation",
    summary: "Transform or filter the payload.",
    details: "Use an expression or mapping to shape data between steps.",
    tips: [
      "Expression returns new payload.",
      "Mapping can pick fields by path.",
    ],
    config: { expression: "", mapping: "{}" },
  },
];

const httpMethods = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const errorModes = ["fail", "pause"];
const telegramParseModes = ["Markdown", "MarkdownV2", "HTML"];
const dbOperations = [
  "create",
  "update",
  "upsert",
  "delete",
  "findMany",
  "findUnique",
];
const triggerTypeKeys = new Set(["webhook", "schedule", "cron", "email"]);

// Helper to create node data from palette ID (for templates)
function buildNodeFromPaletteId(paletteId: string, nodeId: string, position: { x: number; y: number }, configOverrides?: Record<string, unknown>): Node<NodeData> {
  const item = palette.find(p => p.id === paletteId);
  if (!item) {
    throw new Error(`Palette item not found: ${paletteId}`);
  }
  const role = item.role;
  const actionType = role === "action" ? (item.actionType ?? item.type) : item.type;
  return {
    id: nodeId,
    type: 'default',
    draggable: true,
    selectable: true,
    position,
    data: {
      label: item.label,
      type: item.type,
      role,
      actionType,
      config: { ...(item.config ?? {}), ...configOverrides }
    }
  };
}

// Workflow templates - using palette items
type WorkflowTemplateConfig = {
  id: string;
  nameKey: string;
  descriptionKey: string;
  blocks: { paletteId: string; position: { x: number; y: number }; config?: Record<string, unknown> }[];
};

const templateConfigs: WorkflowTemplateConfig[] = [
  {
    id: 'webhook-telegram',
    nameKey: 'templates.webhookTelegram.name',
    descriptionKey: 'templates.webhookTelegram.description',
    blocks: [
      { paletteId: 'webhook', position: { x: 100, y: 100 } },
      { paletteId: 'telegram', position: { x: 400, y: 100 }, config: { parseMode: 'HTML' } }
    ]
  },
  {
    id: 'cron-http-email',
    nameKey: 'templates.cronHttpEmail.name',
    descriptionKey: 'templates.cronHttpEmail.description',
    blocks: [
      { paletteId: 'schedule', position: { x: 50, y: 100 }, config: { cron: '0 9 * * *' } },
      { paletteId: 'http-request', position: { x: 300, y: 100 }, config: { method: 'GET' } },
      { paletteId: 'email-action', position: { x: 550, y: 100 }, config: { subject: 'Daily Report' } }
    ]
  },
  {
    id: 'email-transform-db',
    nameKey: 'templates.emailTransformDb.name',
    descriptionKey: 'templates.emailTransformDb.description',
    blocks: [
      { paletteId: 'email-trigger', position: { x: 50, y: 100 } },
      { paletteId: 'transformation', position: { x: 300, y: 100 }, config: { mode: 'map' } },
      { paletteId: 'database', position: { x: 550, y: 100 }, config: { operation: 'create' } }
    ]
  }
];

const templateItems = computed(() => [
  templateConfigs.map(template => ({
    label: t(template.nameKey),
    onSelect: () => loadTemplate(template)
  }))
]);

function loadTemplate(template: WorkflowTemplateConfig) {
  if (nodes.value.length > 0) {
    if (!confirm(t('templates.confirmReplace'))) {
      return;
    }
  }
  
  workflowName.value = t(template.nameKey);
  
  // Create nodes from palette items
  const newNodes: Node<NodeData>[] = [];
  const newEdges: Edge[] = [];
  
  template.blocks.forEach((block, index) => {
    const nodeId = `node-${index + 1}`;
    try {
      const node = buildNodeFromPaletteId(block.paletteId, nodeId, block.position, block.config);
      newNodes.push(normalizeLoadedNode(node, index));
      
      // Connect to previous node
      if (index > 0) {
        newEdges.push({
          id: `edge-${index}`,
          source: `node-${index}`,
          target: nodeId,
          type: 'smoothstep'
        });
      }
    } catch (e) {
      console.warn(`Failed to create node from palette: ${block.paletteId}`, e);
    }
  });
  
  nodes.value = newNodes;
  edges.value = newEdges;
  selectedNodeId.value = null;
  
  toast.add({
    title: t('templates.loaded'),
    description: t(template.descriptionKey),
    color: 'success'
  });
}

const nodes = ref<Node<NodeData>[]>([]);
const edges = ref<Edge[]>([]);
const selectedNodeId = ref<string | null>(null);
const selectedPaletteId = ref<string | null>(palette[0]?.id ?? null);
const flowWrapper = ref<HTMLDivElement | null>(null);
const workflowName = ref("Untitled workflow");
const workflowActive = ref(true);
const workflowId = ref<string | null>(null);
const saveError = ref<string | null>(null);
const saving = ref(false);
const toast = useToast();
const loadingWorkflow = ref(false);
const loadError = ref<string | null>(null);
const draggingItem = ref<PaletteItem | null>(null);
const blockDetailsExpanded = ref(true);

// IMAP testing state
const imapTesting = ref(false);
const imapTestResult = ref<{ ok: boolean; error?: string; mailboxes?: string[] } | null>(null);
const blocksMenuOpen = ref(false);
const nodeSettingsMenuOpen = ref(false);
const mobileHintDismissed = ref(false);
const multiSelectHintDismissed = ref(false);
const selectedEdgeId = ref<string | null>(null);
const telegramTesting = ref(false);
const telegramTestResult = ref<{ ok: boolean; message: string } | null>(null);

// HTTP Request test state
const httpTesting = ref(false);
const httpTestResult = ref<{ ok: boolean; status: number; data: string } | null>(null);

// Email content mode
const emailContentMode = ref<'html' | 'text' | 'both'>('html');

// Email provider settings
const emailProvider = ref<'gmail' | 'sendgrid' | 'resend'>('gmail');
const emailSmtpTesting = ref(false);
const emailSmtpTestResult = ref<{ ok: boolean; error?: string; details?: string } | null>(null);
const emailSending = ref(false);
const emailSendResult = ref<{ ok: boolean; error?: string; messageId?: string } | null>(null);

const emailProviders = [
  { id: 'gmail' as const, name: 'Gmail SMTP', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/></svg>' },
  { id: 'sendgrid' as const, name: 'SendGrid', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M0 8h8v8H0V8zm0 8h8v8H0v-8zm8 0h8v8H8v-8zm8 0h8v8h-8v-8zm0-8h8v8h-8V8zm-8 0h8v8H8V8zM8 0h8v8H8V0zm8 0h8v8h-8V0z"/></svg>' },
  { id: 'resend' as const, name: 'Resend', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L0 12l12 12 12-12L12 0zm0 3.2L20.8 12 12 20.8 3.2 12 12 3.2z"/></svg>' },
];

function setEmailProvider(provider: 'gmail' | 'sendgrid' | 'resend') {
  emailProvider.value = provider;
  updateTextConfig('emailProvider', provider);
  emailSmtpTestResult.value = null;
  emailSendResult.value = null;
}

// Auto-save emailProvider when Gmail fields are modified
function updateGmailConfig(key: string, value: string) {
  updateTextConfig(key, value);
  // Ensure emailProvider is saved as 'gmail' when Gmail fields are filled
  if (!selectedConfig.value.emailProvider || selectedConfig.value.emailProvider !== 'gmail') {
    updateTextConfig('emailProvider', 'gmail');
    emailProvider.value = 'gmail';
  }
}

// Auto-save emailProvider when SendGrid fields are modified
function updateSendGridConfig(key: string, value: string) {
  updateTextConfig(key, value);
  // Ensure emailProvider is saved as 'sendgrid' when SendGrid fields are filled
  if (!selectedConfig.value.emailProvider || selectedConfig.value.emailProvider !== 'sendgrid') {
    updateTextConfig('emailProvider', 'sendgrid');
    emailProvider.value = 'sendgrid';
  }
}

const canTestEmail = computed(() => {
  if (emailProvider.value === 'gmail') {
    return Boolean(selectedConfig.value.smtpEmail && selectedConfig.value.smtpPassword);
  }
  if (emailProvider.value === 'sendgrid') {
    return Boolean(selectedConfig.value.sendgridApiKey);
  }
  // Resend uses env key by default
  return true;
});

const canSendTestEmail = computed(() => {
  return canTestEmail.value && Boolean(selectedConfig.value.to);
});

async function testEmailConnection() {
  emailSmtpTesting.value = true;
  emailSmtpTestResult.value = null;
  
  try {
    const response = await fetch('/api/email/test-smtp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'test',
        provider: emailProvider.value,
        smtpEmail: selectedConfig.value.smtpEmail,
        smtpPassword: selectedConfig.value.smtpPassword,
        sendgridApiKey: selectedConfig.value.sendgridApiKey,
      }),
    });
    
    const data = await response.json();
    emailSmtpTestResult.value = data;
  } catch (error) {
    emailSmtpTestResult.value = { ok: false, error: String(error) };
  } finally {
    emailSmtpTesting.value = false;
  }
}

async function sendTestEmail() {
  emailSending.value = true;
  emailSendResult.value = null;
  
  try {
    const response = await fetch('/api/email/test-smtp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send',
        provider: emailProvider.value,
        smtpEmail: selectedConfig.value.smtpEmail,
        smtpPassword: selectedConfig.value.smtpPassword,
        sendgridApiKey: selectedConfig.value.sendgridApiKey,
        from: selectedConfig.value.from,
        to: selectedConfig.value.to,
        subject: selectedConfig.value.subject || 'Test Email from Finger Automation',
        html: selectedConfig.value.html,
        text: selectedConfig.value.text,
      }),
    });
    
    const data = await response.json();
    emailSendResult.value = data;
  } catch (error) {
    emailSendResult.value = { ok: false, error: String(error) };
  } finally {
    emailSending.value = false;
  }
}

// Transformation mode
const transformMode = ref<'expression' | 'mapping'>('expression');

// Mapping fields builder
const mappingFields = ref<{ key: string; value: string }[]>([{ key: '', value: '' }]);

// Clipboard state
const clipboardCopied = ref<string | null>(null);

// Cron presets
const cronPresets = [
  { value: '* * * * *', label: 'Every minute' },
  { value: '*/5 * * * *', label: 'Every 5 min' },
  { value: '*/15 * * * *', label: 'Every 15 min' },
  { value: '*/30 * * * *', label: 'Every 30 min' },
  { value: '0 * * * *', label: 'Every hour' },
  { value: '0 */6 * * *', label: 'Every 6 hours' },
  { value: '0 0 * * *', label: 'Daily at midnight' },
  { value: '0 9 * * *', label: 'Daily at 9 AM' },
  { value: '0 0 * * 0', label: 'Weekly (Sunday)' },
  { value: '0 0 1 * *', label: 'Monthly (1st)' },
];

// Common timezones
const commonTimezones = [
  'UTC',
  'Europe/Moscow',
  'Europe/London',
  'Europe/Paris',
  'America/New_York',
  'America/Los_Angeles',
  'Asia/Tokyo',
  'Asia/Shanghai',
];

// Стили для полей ввода - убираем ring ring-inset ring-accented в пассивном состоянии
// При фокусе добавляем ring-2 для визуального отличия
// Используем !important только для пассивного состояния, для focus - обычные классы
// Standard text styles
const textHeader = "text-[7px] 4xs:text-[8px] 3xs:text-[9px] 2xs:text-[10px] xs:text-[11px] sm:text-sm md:text-md lg:text-md 2xl:text-lg 3xl:text-lg/6 4xl:text-2xl/8 5xl:text-3xl/10 font-bold";
const textBody = "text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12";
const textSubtitle = "text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold";

const inputStyles = {
  root: 'ring-0',
  base: `ring-0 !ring-inset-0 bg-zinc-800 border border-orange-500 text-zinc-100 placeholder:text-zinc-500 focus:bg-zinc-800 focus:border-orange-500 focus:text-zinc-100 focus:!ring-2 focus:!ring-orange-500 focus:!ring-inset focus:ring-offset-0 focus-visible:!ring-2 focus-visible:!ring-orange-500 focus-visible:!ring-inset focus-visible:ring-offset-0 ${textBody}`
};

const titleInputStyles = {
  ...inputStyles,
  base: `ring-0 !ring-inset-0 bg-zinc-800 border border-orange-500 text-zinc-100 placeholder:text-zinc-500 focus:bg-zinc-800 focus:border-orange-500 focus:text-zinc-100 focus:!ring-2 focus:!ring-orange-500 focus:!ring-inset focus:ring-offset-0 focus-visible:!ring-2 focus-visible:!ring-orange-500 focus-visible:!ring-inset focus-visible:ring-offset-0 ${textHeader}`
};

const textareaStyles = {
  root: 'ring-0',
  base: `ring-0 !ring-inset-0 bg-zinc-800 border border-orange-500 text-zinc-100 placeholder:text-zinc-500 focus:bg-zinc-800 focus:border-orange-500 focus:text-zinc-100 focus:!ring-2 focus:!ring-orange-500 focus:!ring-inset focus:ring-offset-0 focus-visible:!ring-2 focus-visible:!ring-orange-500 focus-visible:!ring-inset focus-visible:ring-offset-0 ${textBody}`
};

const selectStyles = {
  root: 'ring-0',
  base: `ring-0 !ring-inset-0 bg-zinc-800 border border-orange-500 text-zinc-100 focus:bg-zinc-800 focus:border-orange-500 focus:text-zinc-100 focus:!ring-2 focus:!ring-orange-500 focus:!ring-inset focus:ring-offset-0 focus-visible:!ring-2 focus-visible:!ring-orange-500 focus-visible:!ring-inset focus-visible:ring-offset-0 ${textBody}`
};

const selectMenuStyles = {
  base: `ring-0 !ring-inset-0 bg-zinc-800 border border-orange-500 text-zinc-100 focus:bg-zinc-800 focus:border-orange-500 focus:text-zinc-100 focus:!ring-2 focus:!ring-orange-500 focus:!ring-inset focus:ring-offset-0 focus-visible:!ring-2 focus-visible:!ring-orange-500 focus-visible:!ring-inset focus-visible:ring-offset-0 ${textBody}`
};

// Стили для FormField - убираем text-default
const formFieldStyles = {
  label: '!text-zinc-100 font-semibold'
};

const selectedNode = computed(
  () =>
    nodes.value.find((node) => String(node.id) === selectedNodeId.value) ??
    null,
);
const selectedConfig = computed(() => {
  const data = selectedNode.value?.data;
  if (!data) {
    return {};
  }
  if (data.config && typeof data.config === "object") {
    return data.config as Record<string, unknown>;
  }
  return data as Record<string, unknown>;
});
const selectedType = computed(() =>
  normalizeNodeType(getNodeRawType(selectedNode.value)),
);
const selectedRole = computed(() => inferNodeRole(selectedNode.value));
const selectedActionType = computed(() =>
  selectedRole.value === "action" ? selectedType.value : "",
);
const selectedLabel = computed(
  () => selectedNode.value?.data?.label || selectedType.value || "Node",
);

// Telegram test helpers
const canTestTelegram = computed(() => {
  const config = selectedConfig.value;
  const botToken = String(config.botToken ?? '').trim();
  const chatId = String(config.chatId ?? '').trim();
  return botToken.length > 0 && chatId.length > 0;
});

async function testTelegramMessage() {
  if (!canTestTelegram.value || telegramTesting.value) return;

  const config = selectedConfig.value;
  const botToken = String(config.botToken ?? '').trim();
  const chatId = String(config.chatId ?? '').trim();
  const message = String(config.message ?? '').trim() || t('editor.telegram.testMessage');
  const parseMode = String(config.parseMode ?? 'Markdown');

  telegramTesting.value = true;
  telegramTestResult.value = null;

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: parseMode !== 'None' ? parseMode : undefined,
        }),
      }
    );

    const data = await response.json();

    if (response.ok && data.ok) {
      telegramTestResult.value = { ok: true, message: t('editor.telegram.testSuccess') };
    } else {
      const errorMsg = data.description || t('editor.telegram.testFailed');
      telegramTestResult.value = { ok: false, message: errorMsg };
    }
  } catch (error) {
    telegramTestResult.value = { 
      ok: false, 
      message: error instanceof Error ? error.message : t('editor.telegram.testFailed')
    };
  } finally {
    telegramTesting.value = false;
    // Clear result after 5 seconds
    setTimeout(() => {
      telegramTestResult.value = null;
    }, 5000);
  }
}

// HTTP Request test helpers
const canTestHttp = computed(() => {
  const config = selectedConfig.value;
  const url = String(config.url ?? '').trim();
  return url.length > 0 && (url.startsWith('http://') || url.startsWith('https://'));
});

// Clipboard copy helper
async function copyToClipboard(text: string, type: string = 'webhook') {
  try {
    await navigator.clipboard.writeText(text);
    clipboardCopied.value = type;
    setTimeout(() => {
      clipboardCopied.value = null;
    }, 2000);
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    clipboardCopied.value = type;
    setTimeout(() => {
      clipboardCopied.value = null;
    }, 2000);
  }
}

// IMAP connection test
async function testImapConnection() {
  if (imapTesting.value) return;

  const config = selectedConfig.value;
  const email = String(config.imapEmail ?? '').trim();
  const password = String(config.imapPassword ?? '').trim();

  if (!email || !password) {
    imapTestResult.value = { ok: false, error: t('editor.emailTrigger.enterCredentials') };
    return;
  }

  imapTesting.value = true;
  imapTestResult.value = null;

  try {
    const response = await $fetch<{
      ok: boolean;
      error?: string;
      mailboxes?: string[];
      server?: { host: string; port: number; autoDetected: boolean };
    }>('/api/email/test-imap', {
      method: 'POST',
      body: {
        email,
        password,
        host: config.imapHost || undefined,
        port: config.imapPort || undefined,
      },
    });

    imapTestResult.value = response;

    // Auto-fill server info if auto-detected
    if (response.ok && response.server?.autoDetected) {
      // Server was auto-detected, no need to fill
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    imapTestResult.value = { ok: false, error: message };
  } finally {
    imapTesting.value = false;

    // Clear result after 10 seconds
    setTimeout(() => {
      imapTestResult.value = null;
    }, 10000);
  }
}

async function testHttpRequest() {
  if (!canTestHttp.value || httpTesting.value) return;

  const config = selectedConfig.value;
  const url = String(config.url ?? '').trim();
  const method = String(config.method ?? 'GET').toUpperCase();
  const headersStr = String(config.headers ?? '{}');
  const body = String(config.body ?? '');

  let headers: Record<string, string> = {};
  try {
    headers = JSON.parse(headersStr);
  } catch {
    headers = {};
  }

  httpTesting.value = true;
  httpTestResult.value = null;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: ['GET', 'HEAD'].includes(method) ? undefined : (body || '{}'),
    });

    const contentType = response.headers.get('content-type') || '';
    let data: string;
    if (contentType.includes('application/json')) {
      const json = await response.json();
      data = JSON.stringify(json, null, 2);
    } else {
      data = await response.text();
    }
    
    // Truncate long responses
    if (data.length > 500) {
      data = data.substring(0, 500) + '\n... (truncated)';
    }

    httpTestResult.value = {
      ok: response.ok,
      status: response.status,
      data,
    };
  } catch (error) {
    httpTestResult.value = {
      ok: false,
      status: 0,
      data: error instanceof Error ? error.message : 'Request failed',
    };
  } finally {
    httpTesting.value = false;
  }
}

// Database helpers
const availableDbModels = [
  { value: 'user', label: 'User' },
  { value: 'workflow', label: 'Workflow' },
  { value: 'execution', label: 'Execution' },
  { value: 'executionStep', label: 'ExecutionStep' },
];

const dbOperationsWithDesc = computed(() => [
  { value: 'create', label: 'Create', desc: t('editor.db.opCreate') },
  { value: 'findMany', label: 'Find Many', desc: t('editor.db.opFindMany') },
  { value: 'findUnique', label: 'Find One', desc: t('editor.db.opFindUnique') },
  { value: 'update', label: 'Update', desc: t('editor.db.opUpdate') },
  { value: 'upsert', label: 'Upsert', desc: t('editor.db.opUpsert') },
  { value: 'delete', label: 'Delete', desc: t('editor.db.opDelete') },
]);

function getDbArgsPlaceholder(operation: string) {
  const placeholders: Record<string, string> = {
    create: '{"data": {"field": "value"}}',
    findMany: '{"where": {"status": "ACTIVE"}, "take": 10}',
    findUnique: '{"where": {"id": "..."}}',
    update: '{"where": {"id": "..."}, "data": {"field": "newValue"}}',
    upsert: '{"where": {"id": "..."}, "create": {...}, "update": {...}}',
    delete: '{"where": {"id": "..."}}',
  };
  return placeholders[operation] || '{}';
}

function getDbArgsExample(operation: string) {
  const examples: Record<string, string> = {
    create: `{
  "data": {
    "email": "user@example.com",
    "name": "New User"
  }
}`,
    findMany: `{
  "where": {
    "status": "ACTIVE"
  },
  "take": 10,
  "orderBy": { "createdAt": "desc" }
}`,
    findUnique: `{
  "where": {
    "id": "abc-123"
  }
}`,
    update: `{
  "where": { "id": "abc-123" },
  "data": {
    "name": "Updated Name"
  }
}`,
    upsert: `{
  "where": { "email": "user@example.com" },
  "create": { "email": "user@example.com", "name": "New" },
  "update": { "name": "Existing" }
}`,
    delete: `{
  "where": {
    "id": "abc-123"
  }
}`,
  };
  return examples[operation] || '{}';
}

function applyDbArgsTemplate(operation: string) {
  updateTextConfig('args', getDbArgsExample(operation));
}

function updateDbArgsTemplate(operation: string) {
  // Only update if args is empty or default
  const currentArgs = String(selectedConfig.value.args ?? '').trim();
  if (!currentArgs || currentArgs === '{}') {
    // Don't auto-apply, just let user see the placeholder
  }
}

// Transformation helpers
const expressionExamples = computed(() => [
  { desc: t('editor.transform.exPassthrough'), code: 'input' },
  { desc: t('editor.transform.exExtract'), code: 'input.user.email' },
  { desc: t('editor.transform.exTransform'), code: '({ name: input.firstName + " " + input.lastName, isAdult: input.age >= 18 })' },
  { desc: t('editor.transform.exFilter'), code: 'input.items.filter(item => item.active)' },
  { desc: t('editor.transform.exMath'), code: '({ total: input.price * input.quantity, tax: input.price * 0.2 })' },
]);

function addMappingField() {
  mappingFields.value.push({ key: '', value: '' });
}

function removeMappingField(index: number) {
  mappingFields.value.splice(index, 1);
  syncMappingToConfig();
}

function updateMappingField(index: number, field: 'key' | 'value', val: string) {
  const item = mappingFields.value[index];
  if (item) {
    item[field] = val;
  }
  syncMappingToConfig();
}

function syncMappingToConfig() {
  const mapping: Record<string, string> = {};
  for (const field of mappingFields.value) {
    if (field.key.trim()) {
      mapping[field.key.trim()] = field.value.trim() || 'input';
    }
  }
  updateTextConfig('mapping', JSON.stringify(mapping, null, 2));
}

// Watch mapping config changes to sync back to builder
watch(
  () => selectedConfig.value.mapping,
  (newMapping) => {
    try {
      const parsed = typeof newMapping === 'string' ? JSON.parse(newMapping) : newMapping;
      if (parsed && typeof parsed === 'object') {
        const entries = Object.entries(parsed);
        if (entries.length > 0) {
          mappingFields.value = entries.map(([key, value]) => ({
            key,
            value: String(value),
          }));
        }
      }
    } catch {
      // Invalid JSON, ignore
    }
  },
  { immediate: true }
);

const selectedPalette = computed(
  () => palette.find((item) => item.id === selectedPaletteId.value) ?? null,
);
const selectedHelp = computed(() => {
  if (!selectedRole.value || !selectedType.value) {
    return null;
  }
  const typeKey = normalizePaletteType(selectedType.value);
  return (
    palette.find(
      (item) =>
        item.role === selectedRole.value &&
        normalizePaletteType(item.type) === typeKey,
    ) ?? null
  );
});
const { t } = useI18n();

function getTranslatedPaletteItem(item: PaletteItem): PaletteItem {
  const key = item.id;
  const roleKey = item.role === "trigger" ? "trigger" : "action";
  
  return {
    ...item,
    summary: t(`editor.palette.${key}.summary`) || item.summary,
    details: t(`editor.palette.${key}.details`) || item.details,
    tips: item.tips?.map((tip, index) => 
      t(`editor.palette.${key}.tip${index + 1}`) || tip
    ) || [],
    role: item.role, // Keep original role for logic, translate only in display
  };
}

function getTranslatedRole(role: "trigger" | "action"): string {
  return t(`editor.palette.role.${role}`) || role;
}

const translatedPalette = computed(() => 
  palette.map(item => getTranslatedPaletteItem(item))
);

const translatedSelectedPalette = computed(() => 
  selectedPalette.value ? getTranslatedPaletteItem(selectedPalette.value) : null
);

const translatedSelectedHelp = computed(() => 
  selectedHelp.value ? getTranslatedPaletteItem(selectedHelp.value) : null
);

// Get all CONNECTED triggers (have at least one outgoing edge)
const connectedTriggers = computed(() => {
  const connectedNodeIds = new Set(edges.value.map(e => e.source));
  return nodes.value.filter(node => {
    const role = inferNodeRole(node);
    return role === "trigger" && connectedNodeIds.has(String(node.id));
  });
});

const triggerLabel = computed(() => {
  const connected = connectedTriggers.value;
  if (connected.length === 0) {
    return t("editor.notConnected");
  }
  if (connected.length === 1) {
    const first = connected[0];
    return first?.data?.label ?? t("editor.notSet");
  }
  // Multiple triggers - list them all
  return connected.map(n => n.data?.label ?? "?").join(", ");
});

watch(
  selectedHelp,
  (help) => {
    if (help) {
      selectedPaletteId.value = help.id;
    }
  },
  { immediate: true },
);

watch(selectedNode, (node) => {
  if (!node && selectedNodeId.value) {
    selectedNodeId.value = null;
  }
  
  // Initialize emailProvider from saved config when selecting Email action node
  if (node) {
    const nodeData = node.data as Record<string, unknown> | undefined;
    const config = (nodeData?.config ?? {}) as Record<string, unknown>;
    const role = String(nodeData?.role ?? '').toLowerCase();
    const actionType = String(nodeData?.actionType ?? nodeData?.type ?? '').toLowerCase();
    
    if (role === 'action' && actionType === 'email') {
      const savedProvider = config.emailProvider as string | undefined;
      if (savedProvider === 'gmail' || savedProvider === 'sendgrid' || savedProvider === 'resend') {
        emailProvider.value = savedProvider;
      } else if (config.smtpEmail || config.smtpPassword) {
        // If Gmail credentials exist but provider not saved, set to gmail
        emailProvider.value = 'gmail';
      } else if (config.sendgridApiKey) {
        // If SendGrid key exists but provider not saved, set to sendgrid
        emailProvider.value = 'sendgrid';
      } else {
        // Default to gmail for new nodes
        emailProvider.value = 'gmail';
      }
    }
  }
  
  // Reset test results when switching nodes
  emailSmtpTestResult.value = null;
  emailSendResult.value = null;
});

function normalizePaletteType(value: string) {
  const key = value.toLowerCase().trim();
  if (key === "cron" || key === "schedule") {
    return "schedule";
  }
  return key;
}

function normalizeNodeType(value: string) {
  const key = normalizePaletteType(value);
  if (!key) {
    return "";
  }
  if (key === "webhook") {
    return "Webhook";
  }
  if (key === "schedule") {
    return "Schedule";
  }
  if (key === "email") {
    return "Email";
  }
  if (key === "http request") {
    return "HTTP Request";
  }
  if (key === "telegram") {
    return "Telegram";
  }
  if (key === "database") {
    return "Database";
  }
  if (key === "transformation") {
    return "Transformation";
  }
  return value;
}

function getNodeRawType(node?: Node<NodeData> | null) {
  if (!node) {
    return "";
  }
  const data = node.data ?? {};
  return String(data.type ?? data.actionType ?? node.type ?? "");
}

function inferNodeRole(node?: Node<NodeData> | null) {
  if (!node) {
    return "";
  }

  const data = node.data ?? {};
  if (data.role) {
    return data.role;
  }
  if (data.actionType) {
    return "action";
  }

  const config =
    data.config && typeof data.config === "object"
      ? (data.config as Record<string, unknown>)
      : (data as Record<string, unknown>);

  const actionKeys = [
    "url",
    "method",
    "headers",
    "body",
    "to",
    "subject",
    "html",
    "text",
    "botToken",
    "chatId",
    "message",
    "parseMode",
    "model",
    "operation",
    "args",
    "expression",
    "mapping",
  ];

  const triggerKeys = ["cron", "timezone"];

  if (actionKeys.some((key) => key in config)) {
    return "action";
  }
  if (triggerKeys.some((key) => key in config)) {
    return "trigger";
  }

  const rawType = normalizePaletteType(getNodeRawType(node));
  if (!rawType) {
    return "";
  }
  return triggerTypeKeys.has(rawType) ? "trigger" : "action";
}

function getTriggerNode() {
  return nodes.value.find((node) => {
    return inferNodeRole(node) === "trigger";
  });
}

function normalizeLoadedNode(raw: Node<NodeData>, index: number) {
  const node = raw as Node<NodeData>;
  const data = node.data && typeof node.data === "object" ? node.data : {};
  const rawType = getNodeRawType({ ...node, data: data as NodeData });
  const type = normalizeNodeType(rawType);
  const role = inferNodeRole({ ...node, data: data as NodeData });
  const actionType =
    (data as NodeData).actionType ?? (role === "action" ? type : undefined);
  const config = {
    ...(data &&
    typeof (data as NodeData).config === "object" &&
    (data as NodeData).config
      ? (data as NodeData).config
      : {}),
  } as Record<string, unknown>;
  const configKeys = [
    "cron",
    "timezone",
    "url",
    "method",
    "headers",
    "body",
    "to",
    "subject",
    "html",
    "text",
    "botToken",
    "chatId",
    "message",
    "parseMode",
    "model",
    "operation",
    "args",
    "expression",
    "mapping",
    "retryCount",
    "retryDelayMs",
    "onError",
    "notifyEmail",
  ];
  for (const key of configKeys) {
    if (key in data && !(key in config)) {
      config[key] = (data as Record<string, unknown>)[key];
    }
  }
  if (role === "action" && type === "Telegram") {
    const parseMode = String(config.parseMode ?? "").trim();
    if (!parseMode) {
      config.parseMode = "Markdown";
    }
  }

  return {
    ...node,
    id: String(node.id ?? index),
    draggable: true,
    selectable: true,
    data: {
      ...(data as NodeData),
      label:
        typeof (data as NodeData).label === "string" &&
        (data as NodeData).label.trim()
          ? (data as NodeData).label
          : type || "Node",
      type,
      role,
      actionType,
      config,
    },
  };
}

const { project } = useVueFlow(flowId);
const runtimeConfig = useRuntimeConfig();
const appUrl = computed(() => runtimeConfig.public?.appUrl || "");
const webhookEndpoint = computed(() =>
  workflowId.value ? `${appUrl.value}/api/hooks/${workflowId.value}` : "",
);
const emailEndpoint = computed(() =>
  workflowId.value
    ? `${appUrl.value}/api/email/inbound/${workflowId.value}`
    : "",
);

function selectPalette(item: PaletteItem) {
  selectedPaletteId.value = item.id;
}

function createNodeFromPalette(
  item: PaletteItem,
  position: { x: number; y: number },
) {
  const nodeId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${item.id}-${Date.now()}`;
  const role = item.role;
  const actionType =
    role === "action" ? (item.actionType ?? item.type) : undefined;

  nodes.value = [
    ...nodes.value,
    {
      id: nodeId,
      type: "default",
      draggable: true,
      selectable: true,
      position,
      data: {
        label: item.label,
        type: item.type,
        role,
        actionType,
        config: { ...(item.config ?? {}) },
      },
    },
  ];

  return nodeId;
}

// Счетчик для смещения новых узлов
let nodeAddOffset = 0;

function addNodeFromPalette(item: PaletteItem) {
  selectPalette(item);
  if (!flowWrapper.value) {
    return;
  }

  const bounds = flowWrapper.value.getBoundingClientRect();
  
  // Смещаем каждый новый узел, чтобы они не накладывались
  const offset = nodeAddOffset * 40;
  nodeAddOffset = (nodeAddOffset + 1) % 10; // Сбрасываем после 10 узлов
  
  const position = project({
    x: bounds.width / 2 + offset,
    y: bounds.height / 2 + offset,
  });

  const nodeId = createNodeFromPalette(item, position);
  selectedNodeId.value = nodeId;
}

function onDragStart(event: DragEvent, item: PaletteItem) {
  selectPalette(item);
  draggingItem.value = item;
  if (!event.dataTransfer) {
    return;
  }
  event.dataTransfer.setData("text/plain", item.id);
  event.dataTransfer.setData("application/vueflow", JSON.stringify(item));
  event.dataTransfer.effectAllowed = "move";
}

function onDragEnd() {
  draggingItem.value = null;
}

function onDragOver(event: DragEvent) {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "move";
  }
}

function onDrop(event: DragEvent) {
  event.preventDefault();
  if (!flowWrapper.value) {
    return;
  }

  const raw = event.dataTransfer?.getData("application/vueflow");
  let item: PaletteItem | null = null;
  if (raw) {
    try {
      item = JSON.parse(raw) as PaletteItem;
    } catch {
      item = null;
    }
  }

  if (!item) {
    const fallbackId = event.dataTransfer?.getData("text/plain") ?? "";
    const normalizedFallback = fallbackId.trim().toLowerCase();
    item =
      palette.find((entry) => entry.id === fallbackId) ??
      palette.find(
        (entry) =>
          entry.label.toLowerCase() === normalizedFallback ||
          entry.type.toLowerCase() === normalizedFallback,
      ) ??
      (selectedPaletteId.value
        ? (palette.find((entry) => entry.id === selectedPaletteId.value) ??
          null)
        : null);
  }

  if (!item && draggingItem.value) {
    item = draggingItem.value;
  }

  if (!item) {
    return;
  }
  draggingItem.value = null;

  const bounds = flowWrapper.value.getBoundingClientRect();
  const position = project({
    x: event.clientX - bounds.left,
    y: event.clientY - bounds.top,
  });

  const nodeId = createNodeFromPalette(item, position);
  selectedNodeId.value = nodeId;
}

function onConnect(params: Connection) {
  edges.value = addEdge(params, edges.value) as Edge[];
}

function onNodeClick(
  event: { node?: Node<NodeData> } | Node<NodeData> | MouseEvent | null,
  nodeFromEvent?: Node<NodeData>,
) {
  const node = nodeFromEvent ?? (event && "node" in event ? event.node : event);
  if (!node?.id) {
    return;
  }
  selectedNodeId.value = String(node.id);
  
  // Open right panel on mobile when node is clicked
  if (typeof window !== "undefined" && window.innerWidth < 1024) {
    nodeSettingsMenuOpen.value = true;
  }
}

function clearSelection() {
  selectedNodeId.value = null;
  selectedEdgeId.value = null;
}

function onEdgeClick(event: EdgeMouseEvent) {
  const edge = event.edge;
  if (!edge?.id) {
    return;
  }
  selectedEdgeId.value = String(edge.id);
  selectedNodeId.value = null;
}

function removeEdgeById(edgeId: string) {
  edges.value = edges.value.filter((edge) => String(edge.id) !== edgeId);
  if (selectedEdgeId.value === edgeId) {
    selectedEdgeId.value = null;
  }
}

function removeSelectedEdge() {
  if (!selectedEdgeId.value) {
    return;
  }
  removeEdgeById(selectedEdgeId.value);
}

function removeNodeById(nodeId: string) {
  nodes.value = nodes.value.filter((node) => String(node.id) !== nodeId);
  edges.value = edges.value.filter(
    (edge) => edge.source !== nodeId && edge.target !== nodeId,
  );
  if (selectedNodeId.value === nodeId) {
    selectedNodeId.value = null;
  }
}

function removeSelectedNode() {
  if (!selectedNodeId.value) {
    return;
  }
  removeNodeById(selectedNodeId.value);
}

function handleKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null;
  const tagName = target?.tagName?.toLowerCase();
  if (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    target?.isContentEditable
  ) {
    return;
  }

  if (event.key === "Delete" || event.key === "Backspace") {
    event.preventDefault();
    if (selectedEdgeId.value) {
      removeSelectedEdge();
    } else if (selectedNodeId.value) {
      removeSelectedNode();
    }
  }
}

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
});

function updateSelectedConfig(patch: Record<string, unknown>) {
  if (!selectedNode.value) {
    return;
  }

  nodes.value = nodes.value.map((node) => {
    if (node.id !== selectedNode.value?.id) {
      return node;
    }
    const data = (node.data ?? {}) as NodeData;
    const nextConfig = { ...(data.config ?? {}), ...patch };
    return {
      ...node,
      data: {
        ...data,
        config: nextConfig,
      },
    };
  });
}

function updateTextConfig(key: string, value: string | number) {
  updateSelectedConfig({ [key]: value });
}

function updateNumberConfig(key: string, value: string | number) {
  const numeric = Number(value);
  updateSelectedConfig({
    [key]: Number.isFinite(numeric) ? numeric : 0,
  });
}

function formatJsonConfig(value: unknown, fallback = "") {
  if (typeof value === "string") {
    return value;
  }
  if (value && typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return fallback;
    }
  }
  return fallback;
}

async function loadWorkflow(id: string) {
  loadingWorkflow.value = true;
  loadError.value = null;
  try {
    const response = await $fetch<{
      id: string;
      name: string;
      status: "ACTIVE" | "INACTIVE";
      graphData: { nodes?: Node<NodeData>[]; edges?: Edge[] };
    }>(`/api/workflows/${id}`, {
      credentials: "include",
    });

    workflowId.value = response.id;
    workflowName.value = response.name;
    workflowActive.value = response.status === "ACTIVE";
    nodes.value = Array.isArray(response.graphData?.nodes)
      ? response.graphData.nodes.map((node, index) =>
          normalizeLoadedNode(node as Node<NodeData>, index),
        )
      : [];
    edges.value = Array.isArray(response.graphData?.edges)
      ? response.graphData.edges
      : [];
    selectedNodeId.value = null;
  } catch (error) {
    loadError.value = getErrorMessage(error);
  } finally {
    loadingWorkflow.value = false;
  }
}

watch(
  () => props.workflowId,
  (id) => {
    if (id) {
      void loadWorkflow(id);
    }
  },
  { immediate: true },
);

async function saveWorkflow() {
  saveError.value = null;

  const name = workflowName.value.trim();
  if (!name) {
    saveError.value = t("editor.workflowNameRequired");
    return;
  }

  const triggerType = resolveTriggerType();
  if (!triggerType) {
    saveError.value = t("editor.addTriggerBeforeSaving");
    return;
  }

  const payload = {
    name,
    status: workflowActive.value ? "ACTIVE" : "INACTIVE",
    triggerType,
    graphData: {
      nodes: nodes.value,
      edges: edges.value,
    },
  };

  saving.value = true;
  try {
    if (workflowId.value) {
      const response = await $fetch<{ id: string }>(
        `/api/workflows/${workflowId.value}`,
        {
          method: "PUT",
          body: payload,
          credentials: "include",
        },
      );
      workflowId.value = response.id ?? workflowId.value;
      toast.add({
        title: t("editor.saved"),
        description: t("editor.workflowUpdated"),
        color: "success",
        timeout: 3000,
      });
    } else {
      const response = await $fetch<{ id: string }>("/api/workflows", {
        method: "POST",
        body: payload,
        credentials: "include",
      });
      workflowId.value = response.id ?? null;
      toast.add({
        title: t("editor.saved"),
        description: t("editor.workflowSaved"),
        color: "success",
        timeout: 3000,
      });
    }
  } catch (error) {
    saveError.value = getErrorMessage(error);
  } finally {
    saving.value = false;
  }
}

function resolveTriggerType() {
  const triggerNode = getTriggerNode();
  const raw = normalizePaletteType(getNodeRawType(triggerNode));
  if (!raw) {
    return null;
  }
  if (raw === "schedule") {
    return "CRON";
  }
  if (raw === "email") {
    return "EMAIL";
  }
  return "WEBHOOK";
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object") {
    const data = (
      error as { data?: { statusMessage?: string; message?: string } }
    ).data;
    if (data?.statusMessage) {
      return data.statusMessage;
    }
    if (data?.message) {
      return data.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Unexpected error.";
}
</script>

<style scoped>
/* Переопределяем ring при фокусе для полей ввода */
:deep([data-slot="base"]:focus),
:deep(input[data-slot="base"]:focus),
:deep(textarea[data-slot="base"]:focus),
:deep(select[data-slot="base"]:focus) {
  --tw-ring-width: 2px !important;
  --tw-ring-color: rgb(249 115 22) !important; /* orange-500 */
  --tw-ring-inset: inset !important;
  box-shadow: inset 0 0 0 2px rgb(249 115 22) !important;
}

:deep([data-slot="base"]:focus-visible),
:deep(input[data-slot="base"]:focus-visible),
:deep(textarea[data-slot="base"]:focus-visible),
:deep(select[data-slot="base"]:focus-visible) {
  --tw-ring-width: 2px !important;
  --tw-ring-color: rgb(249 115 22) !important;
  --tw-ring-inset: inset !important;
  box-shadow: inset 0 0 0 2px rgb(249 115 22) !important;
}

/* Стили для узлов Vue Flow */
:deep(.vue-flow__node),
:deep(.vue-flow__node.vue-flow__node-default),
:deep(.vue-flow__node.nopan),
:deep(.vue-flow__node.draggable),
:deep(.vue-flow__node.selectable) {
  background-color: rgb(249 115 22) !important; /* bg-orange-500 */
  color: rgb(9 9 11) !important; /* text-zinc-950 */
  border-radius: 8px !important;
  padding: 10px 16px !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  transition: background-color 0.15s ease !important;
}

/* Hover - только изменение цвета */
:deep(.vue-flow__node:hover) {
  background-color: rgb(251, 146, 60) !important; /* orange-400 */
}

/* Выбранный узел */
:deep(.vue-flow__node.selected) {
  background-color: rgb(234, 88, 12) !important; /* orange-600 */
}

/* Стили для текста внутри узлов */
:deep(.vue-flow__node *),
:deep(.vue-flow__node.vue-flow__node-default *) {
  color: rgb(9 9 11) !important; /* text-zinc-950 */
}

/* Стили для соединений */
:deep(.vue-flow__edge-path) {
  stroke: rgb(249 115 22) !important;
  stroke-width: 2px !important;
}

:deep(.vue-flow__edge.selected .vue-flow__edge-path),
:deep(.custom-edge.edge-selected) {
  stroke: rgb(251 146 60) !important; /* orange-400 */
  stroke-width: 3px !important;
}

/* Custom node styles */
:deep(.custom-node) {
  position: relative;
  background-color: rgb(249 115 22); /* bg-orange-500 */
  color: rgb(9 9 11); /* text-zinc-950 */
  border-radius: 8px;
  padding: 10px 16px;
  font-weight: 600;
  min-width: 120px;
  text-align: center;
}

:deep(.custom-node .node-label) {
  color: rgb(9 9 11);
  font-weight: 600;
}

/* Handle styles - Input (target) */
:deep(.handle-input) {
  width: 14px !important;
  height: 14px !important;
  background-color: rgb(34 197 94) !important; /* green-500 */
  border: 2px solid rgb(22 163 74) !important; /* green-600 */
  border-radius: 50% !important;
  cursor: crosshair !important;
}

:deep(.handle-input::before) {
  content: 'IN';
  position: absolute;
  left: -24px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 8px;
  font-weight: 700;
  color: rgb(34 197 94);
  text-shadow: 0 0 2px rgba(0,0,0,0.5);
}

/* Handle styles - Output (source) */
:deep(.handle-output) {
  width: 14px !important;
  height: 14px !important;
  background-color: rgb(59 130 246) !important; /* blue-500 */
  border: 2px solid rgb(37 99 235) !important; /* blue-600 */
  border-radius: 50% !important;
  cursor: crosshair !important;
}

:deep(.handle-output::after) {
  content: 'OUT';
  position: absolute;
  right: -28px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 8px;
  font-weight: 700;
  color: rgb(59 130 246);
  text-shadow: 0 0 2px rgba(0,0,0,0.5);
}

/* Edge delete button */
.edge-delete-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background-color: rgb(239 68 68); /* red-500 */
  border-radius: 50%;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease, transform 0.2s ease;
  z-index: 100;
}

.edge-delete-button:hover {
  background-color: rgb(220 38 38); /* red-600 */
  transform: scale(1.1);
}

.edge-delete-button.visible {
  opacity: 1;
}

.edge-delete-button svg {
  color: white;
}

/* Show delete button on edge hover */
:deep(.vue-flow__edge:hover) + .edge-delete-button,
:deep(.vue-flow__edge.selected) + .edge-delete-button {
  opacity: 1;
}

/* Vue Flow handle overrides for default nodes */
:deep(.vue-flow__handle) {
  width: 14px !important;
  height: 14px !important;
  border-radius: 50% !important;
}

:deep(.vue-flow__handle-left),
:deep(.vue-flow__handle[data-handlepos="left"]) {
  background-color: rgb(34 197 94) !important; /* green-500 - input */
  border: 2px solid rgb(22 163 74) !important;
}

:deep(.vue-flow__handle-right),
:deep(.vue-flow__handle[data-handlepos="right"]) {
  background-color: rgb(59 130 246) !important; /* blue-500 - output */
  border: 2px solid rgb(37 99 235) !important;
}

:deep(.vue-flow__handle-top),
:deep(.vue-flow__handle[data-handlepos="top"]) {
  background-color: rgb(34 197 94) !important; /* green-500 - input */
  border: 2px solid rgb(22 163 74) !important;
}

:deep(.vue-flow__handle-bottom),
:deep(.vue-flow__handle[data-handlepos="bottom"]) {
  background-color: rgb(59 130 246) !important; /* blue-500 - output */
  border: 2px solid rgb(37 99 235) !important;
}
</style>
