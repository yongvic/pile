import { readFileSync } from "node:fs";
import { splitOffers } from "../lib/matching";
import { parseOffers } from "../lib/csv";
import type { Profile } from "../lib/types";

const awa: Profile = {
  id: "awa",
  role: "etudiant",
  email: "awa@exemple.tg",
  firstName: "Awa",
  phone: "",
  whatsapp: "+22890000000",
  city: "Lome",
  school: "Université de Lomé",
  level: "l3",
  domains: ["informatique"],
  skills: [],
  lookingFor: ["stage"],
  availability: "",
  cvPath: "",
  createdAt: "2026-11-10",
};

const text = readFileSync(new URL("../docs/phase-0/offres.csv", import.meta.url), "utf8");
const { opportunities } = parseOffers(text);
if (opportunities.length !== 30) {
  throw new Error(`30 offres attendues, ${opportunities.length} lues.`);
}

const { pourToi, catalogue } = splitOffers(opportunities, awa, new Set(), "2026-11-10", {});
const titles = new Set(pourToi.map((offer) => offer.title));
if (!titles.has("Stage développement web")) throw new Error("Le stage web L3 doit être dans Pile pour toi.");
if (titles.has("Stage intégration paiement")) throw new Error("Un stage master seul ne doit pas matcher une L3.");
if (titles.has("Développeur junior")) throw new Error("Un job ne doit pas matcher une recherche de stage.");
if (!catalogue.some((offer) => offer.title === "Développeur junior")) throw new Error("Le job doit rester au catalogue.");
if (pourToi[0] && pourToi[0].score < (pourToi.at(-1)?.score ?? 0)) throw new Error("Le tri par score est inversé.");
const phrase = pourToi.find((offer) => offer.title === "Stage développement web")?.phrase ?? "";
if (!phrase.startsWith("Lomé · stage · licence 3 · informatique · vérifiée le")) {
  throw new Error(`Phrase inattendue : ${phrase}`);
}

console.log(`ok ${pourToi.length} pour toi, ${catalogue.length} au catalogue`);
