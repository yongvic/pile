import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CopyLink } from "@/components/copy-link";
import { OfferPanel } from "@/components/offer-panel";
import { formatDay, paidLabel } from "@/lib/labels";
import { isEligible, isProfileComplete, offerPhrase } from "@/lib/matching";
import { getOpportunity, getProfile, listInterests } from "@/lib/repo";
import { todayISO } from "@/lib/labels";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const offer = await getOpportunity(id);
  return { title: offer?.title ?? "Offre" };
}

export default async function OfferPage({ params }: Props) {
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
        <h1 className="text-3xl font-semibold tracking-tight">Offre fermée</h1>
        <p>Cette offre n’est plus en ligne.</p>
        <Link className="inline-flex min-h-11 items-center font-medium text-green" href="/">
          Retour aux offres
        </Link>
      </main>
    );
  }
  const closed = offer.status === "pourvue" || offer.status === "expiree" || Boolean(offer.deadline && offer.deadline < todayISO());

  return (
    <main className="grid gap-4">
      <div className="flex items-start justify-between gap-3">
        <Link href="/" className="inline-flex min-h-11 items-center text-sm font-medium">
          Offres
        </Link>
        <CopyLink path={`/offres/${offer.id}`} />
      </div>
      <p className="text-sm text-muted">{offerPhrase(offer, profile)}</p>
      <h1 className="text-3xl font-semibold leading-tight tracking-tight">{offer.title}</h1>
      <p>{offer.organizationName}</p>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {offer.paid === "oui" ? (
          <span className="rounded-full bg-green-soft px-2 py-0.5 text-green">{paidLabel(offer.paid)}</span>
        ) : (
          <span>{paidLabel(offer.paid)}</span>
        )}
        {offer.compensationNote && <span>{offer.compensationNote}</span>}
      </div>
      <dl className="grid gap-2 text-sm">
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
      {offer.status === "pourvue" && <p className="text-sm font-medium">Offre pourvue.</p>}
      {offer.status === "expiree" && <p className="text-sm font-medium">Offre expirée.</p>}
      {offer.status === "publiee" && offer.deadline && offer.deadline < todayISO() && (
        <p className="text-sm font-medium">La date limite est passée.</p>
      )}
      <p className="max-w-prose whitespace-pre-wrap leading-relaxed">{offer.description}</p>
      <OfferPanel
        id={offer.id}
        title={offer.title}
        mode={offer.applyMode}
        target={offer.applyTarget}
        status={interest?.status ?? null}
        closed={closed}
      />
    </main>
  );
}
