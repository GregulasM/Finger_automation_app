<script setup lang="ts">
import { storeToRefs } from "pinia";

useHead({
  meta: [{ name: "viewport", content: "width=device-width, initial-scale=1" }],
  link: [{ rel: "icon", href: "/favicon.ico" }],
  htmlAttrs: { lang: "en" },
});

const title = "Finger Automation";
const description =
  "Design and run serverless automation workflows with webhooks, schedules, and HTTP actions.";

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: "https://placehold.co/1200x630/png?text=Finger+Automation",
  twitterImage: "https://placehold.co/1200x630/png?text=Finger+Automation",
  twitterCard: "summary_large_image",
});

const auth = useAuthStore();
const { user, loggedIn } = storeToRefs(auth);
const route = useRoute();
const { t, locale, setLocale } = useI18n();

function toggleLocale() {
  setLocale(locale.value === "en" ? "ru" : "en");
}

type NavLink = { label: string; to: string };

const navLinks: NavLink[] = [
  { label: t("nav.home"), to: "/" },
  { label: t("nav.workflows"), to: "/workflows" },
  { label: t("nav.editor"), to: "/workflows/editor" },
];

function isActiveLink(link: NavLink) {
  if (link.to === "/") return route.path === "/";
  if (link.to === "/workflows") return route.path === "/workflows";
  if (link.to === "/workflows/editor")
    return route.path.startsWith("/workflows/editor");
  return route.path.startsWith(link.to);
}

async function handleLogout() {
  await auth.logout();
  await navigateTo("/auth/login");
}

const mobileOpen = ref(false);
watch(
  () => route.path,
  () => (mobileOpen.value = false),
);
</script>

<template>
  <UApp class="min-h-screen bg-zinc-950 text-zinc-100">
    <header
      class="sticky top-0 z-40 border-b border-orange-500/60 bg-zinc-950/10 backdrop-blur-sm"
    >
      <!-- тонкая линия-акцент -->
      <div
        class="pointer-events-none absolute inset-x-0 top-0 h-px bg-orange-500/60"
      />

      <div
        class="mx-auto flex w-full max-w-6xl items-center justify-between gap-1 4xs:gap-2 3xs:gap-3 px-1 4xs:px-2 3xs:px-3 xs:px-4 sm:px-6 py-1 3xs:py-2"
      >
        <!-- Brand -->
        <NuxtLink
          to="/"
          class="flex min-w-0 items-center gap-1 4xs:gap-2 rounded-md border border-orange-500/30 bg-zinc-800/70 px-1 4xs:px-2 py-1"
        >
          <div class="min-w-0 leading-tight">
            <div
              class="truncate text-[7px] 4xs:text-[8px] 3xs:text-[9px] 2xs:text-[10px] xs:text-[11px] sm:text-sm md:text-md lg:text-md 2xl:text-lg 3xl:text-lg/6 4xl:text-2xl/8 5xl:text-3xl/10 font-bold text-zinc-100"
            >
              Finger Automation
            </div>
            <div
              class="truncate text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/70"
            >
              Workflow studio
            </div>
          </div>
        </NuxtLink>

        <!-- Desktop nav -->
        <nav class="hidden items-center gap-1 2xs:gap-2 md:flex">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="rounded-full border px-2 2xs:px-3 py-1 transition"
            :class="
              isActiveLink(link)
                ? 'border-orange-500/80 bg-zinc-800 text-zinc-100 shadow-[0_0_0_1px_rgba(249,115,22,0.35)]'
                : 'border-orange-500/25 bg-zinc-800/50 text-zinc-100/90 hover:border-orange-500/70 hover:bg-zinc-800/80'
            "
          >
            <span
              class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold"
            >
              {{ link.label }}
            </span>
          </NuxtLink>
        </nav>

        <!-- Right area -->
        <div class="flex items-center gap-1 4xs:gap-2">
          <!-- Language switcher -->
          <div class="hidden 2xs:flex items-center gap-1">
            <button
              type="button"
              @click="toggleLocale"
              class="rounded-md border border-orange-500/30 bg-zinc-800/70 px-2 2xs:px-3 py-1 3xs:py-2 text-zinc-100 hover:border-orange-500/70 hover:bg-zinc-800/90 transition"
              :title="locale === 'en' ? t('lang.russian') : t('lang.english')"
            >
              <span
                class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold"
              >
                {{ locale === "en" ? "RU" : "EN" }}
              </span>
            </button>
          </div>
          
          <!-- Mobile hamburger -->
          <button
            type="button"
            class="md:hidden inline-flex items-center justify-center rounded-md border border-orange-500/30 bg-zinc-800/70 px-2 py-2 hover:border-orange-500/70 hover:bg-zinc-800/90"
            :aria-expanded="mobileOpen ? 'true' : 'false'"
            aria-label="Open menu"
            @click="mobileOpen = !mobileOpen"
          >
            <svg
              class="h-3 w-3 2xs:h-4 2xs:w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M4 6h16" />
              <path d="M4 12h16" />
              <path d="M4 18h16" />
            </svg>
          </button>

          <!-- Primary action -->
          <NuxtLink
            to="/workflows/editor"
            class="rounded-md border border-orange-500 bg-orange-500 px-2 2xs:px-3 xs:px-4 py-1 3xs:py-2 text-zinc-950 transition hover:brightness-110"
          >
            <span
              class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold"
            >
              <span class="hidden 2xs:inline">{{ t("nav.newWorkflow") }}</span>
              <span class="2xs:hidden">{{ t("common.new") }}</span>
            </span>
          </NuxtLink>

          <!-- Auth block (desktop-ish compact) -->
          <div
            v-if="loggedIn && user"
            class="hidden 2xs:flex items-center gap-2"
          >
            <div class="hidden xs:block text-right leading-tight">
              <p
                class="text-zinc-100 text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold"
              >
                {{ user.name || t("common.user") }}
              </p>
              <p
                class="text-zinc-100/70 text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 opacity-75"
              >
                {{ user.email }}
              </p>
            </div>

            <button
              type="button"
              class="rounded-md border border-orange-500/30 bg-zinc-800/70 px-2 2xs:px-3 py-1 3xs:py-2 text-zinc-100 hover:border-orange-500/70 hover:bg-zinc-800/90"
              @click="handleLogout"
            >
              <span
                class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold"
              >
                {{ t("common.logout") }}
              </span>
            </button>
          </div>

          <NuxtLink
            v-else
            to="/auth/login"
            class="hidden 2xs:inline-flex rounded-md border border-orange-500/30 bg-zinc-800/70 px-2 2xs:px-3 py-1 3xs:py-2 text-zinc-100 hover:border-orange-500/70 hover:bg-zinc-800/90"
          >
              <span
                class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold"
              >
                {{ t("common.signIn") }}
              </span>
          </NuxtLink>
        </div>
      </div>

      <!-- Mobile menu -->
      <div
        v-show="mobileOpen"
        class="md:hidden border-t border-orange-500/40 bg-zinc-950/95 backdrop-blur"
      >
        <div
          class="mx-auto w-full max-w-6xl px-1 4xs:px-2 3xs:px-3 xs:px-4 sm:px-6 py-2"
        >
          <nav class="flex flex-col gap-1">
            <NuxtLink
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              class="rounded-md border px-2 py-2 transition"
              :class="
                isActiveLink(link)
                  ? 'border-orange-500/80 bg-zinc-800 text-zinc-100 shadow-[0_0_0_1px_rgba(249,115,22,0.35)]'
                  : 'border-orange-500/25 bg-zinc-800/50 text-zinc-100/90 hover:border-orange-500/70 hover:bg-zinc-800/80'
              "
            >
              <span
                class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold"
              >
                {{ link.label }}
              </span>
            </NuxtLink>

            <div class="mt-1 border-t border-orange-500/25 pt-2">
              <!-- Language switcher mobile -->
              <div class="mb-2 flex items-center justify-center">
                <button
                  type="button"
                  @click="toggleLocale"
                  class="w-full rounded-md border border-orange-500/30 bg-zinc-800/70 px-2 py-2 text-zinc-100 hover:border-orange-500/70 hover:bg-zinc-800/90 transition"
                >
                  <span
                    class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold"
                  >
                    {{ locale === "en" ? t("lang.russian") : t("lang.english") }} ({{ locale === "en" ? "RU" : "EN" }})
                  </span>
                </button>
              </div>
              
              <div
                v-if="loggedIn && user"
                class="flex items-center justify-between gap-2"
              >
                <div class="min-w-0">
                  <p
                    class="truncate text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold"
                  >
                    {{ user.name || t("common.user") }}
                  </p>
                  <p
                    class="truncate text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 opacity-75"
                  >
                    {{ user.email }}
                  </p>
                </div>

                <button
                  type="button"
                  class="shrink-0 rounded-md border border-orange-500/30 bg-zinc-800/70 px-2 py-2 text-zinc-100 hover:border-orange-500/70 hover:bg-zinc-800/90"
                  @click="handleLogout"
                >
                  <span
                    class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold"
                  >
                    Logout
                  </span>
                </button>
              </div>

              <NuxtLink
                v-else
                to="/auth/login"
                class="inline-flex w-full items-center justify-center rounded-md border border-orange-500/30 bg-zinc-800/70 px-2 py-2 text-zinc-100 hover:border-orange-500/70 hover:bg-zinc-800/90"
              >
              <span
                class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold"
              >
                {{ t("common.signIn") }}
              </span>
              </NuxtLink>
            </div>
          </nav>
        </div>
      </div>
    </header>

    <UMain class="bg-zinc-950 min-h-screen pt-12 4xs:pt-14 3xs:pt-16 2xs:pt-18 xs:pt-20 sm:pt-24">
      <NuxtPage />
    </UMain>
  </UApp>
</template>
