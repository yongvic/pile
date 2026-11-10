import { listInterests, listOpportunities, listProfiles } from "@/lib/repo";
import { inputClass } from "@/components/classes";
import { formatDay, statusLabel } from "@/lib/labels";

export default async function AdminInterests({ searchParams }: { searchParams: Promise<{ offre?: string }> }) {
  const { offre } = await searchParams;
  const [interests, offers, students] = await Promise.all([listInterests(), listOpportunities(), listProfiles()]);
  const visible = offre ? interests.filter((item) => item.opportunityId === offre) : interests;
  const offerName = new Map(offers.map((offer) => [offer.id, offer.title]));
  const student = new Map(students.map((item) => [item.id, item]));
  return (
    <main className="grid gap-4">
      <h1 className="font-serif text-3xl">Intérêts</h1>
      <form method="get">
        <select className={inputClass} name="offre" defaultValue={offre ?? ""}>
          <option value="">Toutes les offres</option>
          {offers.map((offer) => (
            <option key={offer.id} value={offer.id}>
              {offer.title}
            </option>
          ))}
        </select>
        <button className="mt-2 text-sm text-green">Filtrer</button>
      </form>
      <ul className="grid gap-2">
        {visible.map((item) => {
          const person = student.get(item.profileId);
          return (
            <li key={item.id} className="rounded-2xl border border-line bg-card p-3 text-sm">
              <p className="font-medium">{person?.firstName || "Étudiant"}</p>
              <p>{person?.whatsapp}</p>
              <p className="text-muted">
                {person?.school} · {offerName.get(item.opportunityId)} · {statusLabel(item.status)} · {formatDay(item.createdAt)}
              </p>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
