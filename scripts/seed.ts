import { readFileSync, existsSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import { parseOffers } from "../lib/csv";

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

if (!process.env.DATABASE_URL) {
  console.log("DATABASE_URL absent : rien à charger. Les offres simulées sont lues depuis le CSV en aperçu.");
  process.exit(0);
}

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const { organizations, opportunities } = parseOffers(readFileSync(new URL("../docs/phase-0/offres.csv", import.meta.url), "utf8"));

  await sql.query(`delete from interests where opportunity_id in (select id from opportunities where source = 'simulation')`);
  await sql.query(`delete from reports where opportunity_id in (select id from opportunities where source = 'simulation')`);
  await sql.query(`delete from opportunities where source = 'simulation'`);

  for (const organization of organizations) {
    const found = await sql`select id from organizations where name = ${organization.name} limit 1`;
    if (found.length === 0) {
      await sql`insert into organizations (name, city, sector, website) values (${organization.name}, ${organization.city}, ${organization.sector}, ${organization.website})`;
    }
  }

  for (const offer of opportunities) {
    const org = await sql`select id from organizations where name = ${offer.organizationName} limit 1`;
    const organizationId = org[0]?.id as string;
    await sql`
      insert into opportunities (
        organization_id, type, title, description, city, remote, domains, levels, paid,
        compensation_note, duration, start_date, deadline, apply_mode, apply_target, status, source, verified_at
      ) values (
        ${organizationId}, ${offer.type}, ${offer.title}, ${offer.description}, ${offer.city}, ${offer.remote},
        ${offer.domains}, ${offer.levels}, ${offer.paid}, ${offer.compensationNote}, ${offer.duration},
        ${offer.startDate}, ${offer.deadline}, ${offer.applyMode}, ${offer.applyTarget}, ${offer.status},
        ${offer.source}, ${offer.verifiedAt}
      )
    `;
  }

  console.log(`${opportunities.length} offres simulées chargées dans Neon.`);
}

main();
