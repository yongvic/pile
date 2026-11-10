import type { CatalogueFilters, Opportunity, Profile } from "./types";
import { cityLabel, domainLabel, formatDay, levelPhrase } from "./labels";

const COMPATIBLE: Record<string, string[]> = {
  l2: ["l2", "etudiant"],
  l3: ["l2", "l3", "licence", "etudiant"],
  master: ["l3", "master", "fin_etudes", "licence"],
  jeune_diplome: ["jeune_diplome", "master", "fin_etudes", "debutant"],
};

export function isProfileComplete(profile: Profile): boolean {
  return Boolean(
    profile.firstName.trim() &&
      profile.whatsapp.trim() &&
      profile.city &&
      profile.school.trim() &&
      profile.level &&
      profile.domains.length > 0 &&
      profile.lookingFor.length > 0,
  );
}

export function isEligible(offer: Opportunity, today: string): boolean {
  if (offer.status !== "publiee" || !offer.verifiedAt) return false;
  if (offer.type !== "stage" && offer.type !== "job") return false;
  if (offer.deadline && offer.deadline < today) return false;
  return true;
}

function overlaps(left: string[], right: string[]): boolean {
  return left.some((value) => right.includes(value));
}

export function passesHardFilters(offer: Opportunity, profile: Profile): boolean {
  const place = offer.remote || offer.city === "tout_le_togo" || offer.city === profile.city;
  const kind = profile.lookingFor.includes(offer.type as "stage" | "job");
  const domain = overlaps(offer.domains, profile.domains);
  const levels = COMPATIBLE[profile.level] ?? [];
  const level = offer.levels.some((value) => levels.includes(value));
  return place && kind && domain && level;
}

export function scoreOffer(offer: Opportunity, profile: Profile, today: string): number {
  let score = 0;
  if (offer.remote || offer.city === "tout_le_togo") score += 2;
  else if (offer.city === profile.city) score += 3;
  if (overlaps(offer.domains, profile.domains)) score += 3;
  if (profile.level && offer.levels.includes(profile.level)) score += 2;
  else score += 1;
  if (offer.paid === "oui" || offer.paid === "non") score += 1;
  if (offer.verifiedAt && daysSince(offer.verifiedAt, today) <= 14) score += 1;
  return score;
}

function daysSince(iso: string, today: string): number {
  const from = Date.parse(`${iso.slice(0, 10)}T00:00:00Z`);
  const to = Date.parse(`${today}T00:00:00Z`);
  return Math.round((to - from) / 86_400_000);
}

export function offerPhrase(offer: Opportunity, profile: Profile): string {
  const place = offer.remote ? "Remote" : offer.city === "tout_le_togo" ? "Tout le Togo" : cityLabel(offer.city);
  const shared = offer.domains.filter((domain) => profile.domains.includes(domain));
  const domains = (shared.length > 0 ? shared : offer.domains).map(domainLabel).join(", ");
  const verified = offer.verifiedAt ? `vérifiée le ${formatDay(offer.verifiedAt)}` : "pas encore vérifiée";
  return [place, offer.type, levelPhrase(offer.levels), domains, verified].join(" · ");
}

export type RankedOffer = Opportunity & { score: number; phrase: string };

export function splitOffers(
  offers: Opportunity[],
  profile: Profile,
  dismissedIds: Set<string>,
  today: string,
  filters: CatalogueFilters,
): { pourToi: RankedOffer[]; catalogue: RankedOffer[] } {
  const eligible = offers.filter((offer) => isEligible(offer, today) && !dismissedIds.has(offer.id));
  const pourToi = eligible
    .filter((offer) => passesHardFilters(offer, profile))
    .map((offer) => rank(offer, profile, today))
    .sort(comparePourToi);
  const pourIds = new Set(pourToi.map((offer) => offer.id));
  const catalogue = eligible
    .filter((offer) => !pourIds.has(offer.id) && passesCatalogueFilters(offer, filters))
    .map((offer) => rank(offer, profile, today))
    .sort((a, b) => (b.verifiedAt ?? "").localeCompare(a.verifiedAt ?? ""));
  return { pourToi, catalogue };
}

function rank(offer: Opportunity, profile: Profile, today: string): RankedOffer {
  return { ...offer, score: scoreOffer(offer, profile, today), phrase: offerPhrase(offer, profile) };
}

function comparePourToi(a: RankedOffer, b: RankedOffer): number {
  if (b.score !== a.score) return b.score - a.score;
  const verified = (b.verifiedAt ?? "").localeCompare(a.verifiedAt ?? "");
  if (verified !== 0) return verified;
  const deadlineA = a.deadline ?? "9999-99-99";
  const deadlineB = b.deadline ?? "9999-99-99";
  return deadlineA.localeCompare(deadlineB);
}

function passesCatalogueFilters(offer: Opportunity, filters: CatalogueFilters): boolean {
  if (filters.ville && offer.city !== filters.ville && offer.city !== "tout_le_togo" && !offer.remote) return false;
  if (filters.type && offer.type !== filters.type) return false;
  if (filters.filiere && !offer.domains.includes(filters.filiere)) return false;
  if (filters.remunere && offer.paid !== filters.remunere) return false;
  return true;
}
