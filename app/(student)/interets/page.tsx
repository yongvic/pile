import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { offerPhrase } from "@/lib/matching";
import { getProfile, listInterests, listOpportunities } from "@/lib/repo";
import { statusLabel } from "@/lib/labels";
import type { ApplyMode, Interest, Opportunity, Profile } from "@/lib/types";

export const metadata: Metadata = { title: "Suivi" };

export default async function InterestsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/connexion");
  const [interests, offers] = await Promise.all([listInterests(profile.id), listOpportunities()]);
  const byId = new Map(offers.map((offer) => [offer.id, offer]));
  const rows = interests.flatMap((interest) => {
    const offer = byId.get(interest.opportunityId);
    return offer ? [{ interest, offer }] : [];
  });
  const toSend = rows.filter((row) => row.interest.status === "interesse" && row.offer.applyMode !== "interet");
  const handed = rows.filter((row) => row.interest.status === "interesse" && row.offer.applyMode === "interet");
  const sent = rows.filter((row) => row.interest.status === "candidate");

  return (
    <main className="grid gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Suivi</h1>
        <p className="mt-1 text-sm text-muted">Les offres que tu as marquées. Ouvre une ligne pour déclarer l’envoi ou relire la fiche.</p>
      </div>
      {rows.length === 0 && (
        <p className="text-sm">
          Tu n’as pas encore marqué d’offre.{" "}
          <Link className="font-medium text-green" href="/">
            Voir les offres
          </Link>
        </p>
      )}
      <Group title="À envoyer" rows={toSend} profile={profile} hint="Le lien ou le message est prêt. Déclare l’envoi quand c’est fait." />
      <Group title="Transmises par Pile" rows={handed} profile={profile} hint="Rien à envoyer toi-même. Pile a ton nom." />
      <Group title="Candidatures déclarées" rows={sent} profile={profile} hint="Tu as dit avoir envoyé. Pile ne retire pas cette déclaration." />
    </main>
  );
}

function nextStep(mode: ApplyMode, status: Interest["status"]): string {
  if (status === "candidate") return "Tu as déclaré avoir candidaté.";
  if (mode === "interet") return "Pile transmet ton nom.";
  if (mode === "email") return "Le message est préparé. Déclare quand tu as envoyé.";
  return "Le lien est ouvert. Déclare quand tu as envoyé.";
}

function Group({
  title,
  rows,
  profile,
  hint,
}: {
  title: string;
  rows: { interest: Interest; offer: Opportunity }[];
  profile: Profile;
  hint: string;
}) {
  if (rows.length === 0) return null;
  return (
    <section className="grid gap-2">
      <h2 className="text-xl font-semibold">
        {title} <span className="tabular-nums text-base font-medium text-muted">{rows.length}</span>
      </h2>
      <p className="text-sm text-muted">{hint}</p>
      <ul className="border-t border-line">
        {rows.map((row) => (
          <li key={row.offer.id} className="border-b border-line">
            <Link href={`/offres/${row.offer.id}`} className="block py-3">
              <span className="block font-medium">{row.offer.title}</span>
              <span className="mt-0.5 block text-sm">{row.offer.organizationName}</span>
              <span className="mt-1 block text-sm">{nextStep(row.offer.applyMode, row.interest.status)}</span>
              <span className="mt-1 block text-sm text-muted">{offerPhrase(row.offer, profile)}</span>
              {row.offer.status !== "publiee" && <span className="mt-1 block text-sm font-medium">{statusLabel(row.offer.status)}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
