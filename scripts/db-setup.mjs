/**
 * scripts/db-setup.mjs
 * Executa supabase/setup.sql contra o banco remoto usando a DIRECT_URL do .env
 *
 * Uso:
 *   pnpm db:setup        (Linux/Mac)
 *   pnpm db:setup:win    (Windows)
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

// Carrega o .env manualmente (sem precisar de dotenv instalado)
const __dir = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dir, "..", ".env");

try {
  const envContent = readFileSync(envPath, "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const val = trimmed
      .slice(eqIndex + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
} catch {
  // .env não existe — assume que as variáveis já estão no ambiente
}

const dbUrl = process.env.DIRECT_URL;
if (!dbUrl) {
  console.error("❌  DIRECT_URL não encontrada no .env");
  process.exit(1);
}

const sqlPath = resolve(__dir, "..", "supabase", "setup.sql");
const sql = readFileSync(sqlPath, "utf8");

const client = new pg.Client({ connectionString: dbUrl });

try {
  console.log("🔗  Conectando ao banco...");
  await client.connect();

  console.log("⚙️   Executando supabase/setup.sql...");
  await client.query(sql);

  console.log("✅  Setup do Supabase aplicado com sucesso!");
} catch (err) {
  console.error("❌  Erro ao executar o script:");
  console.error(err.message);
  process.exit(1);
} finally {
  await client.end();
}
