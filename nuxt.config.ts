import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const prismaTraceInclude = [
  require.resolve("@prisma/client"),
  require.resolve("@prisma/client/runtime/client"),
  require.resolve("@prisma/client/runtime/query_compiler_bg.postgresql.mjs"),
  require.resolve("@prisma/client/runtime/query_compiler_bg.postgresql.wasm-base64.mjs"),
  require.resolve("@prisma/adapter-pg"),
  require.resolve("@prisma/driver-adapter-utils"),
  require.resolve("@prisma/client-runtime-utils"),
];

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
    "@nuxt/ui",
    "@nuxt/a11y",
    "@nuxt/content",
    "@nuxt/hints",
    "@nuxt/image",
    "@nuxt/test-utils",
    "@vueuse/motion/nuxt",
    "@pinia/nuxt",
    "nuxt-auth-utils",
  ],

  
  runtimeConfig: {
    authSecret:
      process.env.NUXT_AUTH_SECRET ||
      process.env.NUXT_JWT_SECRET ||
      process.env.JWT_SECRET ||
      "",
    authIssuer: process.env.AUTH_ISSUER || "finger-automation",
    accessTokenTtl: Number(process.env.ACCESS_TOKEN_TTL || 60 * 15),
    refreshTokenTtl: Number(process.env.REFRESH_TOKEN_TTL || 60 * 60 * 24 * 7),
    authCookieSecure: process.env.AUTH_COOKIE_SECURE === "true",
    resendApiKey: process.env.RESEND_API_KEY || "",
    resendFrom: process.env.RESEND_FROM || "",
    qstashToken: process.env.QSTASH_TOKEN || "",
    qstashCurrentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY || "",
    qstashNextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY || "",
    public: {
      appUrl: process.env.APP_URL || "http://localhost:3000",
    },
  },

  nitro: {
    externals: {
      traceInclude: prismaTraceInclude,
    },
    rollupConfig: {
      external: [/^@prisma\//, /\.wasm$/],
    },
    prerender: {
      crawlLinks: false,
      routes: [],
      ignore: ['/'],
      failOnError: false,
    },
    esbuild: {
      options: {
        target: 'esnext'
      }
    },
    // Disable prerendering completely
    static: false
  },
  devtools: {
    enabled: true,
  },

  css: ["~/assets/css/main.css"],

  routeRules: {},

  hooks: {
    "pages:extend"(pages) {
      const applyLayout = (pageList) => {
        for (const page of pageList) {
          if (page.path?.startsWith("/auth")) {
            page.meta = { ...(page.meta || {}), layout: "auth" };
          } else if (
            page.path?.startsWith("/main") ||
            page.path?.startsWith("/about")
          ) {
            page.meta = { ...(page.meta || {}), layout: "landing" };
          } else {
            page.meta = { ...(page.meta || {}), layout: "default" };
          }

          if (page.children?.length) {
            applyLayout(page.children);
          }
        }
      };

      applyLayout(pages);
    },
    close: () => {
      process.exit(0)
    }
  },
  colorMode: {
    preference: "light",
    fallback: "light",
    classSuffix: "",
  },

  compatibilityDate: "2025-01-15",

  typescript: {
    strict: false,
    typeCheck: false,
    tsConfig: {
      compilerOptions: {
        strict: false,
        skipLibCheck: true,
      },
    },
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: "never",
        braceStyle: "1tbs",
      },
    },
  },
});
