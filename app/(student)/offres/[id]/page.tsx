import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { OfferPanel } from "@/components/offer-panel";
import { formatDay, paidLabel } from "@/lib/labels";
import { isEligible, isProfileComplete, offerPhrase } from "@/lib/matching";
import { getOpportunity, getProfile, listInterests } from "@/lib/repo";
import { todayISO } from "@/lib/labels";

export default async function OfferPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await getProfile();
  if (!profile) redirect("/connexion");
  if (!isProfileComplete(profile)) redirect("/profil");
  const { id } = await params;
  const offer = await getOpportunity(id);
  if (!offer) notFound();
  const interest = (await listInterests(profile.id)).find((item) => item.opportunityId === id) ?? null;
  const visible = isEligible(offer, todayISO()) || interest;
  if (!visible) {
    return (
      <main className="grid gap-3">
        <p>Cette offre n’est plus en ligne.</p>
        <Link className="text-green" href="/">
          Retour
        </Link>
      </main>
    );
  }
  const closed = offer.status === "pourvue" || offer.status === "expiree" || (offer.deadline && offer.deadline < todayISO());

  return (
    <main className="grid gap-4">
      <p className="text-sm text-muted">{offerPhrase(offer, profile)}</p>
      <h1 className="font-serif text-3xl leading-tight">{offer.title}</h1>
      <p>{offer.organizationName}</p>
      <div className="flex flex-wrap gap-2 text-sm">
        <span className="rounded-full bg-green-soft px-2 py-1">{paidLabel(offer.paid)}</span>
        {offer.compensationNote && <span>{offer.compensationNote}</span>}
      </div>
      <dl className="grid gap-1 text-sm">
        {offer.duration && (
          <div>
            <dt className="text-muted">Durée</dt>
            <dd>{offer.duration}</dd>
          </div>
        )}
        {offer.startDate && (
          <div>
            <dt className="text-muted">Début</dt>
            <dd>{formatDay(offer.startDate)}</dd>
          </div>
        )}
        {offer.deadline && (
          <div>
            <dt className="text-muted">Date limite</dt>
            <dd>{formatDay(offer.deadline)}</dd>
          </div>
        )}
      </dl>
      {offer.verifiedAt && <p className="text-sm">Vérifiée le {formatDay(offer.verifiedAt)}</p>}
      {(offer.status === "pourvue" || offer.status === "expiree") && <p className="text-sm">Offre {offer.status === "pourvue" ? "pourvue" : "expirée"}.</p>}
      <p className="whitespace-pre-wrap leading-relaxed">{offer.description}</p>
      {!closed && <OfferPanel id={offer.id} mode={offer.applyMode} status={interest?.status ?? null} />}
    </main>
  );
}
