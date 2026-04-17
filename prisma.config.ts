import path from 'node:path'
import { defineConfig } from 'prisma/config'
import 'dotenv/config'

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),

  datasource: {
    // URL usada pelo CLI (migrate dev/deploy). Deve ser conexão direta (sem PgBouncer).
    url: process.env.DIRECT_URL as string,
  },

  migrate: {
    // Adapter para o motor de migrations do Prisma
    async adapter() {
      const { default: pg } = await import('pg')
      const { PrismaPg } = await import('@prisma/adapter-pg')
      const pool = new pg.Pool({ connectionString: process.env.DIRECT_URL })
      return new PrismaPg(pool)
    },
  },
})
