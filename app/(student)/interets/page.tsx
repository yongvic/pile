import Link from "next/link";
import { redirect } from "next/navigation";
import { offerPhrase } from "@/lib/matching";
import { getProfile, listInterests, listOpportunities } from "@/lib/repo";
import { statusLabel } from "@/lib/labels";

export default async function InterestsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/connexion");
  const [interests, offers] = await Promise.all([listInterests(profile.id), listOpportunities()]);
  const byId = new Map(offers.map((offer) => [offer.id, offer]));
  const rows = interests.flatMap((interest) => {
    const offer = byId.get(interest.opportunityId);
    return offer ? [{ interest, offer }] : [];
  });
  const pending = rows.filter((row) => row.interest.status === "interesse");
  const sent = rows.filter((row) => row.interest.status === "candidate");

  return (
    <main className="grid gap-6">
      <h1 className="font-serif text-3xl">Mes intérêts</h1>
      {rows.length === 0 && (
        <p className="text-sm">
          Tu n’as pas encore marqué d’offre. <Link className="text-green" href="/">Voir les offres</Link>
        </p>
      )}
      <Group title="À envoyer" rows={pending} profile={profile} />
      <Group title="Envoyées" rows={sent} profile={profile} />
    </main>
  );
}

function Group({
  title,
  rows,
  profile,
}: {
  title: string;
  rows: { interest: { status: string }; offer: Parameters<typeof offerPhrase>[0] }[];
  profile: Parameters<typeof offerPhrase>[1];
}) {
  if (rows.length === 0) return null;
  return (
    <section className="grid gap-3">
      <h2 className="font-serif text-2xl">{title}</h2>
      {rows.map((row) => (
        <Link key={row.offer.id} href={`/offres/${row.offer.id}`} className="rounded-2xl border border-line bg-card p-4">
          <p className="font-medium">{row.offer.title}</p>
          <p className="text-sm text-muted">{row.offer.organizationName}</p>
          <p className="mt-1 text-sm">{offerPhrase(row.offer, profile)}</p>
          {row.offer.status !== "publiee" && <p className="mt-1 text-sm">{statusLabel(row.offer.status)}</p>}
        </Link>
      ))}
    </section>
  );
}
