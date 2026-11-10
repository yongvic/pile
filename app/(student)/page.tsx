import Link from "next/link";
import { redirect } from "next/navigation";
import { OfferCard } from "@/components/offer-card";
import { CITIES, DOMAINS } from "@/lib/labels";
import { isProfileComplete, splitOffers } from "@/lib/matching";
import { getProfile, listOpportunities, listReports } from "@/lib/repo";
import { todayISO } from "@/lib/labels";
import { buttonClass, inputClass } from "@/components/classes";

export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const profile = await getProfile();
  if (!profile) redirect("/connexion");
  if (!isProfileComplete(profile)) redirect("/profil");
  const params = await searchParams;
  const filters = {
    ville: params.ville || undefined,
    type: params.type || undefined,
    filiere: params.filiere || undefined,
    remunere: params.remunere || undefined,
  };
  const [offers, reports] = await Promise.all([listOpportunities(), listReports()]);
  const dismissed = new Set(reports.filter((report) => report.kind === "pas_pour_moi" && report.profileId === profile.id).map((report) => report.opportunityId));
  const { pourToi, catalogue } = splitOffers(offers, profile, dismissed, todayISO(), filters);
  const simulated = offers.some((offer) => offer.source === "simulation");

  return (
    <main className="grid gap-8">
      <div>
        <h1 className="font-serif text-4xl tracking-tight">Pile pour toi.</h1>
        {simulated && <p className="mt-2 text-sm text-muted">Les offres marquées simulées sont fictives.</p>}
      </div>
      <section className="grid gap-3">
        {pourToi.length === 0 ? (
          <p className="rounded-2xl bg-card p-4 text-sm">
            Rien pile pour toi cette semaine. Tu peux parcourir le catalogue, ou élargir ce que tu cherches dans ton{" "}
            <Link className="text-green" href="/profil">
              profil
            </Link>
            .
          </p>
        ) : (
          pourToi.map((offer) => <OfferCard key={offer.id} offer={offer} />)
        )}
      </section>
      <section id="catalogue" className="grid gap-3">
        <h2 className="font-serif text-2xl">Catalogue</h2>
        <form className="grid gap-2" method="get">
          <select className={inputClass} name="ville" defaultValue={filters.ville ?? ""}>
            <option value="">Toutes les villes</option>
            {CITIES.map((city) => (
              <option key={city.value} value={city.value}>
                {city.label}
              </option>
            ))}
          </select>
          <select className={inputClass} name="type" defaultValue={filters.type ?? ""}>
            <option value="">Stage et job</option>
            <option value="stage">stage</option>
            <option value="job">job</option>
          </select>
          <select className={inputClass} name="filiere" defaultValue={filters.filiere ?? ""}>
            <option value="">Toutes les filières</option>
            {DOMAINS.map((domain) => (
              <option key={domain.value} value={domain.value}>
                {domain.label}
              </option>
            ))}
          </select>
          <select className={inputClass} name="remunere" defaultValue={filters.remunere ?? ""}>
            <option value="">Rémunération</option>
            <option value="oui">rémunéré</option>
            <option value="non">non rémunéré</option>
          </select>
          <button className={buttonClass}>Filtrer</button>
        </form>
        {catalogue.length === 0 ? (
          <p className="text-sm text-muted">Aucune offre avec ces filtres.</p>
        ) : (
          catalogue.map((offer) => <OfferCard key={offer.id} offer={offer} />)
        )}
      </section>
    </main>
  );
}
