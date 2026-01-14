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
      <!-- Mobile menu buttons -->
      <button
        v-if="!blocksMenuOpen"
        type="button"
        @click="blocksMenuOpen = true"
        class="lg:hidden fixed left-2 top-1/2 -translate-y-1/2 z-30 rounded-md border border-orange-500/30 bg-zinc-800/90 px-2 py-2 text-zinc-100 hover:border-orange-500/70 hover:bg-zinc-800 transition"
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
        class="lg:hidden fixed right-2 top-1/2 -translate-y-1/2 z-30 rounded-md border border-orange-500/30 bg-zinc-800/90 px-2 py-2 text-zinc-100 hover:border-orange-500/70 hover:bg-zinc-800 transition"
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

      <!-- Overlay for mobile -->
      <div
        v-if="blocksMenuOpen || nodeSettingsMenuOpen"
        class="lg:hidden fixed inset-0 bg-zinc-950/50 z-20"
        @click="blocksMenuOpen = false; nodeSettingsMenuOpen = false"
      ></div>

      <!-- Blocks sidebar -->
      <aside
        :class="[
          'flex w-64 flex-shrink-0 flex-col border-r border-orange-500/30 bg-zinc-800/90 p-3 4xs:p-4',
          'fixed lg:static inset-y-0 left-0 z-30 lg:z-auto',
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
            class="group flex w-full select-none flex-col gap-1 rounded-lg border px-2 4xs:px-3 py-2 text-left transition cursor-grab active:cursor-grabbing"
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
            :snap-to-grid="true"
            :snap-grid="[20, 20]"
            :only-render-visible-elements="true"
            @connect="onConnect"
            @node-click="onNodeClick"
            @pane-click="clearSelection"
          />
        </ClientOnly>
      </div>

      <!-- Node settings sidebar -->
      <aside
        :class="[
          'flex w-80 flex-shrink-0 flex-col border-l border-orange-500/30 bg-zinc-800/90 max-w-[30vw] min-w-0',
          'fixed lg:static inset-y-0 right-0 z-30 lg:z-auto',
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
                  {{ selectedHelp?.label || selectedLabel }}
                </div>
                <p
                  class="mt-1 text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/70"
                >
                  {{
                    selectedHelp?.details ||
                    t("editor.configureBlock")
                  }}
                </p>
                <div
                  v-if="selectedHelp?.tips?.length"
                  class="mt-2 space-y-1 text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/70"
                >
                  <div v-for="tip in selectedHelp.tips" :key="tip">
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
                  <UFormField :label="t('editor.botToken')" :ui="formFieldStyles">
                    <UInput
                      :model-value="String(selectedConfig.botToken ?? '')"
                      placeholder="123456:ABC..."
                      :ui="inputStyles"
                      @update:model-value="
                        (value) => updateTextConfig('botToken', String(value))
                      "
                    />
                  </UFormField>
                  <UFormField :label="t('editor.chatId')" :ui="formFieldStyles">
                    <UInput
                      :model-value="String(selectedConfig.chatId ?? '')"
                      placeholder="123456789"
                      :ui="inputStyles"
                      @update:model-value="
                        (value) => updateTextConfig('chatId', String(value))
                      "
                    />
                  </UFormField>
                  <UFormField :label="t('editor.message')" :ui="formFieldStyles">
                    <UTextarea
                      :model-value="String(selectedConfig.message ?? '')"
                      placeholder="Workflow completed"
                      :ui="textareaStyles"
                      @update:model-value="
                        (value) => updateTextConfig('message', String(value))
                      "
                    />
                  </UFormField>
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
                  </UFormField>
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
  type Connection,
  type Edge,
  type Node,
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

function addNodeFromPalette(item: PaletteItem) {
  selectPalette(item);
  if (!flowWrapper.value) {
    return;
  }

  const bounds = flowWrapper.value.getBoundingClientRect();
  const position = project({
    x: bounds.width / 2,
    y: bounds.height / 2,
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
  edges.value = addEdge(params, edges.value);
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
}

function clearSelection() {
  selectedNodeId.value = null;
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
  if (!selectedNodeId.value) {
    return;
  }
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
    removeSelectedNode();
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
}

/* Стили для текста внутри узлов */
:deep(.vue-flow__node *),
:deep(.vue-flow__node.vue-flow__node-default *) {
  color: rgb(9 9 11) !important; /* text-zinc-950 */
}
</style>
