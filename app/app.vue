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
const editorPanelOpen = useState<boolean>("editorPanelOpen", () => false);
const isEditorRoute = computed(() =>
  route.path.startsWith("/workflows/editor"),
);

function toggleLocale() {
  setLocale(locale.value === "en" ? "ru" : "en");
}

type NavLinkDef = { labelKey: string; to: string };
type NavLink = { label: string; to: string };

const navLinksDef: NavLinkDef[] = [
  { labelKey: "nav.home", to: "/" },
  { labelKey: "nav.workflows", to: "/workflows" },
];

// Computed navLinks for reactive language switching
const navLinks = computed(() =>
  navLinksDef.map((link) => ({ label: t(link.labelKey), to: link.to })),
);

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
  () => {
    mobileOpen.value = false;
    if (!isEditorRoute.value) {
      editorPanelOpen.value = false;
    }
  },
);

watch(mobileOpen, (open) => {
  if (open) {
    editorPanelOpen.value = false;
  }
});
</script>

<template>
  <UApp
    class="min-h-screen bg-zinc-950 text-zinc-100"
    :ui="{ root: 'bg-zinc-950' }"
  >
    <header
      class="fixed top-0 left-0 right-0 z-40 border-b border-orange-500/60 bg-zinc-950/95 backdrop-blur-sm"
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
          class="flex min-w-0 items-center gap-1 4xs:gap-1.5 rounded-md border border-orange-500/30 bg-zinc-800/70 px-2 py-1"
        >
          <div class="min-w-0 leading-none">
            <div
              class="truncate text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-bold text-zinc-100"
            >
              Finger Automation
            </div>
            <div
              class="hidden xs:block truncate text-[4px] 4xs:text-[5px] 3xs:text-[6px] 2xs:text-[7px] xs:text-[8px] sm:text-[10px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 text-zinc-100/70"
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
            class="inline-flex items-center justify-center rounded-md border px-2 2xs:px-3 py-1 3xs:py-2 transition"
            :class="
              isActiveLink(link)
                ? 'border-orange-500/80 bg-zinc-800 text-zinc-100 shadow-[0_0_0_1px_rgba(249,115,22,0.35)]'
                : 'border-orange-500/25 bg-zinc-800/50 text-zinc-100/90 hover:border-orange-500/70 hover:bg-zinc-800/80'
            "
          >
            <span
              class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold leading-none"
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
              class="inline-flex items-center justify-center rounded-md border border-orange-500/30 bg-zinc-800/70 px-2 2xs:px-2.5 py-1 3xs:py-1.5 text-zinc-100 hover:border-orange-500/70 hover:bg-zinc-800/90 transition"
              :title="locale === 'en' ? t('lang.russian') : t('lang.english')"
            >
              <span
                class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold leading-none"
              >
                {{ locale === "en" ? "RU" : "EN" }}
              </span>
            </button>
          </div>

          <!-- Mobile hamburger -->
          <button
            type="button"
            class="md:hidden inline-flex items-center justify-center rounded-md border border-orange-500/30 bg-zinc-800/70 px-2 2xs:px-2.5 py-1 3xs:py-1.5 hover:border-orange-500/70 hover:bg-zinc-800/90 transition"
            :aria-expanded="mobileOpen ? 'true' : 'false'"
            aria-label="Open menu"
            @click="mobileOpen = !mobileOpen"
          >
            <svg
              class="h-2.5 w-2.5"
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
            class="inline-flex items-center justify-center rounded-md border border-orange-500 bg-orange-500 px-2 2xs:px-2.5 xs:px-3 py-1 3xs:py-1.5 text-zinc-950 transition hover:brightness-110"
          >
            <span
              class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold leading-none"
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
              class="inline-flex items-center justify-center rounded-md border border-orange-500/30 bg-zinc-800/70 px-2 2xs:px-2.5 py-1 3xs:py-1.5 text-zinc-100 hover:border-orange-500/70 hover:bg-zinc-800/90 transition"
              @click="handleLogout"
            >
              <span
                class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold leading-none"
              >
                {{ t("common.logout") }}
              </span>
            </button>
          </div>

          <NuxtLink
            v-else
            to="/auth/login"
            class="hidden 2xs:inline-flex items-center justify-center rounded-md border border-orange-500/30 bg-zinc-800/70 px-2 2xs:px-2.5 py-1 3xs:py-1.5 text-zinc-100 hover:border-orange-500/70 hover:bg-zinc-800/90 transition"
          >
            <span
              class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold leading-none"
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
              class="inline-flex items-center justify-center rounded-md border px-2 py-2 transition"
              :class="
                isActiveLink(link)
                  ? 'border-orange-500/80 bg-zinc-800 text-zinc-100 shadow-[0_0_0_1px_rgba(249,115,22,0.35)]'
                  : 'border-orange-500/25 bg-zinc-800/50 text-zinc-100/90 hover:border-orange-500/70 hover:bg-zinc-800/80'
              "
            >
              <span
                class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold leading-none"
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
                  class="inline-flex w-full items-center justify-center rounded-md border border-orange-500/30 bg-zinc-800/70 px-2 py-2 text-zinc-100 hover:border-orange-500/70 hover:bg-zinc-800/90 transition"
                >
                  <span
                    class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold leading-none"
                  >
                    {{
                      locale === "en" ? t("lang.russian") : t("lang.english")
                    }}
                    ({{ locale === "en" ? "RU" : "EN" }})
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
                  class="shrink-0 inline-flex items-center justify-center rounded-md border border-orange-500/30 bg-zinc-800/70 px-2 py-2 text-zinc-100 hover:border-orange-500/70 hover:bg-zinc-800/90 transition"
                  @click="handleLogout"
                >
                  <span
                    class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold leading-none"
                  >
                    Logout
                  </span>
                </button>
              </div>

              <NuxtLink
                v-else
                to="/auth/login"
                class="inline-flex w-full items-center justify-center rounded-md border border-orange-500/30 bg-zinc-800/70 px-2 py-2 text-zinc-100 hover:border-orange-500/70 hover:bg-zinc-800/90 transition"
              >
                <span
                  class="text-[5px] 4xs:text-[6px] 3xs:text-[7px] 2xs:text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs lg:text-sm 2xl:text-base 3xl:text-lg/8 4xl:text-2xl/10 5xl:text-3xl/12 font-semibold leading-none"
                >
                  {{ t("common.signIn") }}
                </span>
              </NuxtLink>
            </div>
          </nav>
        </div>
      </div>
    </header>

    <main class="bg-zinc-950 min-h-screen">
      <NuxtPage />
    </main>
  </UApp>
</template>
