import type { ApplyMode, OfferStatus, Opportunity, Organization, Paid } from "./types";

function slug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function parseOffers(text: string): { organizations: Organization[]; opportunities: Opportunity[] } {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
  const header = lines[0]?.split(";") ?? [];
  const index = new Map(header.map((name, position) => [name.trim(), position]));
  const organizations = new Map<string, Organization>();
  const opportunities: Opportunity[] = [];

  lines.slice(1).forEach((line, lineIndex) => {
    const cells = line.split(";");
    const cell = (name: string) => (cells[index.get(name) ?? -1] ?? "").trim();
    const structure = cell("structure");
    const organizationId = `org-${slug(structure)}`;
    if (!organizations.has(organizationId)) {
      organizations.set(organizationId, {
        id: organizationId,
        name: structure,
        city: cell("ville_structure") || "Lome",
        sector: cell("secteur"),
        website: "",
      });
    }
    const number = String(lineIndex + 1).padStart(2, "0");
    opportunities.push({
      id: `sim-${number}`,
      organizationId,
      organizationName: structure,
      type: cell("type") as Opportunity["type"],
      title: cell("titre"),
      description: cell("description"),
      city: cell("ville"),
      remote: cell("remote") === "oui",
      domains: cell("filieres").split("|").filter(Boolean),
      levels: cell("niveaux").split("|").filter(Boolean),
      paid: (cell("remunere") || "inconnu") as Paid,
      compensationNote: cell("note_remuneration"),
      duration: cell("duree"),
      startDate: cell("date_debut") || null,
      deadline: cell("date_limite") || null,
      applyMode: (cell("mode") || "interet") as ApplyMode,
      applyTarget: cell("cible"),
      status: (cell("statut") || "brouillon") as OfferStatus,
      source: cell("source"),
      verifiedAt: cell("verifie_le") || null,
      createdAt: cell("verifie_le") || "2026-11-10",
    });
  });

  return { organizations: [...organizations.values()], opportunities };
}
