import Link from "next/link";
import { listInterests, listOpportunities } from "@/lib/repo";
import { buttonClass } from "@/components/classes";
import { statusLabel } from "@/lib/labels";

export default async function AdminOffers({ searchParams }: { searchParams: Promise<{ statut?: string }> }) {
  const { statut } = await searchParams;
  const [offers, interests] = await Promise.all([listOpportunities(), listInterests()]);
  const visible = statut ? offers.filter((offer) => offer.status === statut) : offers;
  return (
    <main className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-serif text-3xl">Offres</h1>
        <Link className={buttonClass} href="/admin/offres/nouvelle">
          Nouvelle offre
        </Link>
      </div>
      <form className="flex gap-2 text-sm" method="get">
        {["", "brouillon", "publiee", "pourvue", "expiree"].map((status) => (
          <button key={status || "tous"} name="statut" value={status} className="rounded-full border border-line px-3 py-1">
            {status ? statusLabel(status) : "toutes"}
          </button>
        ))}
      </form>
      <ul className="grid gap-2">
        {visible.map((offer) => {
          const count = interests.filter((item) => item.opportunityId === offer.id).length;
          return (
            <li key={offer.id}>
              <Link href={`/admin/offres/${offer.id}`} className="block rounded-2xl border border-line bg-card p-3">
                <span className="font-medium">{offer.title}</span>
                <span className="mt-1 block text-sm text-muted">
                  {offer.organizationName} · {offer.type} · {statusLabel(offer.status)} · {count} intérêt{count > 1 ? "s" : ""}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
