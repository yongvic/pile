import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL manquant.");
  return drizzle(neon(url), { schema });
}

let database: ReturnType<typeof createDb> | null = null;

export function getDb() {
  if (!database) database = createDb();
  return database;
}

export function databaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
