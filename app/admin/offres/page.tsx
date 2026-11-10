import type { Metadata } from "next";
import Link from "next/link";
import { listInterests, listOpportunities } from "@/lib/repo";
import { buttonClass } from "@/components/classes";
import { formatDay, statusLabel } from "@/lib/labels";
import { adminMetadata } from "@/lib/admin-meta";

export async function generateMetadata(): Promise<Metadata> {
  return adminMetadata("Offres");
}

const statuses = ["", "brouillon", "publiee", "pourvue", "expiree"];

export default async function AdminOffers({ searchParams }: { searchParams: Promise<{ statut?: string }> }) {
  const { statut } = await searchParams;
  const current = statut ?? "";
  const [offers, interests] = await Promise.all([listOpportunities(), listInterests()]);
  const visible = current ? offers.filter((offer) => offer.status === current) : offers;
  return (
    <main className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Offres</h1>
        <Link className={buttonClass} href="/admin/offres/nouvelle">
          Nouvelle offre
        </Link>
      </div>
      <form className="flex gap-2 overflow-x-auto text-sm" method="get">
        {statuses.map((status) => {
          const active = current === status;
          return (
            <button
              key={status || "tous"}
              name="statut"
              value={status}
              aria-pressed={active}
              className={`inline-flex min-h-11 shrink-0 items-center rounded-full px-3 ${active ? "bg-ink font-medium text-paper" : "border border-line"}`}
            >
              {status ? statusLabel(status) : "Toutes"}
            </button>
          );
        })}
      </form>
      {visible.length === 0 ? (
        <p className="text-sm">
          {current ? `Aucune offre ${statusLabel(current)}.` : "Aucune offre enregistrée."}{" "}
          {current && (
            <Link className="font-medium text-green" href="/admin/offres">
              Voir toutes les offres
            </Link>
          )}
        </p>
      ) : (
        <ul className="border-t border-line">
          {visible.map((offer) => {
            const count = interests.filter((item) => item.opportunityId === offer.id).length;
            return (
              <li key={offer.id} className="border-b border-line">
                <Link href={`/admin/offres/${offer.id}`} className="block py-3">
                  <span className="font-medium">{offer.title}</span>
                  <span className="mt-1 block text-sm text-muted">
                    {offer.organizationName} · {offer.type === "job" ? "Job" : "Stage"} · {statusLabel(offer.status)} ·{" "}
                    {offer.verifiedAt ? `vérifiée le ${formatDay(offer.verifiedAt)}` : "pas encore vérifiée"} · {count} intérêt
                    {count > 1 ? "s" : ""}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
