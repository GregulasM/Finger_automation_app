<template>
  <div class="h-full flex flex-col space-y-3 4xs:space-y-4">
    <div
      class="flex flex-wrap items-center justify-between gap-3 rounded-xl 4xs:rounded-2xl border border-orange-500/30 bg-zinc-800/90 px-3 4xs:px-4 py-3"
    >
      <div class="flex flex-1 flex-wrap items-center gap-3">
        <UInput
          v-model="workflowName"
          :placeholder="t('editor.workflowName')"
          class="min-w-[220px] flex-1"
          :ui="inputStyles"
        />
        <div
          class="flex items-center gap-2 text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/70"
        >
          <USwitch v-model="workflowActive" :ui="{ root: 'ring-0' }" />
          <span>{{ t("editor.active") }}</span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <UBadge color="neutral" variant="soft" :ui="{ root: 'ring-0', base: 'bg-zinc-800 border-orange-500/30 text-zinc-100' }">
          {{ t("editor.trigger") }}: {{ triggerLabel }}
        </UBadge>
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
      color="red"
      variant="soft"
      :title="t('editor.saveFailed')"
      :description="saveError"
      :ui="{ root: 'ring-0' }"
    />
    <UAlert
      v-if="loadError"
      color="red"
      variant="soft"
      :title="t('editor.loadFailed')"
      :description="loadError"
      :ui="{ root: 'ring-0' }"
    />

    <div
      class="flex flex-row flex-1 min-h-0 w-full overflow-hidden rounded-xl 4xs:rounded-2xl border border-orange-500/30 bg-zinc-800/50 relative"
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
            <div class="flex items-center justify-between gap-2">
              <span
                class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold"
              >
                {{ item.label }}
              </span>
              <span
                class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 uppercase text-zinc-100/50"
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
                <div v-if="selectedType === 'Webhook'" class="space-y-3">
                  <UFormField :label="t('editor.webhookUrl')" :ui="formFieldStyles">
                    <UInput
                      :model-value="webhookEndpoint"
                      :placeholder="t('editor.saveToGenerateWebhook')"
                      readonly
                      :ui="inputStyles"
                    />
                  </UFormField>
                  <div v-if="!workflowId" class="flex items-center gap-2">
                    <UButton
                      size="xs"
                      color="primary"
                      variant="soft"
                      :loading="saving"
                      :ui="{ root: 'ring-0' }"
                      @click="saveWorkflow"
                    >
                      {{ t("editor.generateEndpoint") }}
                    </UButton>
                    <span
                      class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/70"
                    >
                      {{ t("editor.savingCreatesUrl") }}
                    </span>
                  </div>
                </div>

                <div v-if="selectedType === 'Schedule'" class="space-y-3">
                  <UFormField :label="t('editor.cronExpression')" :ui="formFieldStyles">
                    <UInput
                      :model-value="String(selectedConfig.cron ?? '')"
                      placeholder="*/5 * * * *"
                      :ui="inputStyles"
                      @update:model-value="
                        (value) => updateTextConfig('cron', String(value))
                      "
                    />
                  </UFormField>
                  <UFormField :label="t('editor.timezone')" :ui="formFieldStyles">
                    <UInput
                      :model-value="String(selectedConfig.timezone ?? 'UTC')"
                      placeholder="UTC"
                      :ui="inputStyles"
                      @update:model-value="
                        (value) => updateTextConfig('timezone', String(value))
                      "
                    />
                  </UFormField>
                </div>

                <div v-if="selectedType === 'Email'" class="space-y-3">
                  <UFormField :label="t('editor.inboundEmailEndpoint')" :ui="formFieldStyles">
                    <UInput
                      :model-value="emailEndpoint"
                      :placeholder="t('editor.saveToGenerateEmail')"
                      readonly
                      :ui="inputStyles"
                    />
                  </UFormField>
                  <div v-if="!workflowId" class="flex items-center gap-2">
                    <UButton
                      size="xs"
                      color="primary"
                      variant="soft"
                      :loading="saving"
                      :ui="{ root: 'ring-0' }"
                      @click="saveWorkflow"
                    >
                      {{ t("editor.generateEndpoint") }}
                    </UButton>
                    <span
                      class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/70"
                    >
                      {{ t("editor.saveOnceForUrl") }}
                    </span>
                  </div>
                  <div
                    class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/70"
                  >
                    {{ t("editor.configureEmailProvider") }}
                  </div>
                </div>
              </div>

              <div v-if="selectedRole === 'action'" class="space-y-6">
                <div
                  v-if="selectedActionType === 'HTTP Request'"
                  class="space-y-4"
                >
                  <UFormField :label="t('editor.url')" :ui="formFieldStyles">
                    <UInput
                      :model-value="String(selectedConfig.url ?? '')"
                      placeholder="https://api.example.com"
                      :ui="inputStyles"
                      @update:model-value="
                        (value) => updateTextConfig('url', String(value))
                      "
                    />
                  </UFormField>
                  <UFormField :label="t('editor.method')" :ui="formFieldStyles">
                    <USelect
                      :items="httpMethods"
                      :model-value="String(selectedConfig.method ?? 'POST')"
                      :ui="selectStyles"
                      @update:model-value="
                        (value) => updateTextConfig('method', String(value))
                      "
                    />
                  </UFormField>
                  <UFormField :label="t('editor.headers')" :ui="formFieldStyles">
                    <UTextarea
                      :model-value="
                        formatJsonConfig(selectedConfig.headers, '{}')
                      "
                      placeholder='{"Authorization":"Bearer ..."}'
                      :ui="textareaStyles"
                      @update:model-value="
                        (value) => updateTextConfig('headers', String(value))
                      "
                    />
                  </UFormField>
                  <UFormField :label="t('editor.body')" :ui="formFieldStyles">
                    <UTextarea
                      :model-value="String(selectedConfig.body ?? '')"
                      placeholder='{"id":"123"}'
                      :ui="textareaStyles"
                      @update:model-value="
                        (value) => updateTextConfig('body', String(value))
                      "
                    />
                  </UFormField>
                </div>

                <div v-if="selectedActionType === 'Email'" class="space-y-4">
                  <UFormField :label="t('editor.to')" :ui="formFieldStyles">
                    <UInput
                      :model-value="String(selectedConfig.to ?? '')"
                      placeholder="user@example.com"
                      :ui="inputStyles"
                      @update:model-value="
                        (value) => updateTextConfig('to', String(value))
                      "
                    />
                  </UFormField>
                  <UFormField :label="t('editor.subject')" :ui="formFieldStyles">
                    <UInput
                      :model-value="String(selectedConfig.subject ?? '')"
                      placeholder="Workflow update"
                      :ui="inputStyles"
                      @update:model-value="
                        (value) => updateTextConfig('subject', String(value))
                      "
                    />
                  </UFormField>
                  <UFormField :label="t('editor.html')" :ui="formFieldStyles">
                    <UTextarea
                      :model-value="String(selectedConfig.html ?? '')"
                      placeholder="<p>Hello!</p>"
                      :ui="textareaStyles"
                      @update:model-value="
                        (value) => updateTextConfig('html', String(value))
                      "
                    />
                  </UFormField>
                  <UFormField :label="t('editor.text')" :ui="formFieldStyles">
                    <UTextarea
                      :model-value="String(selectedConfig.text ?? '')"
                      placeholder="Plain text fallback"
                      :ui="textareaStyles"
                      @update:model-value="
                        (value) => updateTextConfig('text', String(value))
                      "
                    />
                  </UFormField>
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

                <div v-if="selectedActionType === 'Database'" class="space-y-4">
                  <UFormField :label="t('editor.model')" :ui="formFieldStyles">
                    <UInput
                      :model-value="String(selectedConfig.model ?? '')"
                      placeholder="user"
                      :ui="inputStyles"
                      @update:model-value="
                        (value) => updateTextConfig('model', String(value))
                      "
                    />
                  </UFormField>
                  <UFormField :label="t('editor.operation')" :ui="formFieldStyles">
                    <USelect
                      :items="dbOperations"
                      :model-value="
                        String(selectedConfig.operation ?? 'create')
                      "
                      :ui="selectStyles"
                      @update:model-value="
                        (value) => updateTextConfig('operation', String(value))
                      "
                    />
                  </UFormField>
                  <UFormField :label="t('editor.args')" :ui="formFieldStyles">
                    <UTextarea
                      :model-value="formatJsonConfig(selectedConfig.args, '{}')"
                      placeholder='{"data":{"email":"user@example.com"}}'
                      :ui="textareaStyles"
                      @update:model-value="
                        (value) => updateTextConfig('args', String(value))
                      "
                    />
                  </UFormField>
                </div>

                <div
                  v-if="selectedActionType === 'Transformation'"
                  class="space-y-4"
                >
                  <UFormField :label="t('editor.expression')" :ui="formFieldStyles">
                    <UTextarea
                      :model-value="String(selectedConfig.expression ?? '')"
                      placeholder="input.amount > 100"
                      :ui="textareaStyles"
                      @update:model-value="
                        (value) => updateTextConfig('expression', String(value))
                      "
                    />
                  </UFormField>
                  <UFormField :label="t('editor.mapping')" :ui="formFieldStyles">
                    <UTextarea
                      :model-value="
                        formatJsonConfig(selectedConfig.mapping, '{}')
                      "
                      placeholder='{"total":"input.amount"}'
                      :ui="textareaStyles"
                      @update:model-value="
                        (value) => updateTextConfig('mapping', String(value))
                      "
                    />
                  </UFormField>
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
const blocksMenuOpen = ref(false);
const nodeSettingsMenuOpen = ref(false);
const mobileHintDismissed = ref(false);
const selectedEdgeId = ref<string | null>(null);
const telegramTesting = ref(false);
const telegramTestResult = ref<{ ok: boolean; message: string } | null>(null);

// Стили для полей ввода - убираем ring ring-inset ring-accented в пассивном состоянии
// При фокусе добавляем ring-2 для визуального отличия
// Используем !important только для пассивного состояния, для focus - обычные классы
const inputStyles = {
  root: 'ring-0',
  base: 'ring-0 !ring-inset-0 bg-zinc-800 border border-orange-500 text-zinc-100 placeholder:text-zinc-500 focus:bg-zinc-800 focus:border-orange-500 focus:text-zinc-100 focus:!ring-2 focus:!ring-orange-500 focus:!ring-inset focus:ring-offset-0 focus-visible:!ring-2 focus-visible:!ring-orange-500 focus-visible:!ring-inset focus-visible:ring-offset-0'
};

const textareaStyles = {
  root: 'ring-0',
  base: 'ring-0 !ring-inset-0 bg-zinc-800 border border-orange-500 text-zinc-100 placeholder:text-zinc-500 focus:bg-zinc-800 focus:border-orange-500 focus:text-zinc-100 focus:!ring-2 focus:!ring-orange-500 focus:!ring-inset focus:ring-offset-0 focus-visible:!ring-2 focus-visible:!ring-orange-500 focus-visible:!ring-inset focus-visible:ring-offset-0'
};

const selectStyles = {
  root: 'ring-0',
  base: 'ring-0 !ring-inset-0 bg-zinc-800 border border-orange-500 text-zinc-100 focus:bg-zinc-800 focus:border-orange-500 focus:text-zinc-100 focus:!ring-2 focus:!ring-orange-500 focus:!ring-inset focus:ring-offset-0 focus-visible:!ring-2 focus-visible:!ring-orange-500 focus-visible:!ring-inset focus-visible:ring-offset-0'
};

const selectMenuStyles = {
  base: 'ring-0 !ring-inset-0 bg-zinc-800 border border-orange-500 text-zinc-100 focus:bg-zinc-800 focus:border-orange-500 focus:text-zinc-100 focus:!ring-2 focus:!ring-orange-500 focus:!ring-inset focus:ring-offset-0 focus-visible:!ring-2 focus-visible:!ring-orange-500 focus-visible:!ring-inset focus-visible:ring-offset-0'
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

const triggerLabel = computed(() => {
  const triggerNode = getTriggerNode();
  return triggerNode?.data?.label ?? t("editor.notSet");
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
        color: "green",
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
        color: "green",
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
