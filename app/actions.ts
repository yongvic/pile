"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isProfileComplete } from "@/lib/matching";
import {
  addReport,
  ensureOperator,
  getProfile,
  isDemo,
  markInterest,
  resolveReport,
  saveOpportunity,
  saveOrganization,
  saveProfile,
  signIn,
  signUp,
  type OfferInput,
  type ProfileInput,
} from "@/lib/repo";
import { clearSession } from "@/lib/auth";
import type { ActionState, ApplyMode, OfferStatus, Paid, ProfileLevel, Seek } from "@/lib/types";

function text(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

function profileInput(formData: FormData): ProfileInput {
  const level = text(formData, "level");
  const cv = formData.get("cv");
  return {
    firstName: text(formData, "firstName"),
    phone: text(formData, "phone"),
    whatsapp: text(formData, "whatsapp"),
    city: text(formData, "city"),
    school: text(formData, "school"),
    level: (level || "") as ProfileLevel | "",
    domains: formData.getAll("domains").map(String),
    skills: text(formData, "skills")
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean),
    lookingFor: formData.getAll("lookingFor").map(String).filter((value): value is Seek => value === "stage" || value === "job"),
    availability: text(formData, "availability"),
    cv: cv instanceof File ? cv : null,
  };
}

export async function saveProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const input = profileInput(formData);
  try {
    await saveProfile(input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Enregistrement impossible." };
  }
  const profile = await getProfile();
  revalidatePath("/", "layout");
  if (profile && isProfileComplete(profile)) redirect("/");
  return { message: "Encore quelques infos pour voir les offres." };
}

const accountHint = "Les comptes ne sont pas ouverts dans cet aperçu.";

export async function signInAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (isDemo()) return { error: accountHint };
  try {
    await signIn(text(formData, "email"), String(formData.get("password") ?? ""));
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Connexion impossible." };
  }
  redirect("/");
}

export async function signUpAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (isDemo()) return { error: accountHint };
  const password = String(formData.get("password") ?? "");
  if (password.length < 6) return { error: "Le mot de passe doit faire au moins 6 caractères." };
  if (password !== String(formData.get("confirm") ?? "")) return { error: "Les deux mots de passe diffèrent." };
  try {
    await signUp(text(formData, "email"), password);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Inscription impossible." };
  }
  redirect("/profil");
}

export async function signOutAction(): Promise<void> {
  if (!isDemo()) await clearSession();
  redirect(isDemo() ? "/" : "/connexion");
}

export async function requestPasswordAction(_prev: ActionState): Promise<ActionState> {
  return { message: "Le message de réinitialisation n'est pas envoyé. Le mot de passe se choisit à l'inscription." };
}

export async function markInterestedAction(id: string): Promise<{ error?: string; url?: string }> {
  try {
    const { getOpportunity } = await import("@/lib/repo");
    const offer = await getOpportunity(id);
    if (!offer) return { error: "Offre introuvable." };
    await markInterest(id, "interesse");
    revalidatePath("/", "layout");
    if (offer.applyMode === "lien" && offer.applyTarget) return { url: offer.applyTarget };
    if (offer.applyMode === "email" && offer.applyTarget) {
      return { url: `mailto:${offer.applyTarget}?subject=${encodeURIComponent(`Candidature — ${offer.title}`)}` };
    }
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Pas enregistré. Réessaie." };
  }
}

export async function markAppliedAction(id: string): Promise<ActionState> {
  try {
    await markInterest(id, "candidate");
    revalidatePath("/", "layout");
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Pas enregistré. Réessaie." };
  }
}

export async function dismissAction(id: string, reason: string): Promise<ActionState> {
  try {
    await addReport(id, "pas_pour_moi", reason, "");
    revalidatePath("/", "layout");
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Pas enregistré. Réessaie." };
  }
}

export async function reportAction(id: string, reason: string, note: string): Promise<ActionState> {
  try {
    await addReport(id, "signalement", reason, note);
    revalidatePath("/", "layout");
    return { message: "Signalement envoyé." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Pas enregistré. Réessaie." };
  }
}

export async function saveOfferAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const intent = text(formData, "intent");
  let status = (text(formData, "status") || "brouillon") as OfferStatus;
  if (intent === "brouillon") status = "brouillon";
  if (intent === "publier") status = "publiee";
  if (intent === "pourvue") status = "pourvue";
  if (intent === "expiree") status = "expiree";

  const input: OfferInput = {
    id: text(formData, "id") || undefined,
    organizationId: text(formData, "organizationId"),
    newOrganizationName: text(formData, "newOrganizationName"),
    newOrganizationCity: text(formData, "newOrganizationCity"),
    newOrganizationSector: text(formData, "newOrganizationSector"),
    type: (text(formData, "type") || "stage") as OfferInput["type"],
    title: text(formData, "title"),
    description: text(formData, "description"),
    city: text(formData, "city"),
    remote: formData.get("remote") === "on",
    domains: formData.getAll("domains").map(String),
    levels: formData.getAll("levels").map(String),
    paid: (text(formData, "paid") || "inconnu") as Paid,
    compensationNote: text(formData, "compensationNote"),
    duration: text(formData, "duration"),
    startDate: text(formData, "startDate") || null,
    deadline: text(formData, "deadline") || null,
    applyMode: (text(formData, "applyMode") || "interet") as ApplyMode,
    applyTarget: text(formData, "applyTarget"),
    status,
    source: text(formData, "source") || "saisie",
    verifiedAt: text(formData, "verifiedAt") || null,
  };

  if (!input.title) return { error: "Le titre est obligatoire." };
  if (status === "publiee") {
    const missing: string[] = [];
    if (!input.organizationId && !input.newOrganizationName) missing.push("structure");
    if (!input.description) missing.push("description");
    if (input.domains.length === 0) missing.push("filière");
    if (input.levels.length === 0) missing.push("niveau");
    if (!input.type) missing.push("type");
    if (!input.city && !input.remote) missing.push("ville");
    if ((input.applyMode === "lien" || input.applyMode === "email") && !input.applyTarget) missing.push("lien ou e-mail de candidature");
    if (missing.length > 0) return { error: `Pour publier, il manque : ${missing.join(", ")}.` };
    if (!input.verifiedAt) input.verifiedAt = new Date().toISOString();
  }
  if (intent === "reverifier") input.verifiedAt = new Date().toISOString();

  let id: string;
  try {
    id = await saveOpportunity(input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Enregistrement impossible." };
  }
  revalidatePath("/", "layout");
  redirect(`/admin/offres/${id}`);
}

export async function saveOrganizationAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!text(formData, "name")) return { error: "Le nom est obligatoire." };
  try {
    await saveOrganization({
      id: text(formData, "id") || undefined,
      name: text(formData, "name"),
      city: text(formData, "city") || "Lome",
      sector: text(formData, "sector"),
      website: text(formData, "website"),
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Enregistrement impossible." };
  }
  revalidatePath("/admin/structures");
  return { message: "Structure enregistrée." };
}

export async function resolveReportAction(id: string): Promise<void> {
  await resolveReport(id);
  revalidatePath("/admin/signalements");
}

export async function enterAdmin(): Promise<void> {
  await ensureOperator();
}
