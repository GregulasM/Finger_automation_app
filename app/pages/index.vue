<script setup lang="ts">
const { t } = useI18n();
</script>

<template>
  <div class="fixed inset-0 bg-zinc-950 overflow-hidden flex flex-col pt-10 4xs:pt-10 3xs:pt-11 2xs:pt-12 xs:pt-14 sm:pt-12 lg:pt-16 xl:pt-18 2xl:pt-20 3xl:pt-24 4xl:pt-28 5xl:pt-32">
    <div class="flex-1 overflow-y-auto flex flex-col px-2 4xs:px-3 3xs:px-4 xs:px-6 py-4 4xs:py-6 3xs:py-8">
      <div class="grid items-center gap-6 4xs:gap-8 3xs:gap-10 xs:gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div class="space-y-3 4xs:space-y-4 3xs:space-y-5 xs:space-y-6">
          <p
            class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold uppercase tracking-[0.35em] text-orange-500"
          >
            Finger Automation
          </p>
          <h1
            class="text-[7px] 4xs:text-[8px] 3xs:text-[9px] 2xs:text-[10px] xs:text-[11px] sm:text-sm md:text-md lg:text-md 2xl:text-lg 3xl:text-lg/6 4xl:text-2xl/8 5xl:text-3xl/10 font-bold text-zinc-100"
          >
            {{ t("index.title") }}
          </h1>
          <p
            class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/80"
          >
            {{ t("index.description") }}
          </p>
          <div
            class="flex flex-wrap items-center gap-2 4xs:gap-3 3xs:gap-3 xs:gap-4"
          >
            <NuxtLink
              to="/workflows/editor"
              class="rounded-md border border-orange-500 bg-orange-500 px-3 4xs:px-4 3xs:px-5 xs:px-6 py-2 4xs:py-2.5 3xs:py-3 text-zinc-950 transition hover:brightness-110"
            >
              <span
                class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold"
              >
                {{ t("nav.openWorkflowEditor") }}
              </span>
            </NuxtLink>
            <NuxtLink
              to="/workflows"
              class="rounded-md border border-orange-500/30 bg-zinc-800/90 px-3 4xs:px-4 3xs:px-5 xs:px-6 py-2 4xs:py-2.5 3xs:py-3 text-zinc-100 transition hover:border-orange-500/70 hover:bg-zinc-800"
            >
              <span
                class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold"
              >
                {{ t("nav.viewDashboard") }}
              </span>
            </NuxtLink>
            <NuxtLink
              to="/auth/login"
              class="rounded-md border border-orange-500/30 bg-zinc-800/90 px-3 4xs:px-4 3xs:px-5 xs:px-6 py-2 4xs:py-2.5 3xs:py-3 text-zinc-100 transition hover:border-orange-500/70 hover:bg-zinc-800"
            >
              <span
                class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold"
              >
                {{ t("common.signIn") }}
              </span>
            </NuxtLink>
          </div>
          <div
            class="flex flex-wrap items-center gap-2 4xs:gap-3 3xs:gap-4"
          >
            <span
              class="rounded-full border border-orange-500/30 bg-zinc-800/90 px-2 4xs:px-3 3xs:px-4 py-1 4xs:py-1.5"
            >
              <span
                class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/80"
              >
                {{ t("index.webhookTriggers") }}
              </span>
            </span>
            <span
              class="rounded-full border border-orange-500/30 bg-zinc-800/90 px-2 4xs:px-3 3xs:px-4 py-1 4xs:py-1.5"
            >
              <span
                class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/80"
              >
                {{ t("index.cronSchedules") }}
              </span>
            </span>
            <span
              class="rounded-full border border-orange-500/30 bg-zinc-800/90 px-2 4xs:px-3 3xs:px-4 py-1 4xs:py-1.5"
            >
              <span
                class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/80"
              >
                {{ t("index.jsonFirstWorkflows") }}
              </span>
            </span>
          </div>
        </div>

        <div class="space-y-3 4xs:space-y-4">
          <div
            class="rounded-xl 4xs:rounded-2xl border border-orange-500/30 bg-zinc-800/90 p-4 4xs:p-5"
          >
            <div
              class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold text-zinc-100"
            >
              {{ t("index.fromTriggerToAction") }}
            </div>
            <p
              class="mt-2 text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/70"
            >
              {{ t("index.fromTriggerToActionDesc") }}
            </p>
          </div>
          <div
            class="rounded-xl 4xs:rounded-2xl border border-orange-500/30 bg-zinc-800/90 p-4 4xs:p-5"
          >
            <div
              class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold text-zinc-100"
            >
              {{ t("index.reliableExecution") }}
            </div>
            <p
              class="mt-2 text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/70"
            >
              {{ t("index.reliableExecutionDesc") }}
            </p>
          </div>
          <div
            class="rounded-xl 4xs:rounded-2xl border border-orange-500/30 bg-zinc-800/90 p-4 4xs:p-5"
          >
            <div
              class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold text-zinc-100"
            >
              {{ t("index.auditReadyLogs") }}
            </div>
            <p
              class="mt-2 text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/70"
            >
              {{ t("index.auditReadyLogsDesc") }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
