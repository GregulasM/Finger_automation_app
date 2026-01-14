<template>
  <div class="relative overflow-hidden min-h-screen bg-zinc-950 px-2 4xs:px-3 3xs:px-4 xs:px-6 py-8 4xs:py-12 3xs:py-16">
    <UContainer>
      <div class="mx-auto w-full max-w-md">
        <div class="mb-4 4xs:mb-6 text-center">
          <p
            class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold uppercase tracking-[0.3em] text-orange-500"
          >
            Finger Automation
          </p>
          <h1
            class="mt-2 4xs:mt-3 text-[7px] 4xs:text-[8px] 3xs:text-[9px] 2xs:text-[10px] xs:text-[11px] sm:text-sm md:text-md lg:text-md 2xl:text-lg 3xl:text-lg/6 4xl:text-2xl/8 5xl:text-3xl/10 font-bold text-zinc-100"
          >
            {{ t("auth.createAccount") }}
          </h1>
          <p
            class="mt-2 text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/70"
          >
            {{ t("auth.startBuilding") }}
          </p>
        </div>

        <div
          class="rounded-xl 4xs:rounded-2xl border border-orange-500/30 bg-zinc-800/90 p-4 4xs:p-5 3xs:p-6"
        >
          <UAlert
            v-if="errorMessage"
            color="red"
            variant="soft"
            :title="t('auth.registrationFailed')"
            :description="errorMessage"
            class="mb-4"
          />
          <UForm :schema="schema" :state="state" @submit="onSubmit">
            <div class="space-y-3 4xs:space-y-4">
              <UFormField :label="t('auth.name')" name="name">
                <UInput
                  v-model="state.name"
                  type="text"
                  placeholder="Your name"
                  autocomplete="name"
                  :ui="{ root: 'ring-0' }"
                />
              </UFormField>
              <UFormField :label="t('auth.email')" name="email">
                <UInput
                  v-model="state.email"
                  type="email"
                  placeholder="you@company.com"
                  autocomplete="email"
                  :ui="{ root: 'ring-0' }"
                />
              </UFormField>
              <UFormField :label="t('auth.password')" name="password">
                <UInput
                  v-model="state.password"
                  type="password"
                  placeholder="Create a password"
                  autocomplete="new-password"
                  :ui="{ root: 'ring-0' }"
                />
              </UFormField>
              <button
                type="submit"
                :disabled="loading"
                class="w-full rounded-md border border-orange-500 bg-orange-500 px-4 py-2.5 text-zinc-950 transition hover:brightness-110 disabled:opacity-50"
              >
                <span
                  class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold"
                >
                  <span v-if="loading">{{ t("common.loading") }}</span>
                  <span v-else>{{ t("auth.createAccountButton") }}</span>
                </span>
              </button>
            </div>
          </UForm>

          <div
            class="mt-4 4xs:mt-6 text-center text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/70"
          >
            {{ t("auth.alreadyHaveAccount") }}
            <NuxtLink
              to="/auth/login"
              class="font-semibold text-orange-500 hover:text-orange-400"
            >
              {{ t("auth.signIn") }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { $fetch } from "ofetch";
import { reactive, ref } from "vue";
import { z } from "zod";

const { t } = useI18n();

const auth = useAuthStore();

const state = reactive({
  name: "",
  email: "",
  password: "",
});

const nameRegex = /^[A-Za-z\p{Script=Cyrillic}\s'-]+$/u;

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, t("auth.nameMinLength"))
    .max(80, t("auth.nameMaxLength"))
    .regex(nameRegex, t("auth.nameInvalidChars")),
  email: z.string().email(t("auth.enterValidEmail")),
  password: z.string().min(8, t("auth.passwordMinLength")),
});

const loading = ref(false);
const errorMessage = ref<string | null>(null);

async function onSubmit(event: { data: z.infer<typeof schema> }) {
  loading.value = true;
  errorMessage.value = null;

  try {
    await $fetch("/api/auth/register", {
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
  return t("auth.unableToRegister");
}
</script>
