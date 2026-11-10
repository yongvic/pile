export const CITIES: { value: string; label: string }[] = [
  { value: "Lome", label: "Lomé" },
  { value: "Kara", label: "Kara" },
  { value: "Sokode", label: "Sokodé" },
  { value: "Atakpame", label: "Atakpamé" },
  { value: "Kpalime", label: "Kpalimé" },
  { value: "Dapaong", label: "Dapaong" },
  { value: "Tsevie", label: "Tsévié" },
  { value: "autre", label: "Autre" },
];

export const OFFER_CITIES = [...CITIES, { value: "tout_le_togo", label: "Tout le Togo" }];

export const DOMAINS: { value: string; label: string }[] = [
  { value: "informatique", label: "informatique" },
  { value: "gestion", label: "gestion" },
  { value: "logistique", label: "logistique" },
  { value: "droit", label: "droit" },
  { value: "marketing", label: "marketing" },
  { value: "finance", label: "finance" },
  { value: "communication", label: "communication" },
];

export const PROFILE_LEVELS: { value: string; label: string }[] = [
  { value: "l2", label: "Licence 2" },
  { value: "l3", label: "Licence 3" },
  { value: "master", label: "Master" },
  { value: "jeune_diplome", label: "Jeune diplômé" },
];

export const OFFER_LEVELS: { value: string; label: string }[] = [
  ...PROFILE_LEVELS,
  { value: "etudiant", label: "Étudiant" },
  { value: "licence", label: "Licence" },
  { value: "fin_etudes", label: "Fin d'études" },
  { value: "debutant", label: "Débutant" },
];

export const DISMISS_REASONS = [
  { value: "mauvaise_ville", label: "Mauvaise ville" },
  { value: "mauvais_niveau", label: "Mauvais niveau" },
  { value: "deja_pourvue", label: "Déjà pourvue" },
  { value: "autre", label: "Autre" },
];

export const REPORT_REASONS = [
  { value: "demande_argent", label: "On me demande de l'argent" },
  { value: "offre_fausse", label: "L'offre semble fausse" },
  { value: "deja_pourvue", label: "Déjà pourvue" },
  { value: "autre", label: "Autre" },
];

const CITY_LABELS = Object.fromEntries(OFFER_CITIES.map((city) => [city.value, city.label]));
const LEVEL_PHRASE: Record<string, string> = {
  l2: "licence 2",
  l3: "licence 3",
  master: "master",
  jeune_diplome: "jeune diplômé",
  etudiant: "étudiant",
  licence: "licence",
  fin_etudes: "fin d'études",
  debutant: "débutant",
};

export function cityLabel(value: string): string {
  return CITY_LABELS[value] ?? value;
}

export function levelLabel(value: string): string {
  return OFFER_LEVELS.find((level) => level.value === value)?.label ?? value;
}

export function levelPhrase(values: string[]): string {
  return values.map((value) => LEVEL_PHRASE[value] ?? value).join(" ou ");
}

export function domainLabel(value: string): string {
  return DOMAINS.find((domain) => domain.value === value)?.label ?? value;
}

export function paidLabel(value: string): string {
  if (value === "oui") return "rémunéré";
  if (value === "non") return "non rémunéré";
  return "rémunération non précisée";
}

export function statusLabel(value: string): string {
  const labels: Record<string, string> = {
    brouillon: "brouillon",
    publiee: "publiée",
    pourvue: "pourvue",
    expiree: "expirée",
    interesse: "à envoyer",
    candidate: "envoyée",
  };
  return labels[value] ?? value;
}

export function formatDay(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(`${iso.slice(0, 10)}T12:00:00Z`);
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", timeZone: "UTC" }).format(date);
}

export function todayISO(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Lome" });
}
