import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { interests, opportunities, organizations, profiles, reports } from "@/db/schema";
import { hashPassword, operatorEmails, readSession, setSession, verifyPassword } from "@/lib/auth";
import { cvFilePath, readCatalog, readDemo, updateDemo } from "@/lib/demo-store";
import { databaseConfigured } from "@/db";
import type { ApplyMode, Interest, OfferStatus, Opportunity, Organization, Paid, Profile, ProfileLevel, Report, ReportKind, Seek } from "@/lib/types";

export type ProfileInput = {
  firstName: string;
  phone: string;
  whatsapp: string;
  city: string;
  school: string;
  level: ProfileLevel | "";
  domains: string[];
  skills: string[];
  lookingFor: Seek[];
  availability: string;
  cv: File | null;
};

export type OfferInput = {
  id?: string;
  organizationId: string;
  newOrganizationName: string;
  newOrganizationCity: string;
  newOrganizationSector: string;
  type: Opportunity["type"];
  title: string;
  description: string;
  city: string;
  remote: boolean;
  domains: string[];
  levels: string[];
  paid: Paid;
  compensationNote: string;
  duration: string;
  startDate: string | null;
  deadline: string | null;
  applyMode: ApplyMode;
  applyTarget: string;
  status: OfferStatus;
  source: string;
  verifiedAt: string | null;
};

const demoProfile = (): Profile => ({
  id: "demo-etudiant",
  role: "etudiant",
  email: "awa@exemple.tg",
  firstName: "Awa",
  phone: "",
  whatsapp: "+228 90 00 00 00",
  city: "Lome",
  school: "Université de Lomé",
  level: "l3",
  domains: ["informatique"],
  skills: [],
  lookingFor: ["stage"],
  availability: "À partir de janvier",
  cvPath: "",
  createdAt: "2026-11-10T00:00:00.000Z",
});

export function isDemo(): boolean {
  return !databaseConfigured();
}

export async function getProfile(): Promise<Profile | null> {
  if (isDemo()) {
    const state = await readDemo();
    return state.profile ?? demoProfile();
  }
  const id = await readSession();
  if (!id) return null;
  const [row] = await getDb().select(profileColumns).from(profiles).where(eq(profiles.id, id));
  return row ? mapProfile(row) : null;
}

export async function signIn(email: string, password: string): Promise<void> {
  const [row] = await getDb().select().from(profiles).where(eq(profiles.email, email.toLowerCase()));
  if (!row || !(await verifyPassword(password, row.passwordHash))) {
    throw new Error("E-mail ou mot de passe incorrect.");
  }
  if (operatorEmails().includes(row.email.toLowerCase()) && row.role !== "operateur") {
    await getDb().update(profiles).set({ role: "operateur" }).where(eq(profiles.id, row.id));
  }
  await setSession(row.id);
}

export async function signUp(email: string, password: string): Promise<void> {
  const normalized = email.toLowerCase();
  const [existing] = await getDb().select({ id: profiles.id }).from(profiles).where(eq(profiles.email, normalized));
  if (existing) throw new Error("Un compte existe déjà avec cet e-mail.");
  const [row] = await getDb()
    .insert(profiles)
    .values({
      email: normalized,
      passwordHash: await hashPassword(password),
      role: operatorEmails().includes(normalized) ? "operateur" : "etudiant",
    })
    .returning({ id: profiles.id });
  await setSession(row.id);
}

export async function saveProfile(input: ProfileInput): Promise<void> {
  const current = await getProfile();
  if (!current) throw new Error("Connexion requise.");
  let cvPath = current.cvPath;
  let cvData: string | undefined;
  if (input.cv && input.cv.size > 0) {
    if (input.cv.type !== "application/pdf") throw new Error("Le CV doit être un PDF.");
    if (input.cv.size > 5_000_000) throw new Error("Le CV dépasse 5 Mo.");
    const bytes = Buffer.from(await input.cv.arrayBuffer());
    if (isDemo()) {
      const destination = cvFilePath(current.id);
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, bytes);
      cvPath = `${current.id}.pdf`;
    } else {
      cvData = bytes.toString("base64");
      cvPath = "cv.pdf";
    }
  }

  if (isDemo()) {
    await updateDemo((state) => {
      state.profile = {
        ...(state.profile ?? demoProfile()),
        firstName: input.firstName,
        phone: input.phone,
        whatsapp: input.whatsapp,
        city: input.city,
        school: input.school,
        level: input.level,
        domains: input.domains,
        skills: input.skills,
        lookingFor: input.lookingFor,
        availability: input.availability,
        cvPath,
      };
    });
    return;
  }

  await getDb()
    .update(profiles)
    .set({
      firstName: input.firstName,
      phone: input.phone,
      whatsapp: input.whatsapp,
      city: input.city,
      school: input.school,
      level: input.level || null,
      domains: input.domains,
      skills: input.skills,
      lookingFor: input.lookingFor,
      availability: input.availability,
      ...(cvData ? { cvName: "cv.pdf", cvData } : {}),
    })
    .where(eq(profiles.id, current.id));
}

export async function listOrganizations(): Promise<Organization[]> {
  if (isDemo()) return (await readCatalog()).organizations.sort((a, b) => a.name.localeCompare(b.name, "fr"));
  const rows = await getDb().select().from(organizations).orderBy(organizations.name);
  return rows.map(mapOrganization);
}

export async function listOpportunities(): Promise<Opportunity[]> {
  if (isDemo()) return (await readCatalog()).opportunities;
  const profile = await getProfile();
  const rows = await fetchOpportunities();
  if (profile?.role === "operateur") return rows;
  const mine = new Set((profile ? await listInterests(profile.id) : []).map((item) => item.opportunityId));
  return rows.filter((offer) => (offer.status === "publiee" && offer.verifiedAt) || mine.has(offer.id));
}

export async function getOpportunity(id: string): Promise<Opportunity | null> {
  return (await listOpportunities()).find((offer) => offer.id === id) ?? null;
}

export async function listInterests(profileId?: string): Promise<Interest[]> {
  if (isDemo()) {
    const state = await readDemo();
    return profileId ? state.interests.filter((item) => item.profileId === profileId) : state.interests;
  }
  const profile = await getProfile();
  if (!profile) return [];
  const query = getDb().select().from(interests).orderBy(desc(interests.updatedAt));
  if (profile.role !== "operateur") {
    const rows = await query.where(eq(interests.profileId, profile.id));
    return rows.map(mapInterest);
  }
  const rows = profileId ? await query.where(eq(interests.profileId, profileId)) : await query;
  return rows.map(mapInterest);
}

export async function listReports(): Promise<Report[]> {
  if (isDemo()) return (await readDemo()).reports;
  const profile = await getProfile();
  if (!profile) return [];
  const rows =
    profile.role === "operateur"
      ? await getDb().select().from(reports).orderBy(desc(reports.createdAt))
      : await getDb().select().from(reports).where(eq(reports.profileId, profile.id)).orderBy(desc(reports.createdAt));
  return rows.map(mapReport);
}

export async function listProfiles(): Promise<Profile[]> {
  if (isDemo()) {
    const profile = await getProfile();
    return profile ? [profile] : [];
  }
  await assertOperator();
  const rows = await getDb().select(profileColumns).from(profiles).orderBy(desc(profiles.createdAt));
  return rows.map(mapProfile);
}

export async function markInterest(opportunityId: string, status: Interest["status"]): Promise<void> {
  const profile = await getProfile();
  if (!profile) throw new Error("Connexion requise.");
  if (isDemo()) {
    await updateDemo((state) => {
      const current = state.interests.find((item) => item.profileId === profile.id && item.opportunityId === opportunityId);
      const now = new Date().toISOString();
      if (!current) {
        state.interests.push({ id: crypto.randomUUID(), profileId: profile.id, opportunityId, status, createdAt: now, updatedAt: now });
        return;
      }
      if (current.status === "candidate" && status === "interesse") return;
      current.status = status;
      current.updatedAt = now;
    });
    return;
  }
  const [existing] = await getDb()
    .select()
    .from(interests)
    .where(and(eq(interests.profileId, profile.id), eq(interests.opportunityId, opportunityId)));
  if (existing?.status === "candidate" && status === "interesse") return;
  const now = new Date().toISOString();
  await getDb()
    .insert(interests)
    .values({ profileId: profile.id, opportunityId, status, updatedAt: now })
    .onConflictDoUpdate({
      target: [interests.profileId, interests.opportunityId],
      set: { status, updatedAt: now },
    });
}

export async function addReport(opportunityId: string, kind: ReportKind, reason: string, note: string): Promise<void> {
  const profile = await getProfile();
  if (!profile) throw new Error("Connexion requise.");
  if (isDemo()) {
    await updateDemo((state) => {
      state.reports.push({
        id: crypto.randomUUID(),
        profileId: profile.id,
        opportunityId,
        kind,
        reason,
        note,
        createdAt: new Date().toISOString(),
        resolvedAt: null,
      });
    });
    return;
  }
  await getDb().insert(reports).values({ profileId: profile.id, opportunityId, kind, reason, note });
}

export async function resolveReport(id: string): Promise<void> {
  if (isDemo()) {
    await updateDemo((state) => {
      const report = state.reports.find((item) => item.id === id);
      if (report) report.resolvedAt = new Date().toISOString();
    });
    return;
  }
  await assertOperator();
  await getDb().update(reports).set({ resolvedAt: new Date().toISOString() }).where(eq(reports.id, id));
}

export async function saveOrganization(input: { id?: string; name: string; city: string; sector: string; website: string }): Promise<string> {
  if (!input.name.trim()) throw new Error("Le nom est obligatoire.");
  if (isDemo()) {
    let id = input.id ?? crypto.randomUUID();
    await updateDemo((state) => {
      const current = input.id ? state.organizations.find((item) => item.id === input.id) : undefined;
      if (current) {
        Object.assign(current, input);
        return;
      }
      id = input.id ?? id;
      state.organizations.push({ id, name: input.name, city: input.city, sector: input.sector, website: input.website });
    });
    return id;
  }
  await assertOperator();
  if (input.id) {
    await getDb()
      .update(organizations)
      .set({ name: input.name, city: input.city, sector: input.sector, website: input.website })
      .where(eq(organizations.id, input.id));
    return input.id;
  }
  const [row] = await getDb()
    .insert(organizations)
    .values({ name: input.name, city: input.city, sector: input.sector, website: input.website })
    .returning({ id: organizations.id });
  return row.id;
}

export async function saveOpportunity(input: OfferInput): Promise<string> {
  let organizationId = input.organizationId;
  if (input.newOrganizationName.trim()) {
    organizationId = await saveOrganization({
      name: input.newOrganizationName.trim(),
      city: input.newOrganizationCity || "Lome",
      sector: input.newOrganizationSector,
      website: "",
    });
  }
  const organization = (await listOrganizations()).find((item) => item.id === organizationId);
  const offer: Opportunity = {
    id: input.id || crypto.randomUUID(),
    organizationId,
    organizationName: organization?.name ?? input.newOrganizationName,
    type: input.type,
    title: input.title,
    description: input.description,
    city: input.city,
    remote: input.remote,
    domains: input.domains,
    levels: input.levels,
    paid: input.paid,
    compensationNote: input.compensationNote,
    duration: input.duration,
    startDate: input.startDate,
    deadline: input.deadline,
    applyMode: input.applyMode,
    applyTarget: input.applyTarget,
    status: input.status,
    source: input.source,
    verifiedAt: input.verifiedAt,
    createdAt: new Date().toISOString(),
  };

  if (isDemo()) {
    await updateDemo((state) => {
      const extra = state.opportunities.find((item) => item.id === offer.id);
      if (extra) {
        Object.assign(extra, offer, { createdAt: extra.createdAt });
        return;
      }
      if (offer.id.startsWith("sim-")) {
        state.patches[offer.id] = offer;
        return;
      }
      state.opportunities.push(offer);
    });
    return offer.id;
  }

  await assertOperator();
  const values = {
    organizationId: offer.organizationId,
    type: offer.type,
    title: offer.title,
    description: offer.description,
    city: offer.city,
    remote: offer.remote,
    domains: offer.domains,
    levels: offer.levels,
    paid: offer.paid,
    compensationNote: offer.compensationNote,
    duration: offer.duration,
    startDate: offer.startDate,
    deadline: offer.deadline,
    applyMode: offer.applyMode,
    applyTarget: offer.applyTarget,
    status: offer.status,
    source: offer.source,
    verifiedAt: offer.verifiedAt,
  };
  if (input.id) {
    await getDb().update(opportunities).set(values).where(eq(opportunities.id, input.id));
    return input.id;
  }
  const [row] = await getDb().insert(opportunities).values(values).returning({ id: opportunities.id });
  return row.id;
}

export async function ensureOperator(): Promise<void> {
  if (isDemo()) return;
  const profile = await getProfile();
  if (!profile || !operatorEmails().includes(profile.email.toLowerCase()) || profile.role === "operateur") return;
  await getDb().update(profiles).set({ role: "operateur" }).where(eq(profiles.id, profile.id));
}

export async function readCv(profileId: string): Promise<Buffer | null> {
  const profile = await getProfile();
  if (!profile || (profile.role !== "operateur" && profile.id !== profileId)) return null;
  if (isDemo()) {
    try {
      return await readFile(cvFilePath(profileId));
    } catch {
      return null;
    }
  }
  const [row] = await getDb().select({ cvData: profiles.cvData }).from(profiles).where(eq(profiles.id, profileId));
  return row?.cvData ? Buffer.from(row.cvData, "base64") : null;
}

async function assertOperator(): Promise<void> {
  if (isDemo()) return;
  const profile = await getProfile();
  if (profile?.role !== "operateur") throw new Error("Réservé à l'opérateur.");
}

async function fetchOpportunities(): Promise<Opportunity[]> {
  const rows = await getDb()
    .select({ offer: opportunities, organizationName: organizations.name })
    .from(opportunities)
    .leftJoin(organizations, eq(opportunities.organizationId, organizations.id))
    .orderBy(desc(opportunities.createdAt));
  return rows.map(({ offer, organizationName }) => mapOpportunity(offer, organizationName ?? ""));
}

const profileColumns = {
  id: profiles.id,
  email: profiles.email,
  role: profiles.role,
  firstName: profiles.firstName,
  phone: profiles.phone,
  whatsapp: profiles.whatsapp,
  city: profiles.city,
  school: profiles.school,
  level: profiles.level,
  domains: profiles.domains,
  skills: profiles.skills,
  lookingFor: profiles.lookingFor,
  availability: profiles.availability,
  cvName: profiles.cvName,
  createdAt: profiles.createdAt,
};

function mapProfile(row: {
  id: string;
  email: string;
  role: string;
  firstName: string | null;
  phone: string | null;
  whatsapp: string | null;
  city: string | null;
  school: string | null;
  level: string | null;
  domains: string[] | null;
  skills: string[] | null;
  lookingFor: string[] | null;
  availability: string | null;
  cvName: string | null;
  createdAt: string;
}): Profile {
  return {
    id: row.id,
    role: row.role === "operateur" ? "operateur" : "etudiant",
    email: row.email,
    firstName: row.firstName ?? "",
    phone: row.phone ?? "",
    whatsapp: row.whatsapp ?? "",
    city: row.city ?? "",
    school: row.school ?? "",
    level: (row.level as Profile["level"]) || "",
    domains: row.domains ?? [],
    skills: row.skills ?? [],
    lookingFor: (row.lookingFor ?? []).filter((value): value is Seek => value === "stage" || value === "job"),
    availability: row.availability ?? "",
    cvPath: row.cvName ?? "",
    createdAt: row.createdAt,
  };
}

function mapOrganization(row: typeof organizations.$inferSelect): Organization {
  return { id: row.id, name: row.name, city: row.city, sector: row.sector, website: row.website };
}

function mapOpportunity(row: typeof opportunities.$inferSelect, organizationName: string): Opportunity {
  return {
    id: row.id,
    organizationId: row.organizationId,
    organizationName,
    type: row.type as Opportunity["type"],
    title: row.title,
    description: row.description,
    city: row.city,
    remote: row.remote,
    domains: row.domains ?? [],
    levels: row.levels ?? [],
    paid: row.paid as Paid,
    compensationNote: row.compensationNote,
    duration: row.duration,
    startDate: row.startDate,
    deadline: row.deadline,
    applyMode: row.applyMode as ApplyMode,
    applyTarget: row.applyTarget,
    status: row.status as OfferStatus,
    source: row.source,
    verifiedAt: row.verifiedAt,
    createdAt: row.createdAt,
  };
}

function mapInterest(row: typeof interests.$inferSelect): Interest {
  return {
    id: row.id,
    profileId: row.profileId,
    opportunityId: row.opportunityId,
    status: row.status as Interest["status"],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapReport(row: typeof reports.$inferSelect): Report {
  return {
    id: row.id,
    profileId: row.profileId,
    opportunityId: row.opportunityId,
    kind: row.kind as ReportKind,
    reason: row.reason,
    note: row.note,
    createdAt: row.createdAt,
    resolvedAt: row.resolvedAt,
  };
}
