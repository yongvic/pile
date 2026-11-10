import { readFileSync, existsSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (!match) continue;
      const key = match[1].trim();
      if (!process.env[key]) process.env[key] = match[2].trim().replace(/^["']|["']$/g, "");
    }
  }
}

loadEnv();

const url = process.env.DATABASE_URL;
if (!url) {
  console.log("DATABASE_URL absent : schéma non appliqué. L'aperçu local n'en a pas besoin.");
  process.exit(0);
}

async function main() {
  const sql = neon(url!);
  const statements = readFileSync(new URL("../db/migrations/0001_init.sql", import.meta.url), "utf8")
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await sql.query(statement);
  }

  console.log("Schéma Neon à jour.");
}

main();
