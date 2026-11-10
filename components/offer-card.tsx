import Link from "next/link";
import { formatDay, paidLabel } from "@/lib/labels";

export type PublicOffer = {
  id: string;
  title: string;
  organizationName: string;
  phrase: string;
  paid: string;
  deadline: string | null;
  example?: boolean;
};

export function toPublicOffer(offer: {
  id: string;
  title: string;
  organizationName: string;
  phrase: string;
  paid: string;
  deadline: string | null;
  source?: string;
}): PublicOffer {
  return {
    id: offer.id,
    title: offer.title,
    organizationName: offer.organizationName,
    phrase: offer.phrase,
    paid: offer.paid,
    deadline: offer.deadline,
    example: offer.source === "simulation",
  };
}

export function OfferCard({ offer }: { offer: PublicOffer }) {
  return (
    <Link href={`/offres/${offer.id}`} className="tap block border-b border-line py-3">
      <span className="block text-base font-medium leading-snug">{offer.title}</span>
      <span className="mt-0.5 block text-sm">{offer.organizationName}</span>
      <span className="mt-1 block text-sm text-muted">{offer.phrase}</span>
      <span className="mt-2 flex flex-wrap items-center gap-2 text-sm">
        {offer.paid === "oui" ? (
          <span className="rounded-full bg-green-soft px-2 py-0.5 text-green">{paidLabel(offer.paid)}</span>
        ) : (
          <span>{paidLabel(offer.paid)}</span>
        )}
        {offer.deadline && <span>Limite {formatDay(offer.deadline)}</span>}
        {offer.example && <span>Exemple</span>}
      </span>
    </Link>
  );
}
