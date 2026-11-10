import type { Metadata } from "next";
import { StructureReading } from "@/components/structure-reading";
import { buttonClass, inputClass, labelClass } from "@/components/classes";
import { adminMetadata } from "@/lib/admin-meta";
import { listInterests, listOpportunities, listProfiles } from "@/lib/repo";
import { formatDay, levelLabel, statusLabel } from "@/lib/labels";

export async function generateMetadata(): Promise<Metadata> {
  return adminMetadata("Intérêts");
}

export default async function AdminInterests({ searchParams }: { searchParams: Promise<{ offre?: string }> }) {
  const { offre } = await searchParams;
  const [interests, offers, students] = await Promise.all([listInterests(), listOpportunities(), listProfiles()]);
  const visible = offre ? interests.filter((item) => item.opportunityId === offre) : interests;
  const offerName = new Map(offers.map((offer) => [offer.id, offer.title]));
  const student = new Map(students.map((item) => [item.id, item]));
  const chosen = offre ? offerName.get(offre) : "";
  const rows = visible.map((item) => {
    const person = student.get(item.profileId);
    return {
      id: item.id,
      name: person?.firstName || "Étudiant",
      whatsapp: person?.whatsapp || "",
      school: person?.school || "",
      level: person?.level ? levelLabel(person.level) : "",
      status: statusLabel(item.status),
      date: formatDay(item.createdAt),
      offer: offerName.get(item.opportunityId) || "Offre introuvable",
    };
  });

  return (
    <main className="grid max-w-3xl gap-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Intérêts</h1>
        <p className="mt-1 max-w-prose text-sm text-muted">
          Choisis une offre avant de tourner l’écran vers une structure. La lecture ne montre ni e-mail, ni CV, ni signalement.
        </p>
      </div>
      <form method="get" className="grid gap-2 sm:max-w-md">
        <label className={labelClass}>
          Offre
          <select className={inputClass} name="offre" defaultValue={offre ?? ""}>
            <option value="">Toutes les offres</option>
            {offers.map((offer) => (
              <option key={offer.id} value={offer.id}>
                {offer.title}
              </option>
            ))}
          </select>
        </label>
        <button className={buttonClass}>Afficher cette offre</button>
      </form>
      {chosen ? (
        <StructureReading offerTitle={chosen} rows={rows} />
      ) : (
        <p className="text-sm">Aucune offre n’est choisie. La liste ci-dessous est pour toi, pas pour une structure.</p>
      )}
      {rows.length === 0 ? (
        <p className="text-sm">{chosen ? "Aucun étudiant n’a marqué cette offre." : "Aucun intérêt enregistré."}</p>
      ) : (
        <ul className="border-t border-line">
          {rows.map((row) => (
            <li key={row.id} className="border-b border-line py-3 text-sm">
              <p className="font-medium">{row.name}</p>
              <p>{row.whatsapp || "WhatsApp non renseigné"}</p>
              <p className="text-muted">
                {row.school || "École non renseignée"} · {row.level || "Niveau non renseigné"} · {row.offer} · {row.status} · {row.date}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
