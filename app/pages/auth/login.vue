<template>
  <div
    class="min-h-screen w-full bg-zinc-950 flex flex-col justify-center py-20 px-4 sm:px-6 lg:px-8"
  >
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center mb-8">
        <p
          class="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] text-orange-500 mb-2"
        >
          Finger Automation
        </p>
        <h2 class="text-2xl font-bold tracking-tight text-zinc-100">
          {{ t("auth.welcomeBack") }}
        </h2>
        <p class="mt-2 text-sm text-zinc-400">
          {{ t("auth.signInDescription") }}
        </p>
      </div>

      <div
        class="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-xl shadow-xl overflow-hidden"
      >
        <div class="p-8">
          <UAlert
            v-if="errorMessage"
            color="error"
            variant="soft"
            :title="t('auth.loginFailed')"
            :description="errorMessage"
            class="mb-6"
          />
          <div v-if="loading || refreshing" class="mb-6">
            <div
              class="relative h-[3px] w-full overflow-hidden rounded-full bg-zinc-700/60 after:absolute after:left-0 after:top-0 after:bottom-0 after:w-[45%] after:rounded-full after:content-[''] after:bg-gradient-to-r after:from-transparent after:via-orange-500/80 after:to-transparent after:animate-[loading-bar-slide_1.2s_ease-in-out_infinite]"
            ></div>
          </div>

          <UForm
            :schema="schema"
            :state="state"
            @submit="onSubmit"
            class="space-y-6"
          >
            <UFormField
              :label="t('auth.email')"
              name="email"
              :ui="formFieldStyles"
            >
              <UInput
                v-model="state.email"
                type="email"
                placeholder="you@company.com"
                autocomplete="email"
                :ui="inputStyles"
              />
            </UFormField>

            <UFormField
              :label="t('auth.password')"
              name="password"
              :ui="formFieldStyles"
            >
              <UInput
                v-model="state.password"
                type="password"
                placeholder="••••••••"
                autocomplete="current-password"
                :ui="inputStyles"
              />
            </UFormField>

            <button
              type="submit"
              :disabled="loading"
              class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="loading" class="flex items-center gap-2">
                <UIcon
                  name="i-heroicons-arrow-path-20-solid"
                  class="animate-spin h-4 w-4"
                />
                {{ t("common.loading") }}
              </span>
              <span v-else>{{ t("auth.signIn") }}</span>
            </button>
          </UForm>
        </div>

        <div
          class="px-8 py-4 bg-zinc-900/50 border-t border-zinc-800/50 text-center"
        >
          <p class="text-xs text-zinc-400">
            {{ t("auth.dontHaveAccount") }}
            <NuxtLink
              to="/auth/register"
              class="font-medium text-orange-500 hover:text-orange-400 transition-colors"
            >
              {{ t("auth.createOne") }}
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { $fetch } from "ofetch";
import { storeToRefs } from "pinia";
import { reactive, ref, watch } from "vue";
import { z } from "zod";

const { t } = useI18n();

// Unified input styles matching workflow editor
const inputStyles = {
  root: "ring-0 w-full",
  base: "w-full ring-0 !ring-inset-0 bg-zinc-800 border border-orange-500/50 text-zinc-100 placeholder:text-zinc-500 focus:bg-zinc-800 focus:border-orange-500 focus:text-zinc-100 focus:!ring-2 focus:!ring-orange-500 focus:!ring-inset focus:ring-offset-0 focus-visible:!ring-2 focus-visible:!ring-orange-500 focus-visible:!ring-inset focus-visible:ring-offset-0",
};

const formFieldStyles = {
  label:
    "text-zinc-100/80 text-[9px] 4xs:text-[10px] 3xs:text-[11px] xs:text-xs sm:text-sm font-medium",
};

const auth = useAuthStore();
const { loggedIn } = storeToRefs(auth);
const accessToken = useCookie("access_token");

const state = reactive({
  email: "",
  password: "",
});

const schema = z.object({
  email: z.string().email(t("auth.enterValidEmail")),
  password: z.string().min(8, t("auth.passwordMinLength")),
});

const loading = ref(false);
const errorMessage = ref<string | null>(null);
const refreshing = ref(false);

watch(
  [loggedIn, accessToken],
  async ([isLoggedIn, token]) => {
    if (!import.meta.client || !isLoggedIn) {
      return;
    }
    if (!token && !refreshing.value) {
      refreshing.value = true;
      try {
        await $fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });
      } catch {
        return;
      } finally {
        refreshing.value = false;
      }
    }
    if (useCookie("access_token").value) {
      await navigateTo("/workflows/editor");
    }
  },
  { immediate: true },
);

async function onSubmit(event: { data: z.infer<typeof schema> }) {
  loading.value = true;
  errorMessage.value = null;

  try {
    await $fetch("/api/auth/login", {
      method: "POST",
      body: event.data,
      credentials: "include",
    });
    await auth.refresh();
    await navigateTo("/workflows/editor");
  } catch (error) {
    errorMessage.value = getErrorMessage(error);
  } finally {
    loading.value = false;
  }
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
  return t("auth.unableToLogin");
}
</script>
