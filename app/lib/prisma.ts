import "dotenv/config";
import { PrismaClient } from "../../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL;

  // During build/prerender - return a mock that throws on usage
  if (!databaseUrl || process.env.NITRO_PRERENDER_ROUTES !== undefined) {
    console.warn(
      "[Prisma] Skipping initialization - no DATABASE_URL or in prerender mode",
    );
    return new Proxy({} as PrismaClient, {
      get(_, prop) {
        if (prop === "then") return undefined; // Prevents Promise.resolve issues
        throw new Error(
          `Prisma not available during build/prerender. Tried to access: ${String(prop)}`,
        );
      },
    });
  }

  const useAccelerate =
    databaseUrl.startsWith("prisma://") ||
    databaseUrl.startsWith("prisma+postgres://");

  if (useAccelerate) {
    return new PrismaClient({ accelerateUrl: databaseUrl });
  }

  // Use adapter-pg for regular PostgreSQL connections (required for prisma-client engine)
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });
}

// Lazy-loaded Prisma client via Proxy
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    // Don't initialize for Promise checks
    if (prop === "then") return undefined;

    // Initialize on first real access
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createPrismaClient();
    }

    const client = globalForPrisma.prisma;
    const value = (client as any)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});
