import Link from "next/link";
import { formatDay, paidLabel } from "@/lib/labels";
import type { RankedOffer } from "@/lib/matching";

export function OfferCard({ offer }: { offer: RankedOffer }) {
  return (
    <Link href={`/offres/${offer.id}`} className="block rounded-2xl border border-line bg-card p-4">
      <p className="text-sm text-muted">{offer.phrase}</p>
      <h2 className="mt-1 font-serif text-xl leading-tight">{offer.title}</h2>
      <p className="mt-1 text-sm">{offer.organizationName}</p>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-green-soft px-2 py-1 text-green">{paidLabel(offer.paid)}</span>
        {offer.deadline && <span className="rounded-full bg-sand px-2 py-1">Limite {formatDay(offer.deadline)}</span>}
        {offer.source === "simulation" && <span className="rounded-full bg-sand px-2 py-1">simulée</span>}
      </div>
    </Link>
  );
}
