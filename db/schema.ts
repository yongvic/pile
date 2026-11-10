import { boolean, date, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("etudiant"),
  firstName: text("first_name"),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  city: text("city"),
  school: text("school"),
  level: text("level"),
  domains: text("domains").array().notNull().default([]),
  skills: text("skills").array().notNull().default([]),
  lookingFor: text("looking_for").array().notNull().default([]),
  availability: text("availability"),
  cvName: text("cv_name"),
  cvData: text("cv_data"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
});

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  city: text("city").notNull().default("Lome"),
  sector: text("sector").notNull().default(""),
  website: text("website").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
});

export const opportunities = pgTable("opportunities", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  city: text("city").notNull(),
  remote: boolean("remote").notNull().default(false),
  domains: text("domains").array().notNull().default([]),
  levels: text("levels").array().notNull().default([]),
  paid: text("paid").notNull().default("inconnu"),
  compensationNote: text("compensation_note").notNull().default(""),
  duration: text("duration").notNull().default(""),
  startDate: date("start_date", { mode: "string" }),
  deadline: date("deadline", { mode: "string" }),
  applyMode: text("apply_mode").notNull().default("interet"),
  applyTarget: text("apply_target").notNull().default(""),
  status: text("status").notNull().default("brouillon"),
  source: text("source").notNull().default(""),
  verifiedAt: timestamp("verified_at", { withTimezone: true, mode: "string" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
});

export const interests = pgTable(
  "interests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
    opportunityId: uuid("opportunity_id").notNull().references(() => opportunities.id, { onDelete: "cascade" }),
    status: text("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  },
  (table) => [unique("interests_profile_opportunity").on(table.profileId, table.opportunityId)],
);

export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  opportunityId: uuid("opportunity_id").notNull().references(() => opportunities.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  reason: text("reason").notNull(),
  note: text("note").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true, mode: "string" }),
});
