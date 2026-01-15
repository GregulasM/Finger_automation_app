<script setup lang="ts">
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  Handle,
  Position,
  VueFlow,
} from "@vue-flow/core";
import { useWorkflowEditorContext } from "./workflowEditorContext";

const {
  flowId,
  nodes,
  edges,
  selectedEdgeId,
  flowWrapper,
  onDrop,
  onDragOver,
  onConnect,
  onNodeClick,
  onEdgeClick,
  clearSelection,
  removeEdgeById,
} = useWorkflowEditorContext();
</script>

<template>
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
        <template #node-default="{ data, sourcePosition, targetPosition }">
          <div class="custom-node">
            <Handle
              type="target"
              :position="targetPosition || Position.Left"
              class="handle-input"
            />
            <div class="node-label flex items-center justify-center gap-1">
              <span class="text-[10px] text-zinc-900/70">
                {{ data.role ? `(${data.role[0].toUpperCase()})` : "" }}
              </span>
              <span>{{ data.label }}</span>
            </div>
            <Handle
              type="source"
              :position="sourcePosition || Position.Right"
              class="handle-output"
            />
          </div>
        </template>

        <template
          #edge-default="{
            id,
            sourceX,
            sourceY,
            targetX,
            targetY,
            sourcePosition,
            targetPosition,
            markerEnd,
            selected,
          }"
        >
          <BaseEdge
            :id="id"
            :path="
              getSmoothStepPath({
                sourceX,
                sourceY,
                targetX,
                targetY,
                sourcePosition,
                targetPosition,
              })[0]
            "
            :marker-end="markerEnd"
            :class="[
              'custom-edge',
              { 'edge-selected': selected || selectedEdgeId === id },
            ]"
          />
          <EdgeLabelRenderer>
            <div
              :style="{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${(sourceX + targetX) / 2}px, ${(sourceY + targetY) / 2}px)`,
                pointerEvents: 'all',
              }"
              class="edge-delete-button"
              :class="{ visible: selected || selectedEdgeId === id }"
              @click.stop="removeEdgeById(id)"
            >
              <svg
                class="w-3 h-3"
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
            </div>
          </EdgeLabelRenderer>
        </template>
      </VueFlow>
    </ClientOnly>
  </div>
</template>
