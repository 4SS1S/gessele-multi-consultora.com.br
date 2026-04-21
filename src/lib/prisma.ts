import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pg from "pg";

// Prisma 7: o PrismaClient recebe um adapter de driver ao invés de URL no schema
// Singleton para evitar múltiplas instâncias em desenvolvimento (hot-reload do Next.js)

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  // max: 1 é essencial em serverless (Vercel) para não esgotar conexões no pooler
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
