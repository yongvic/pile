import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { OfferList } from "@/components/offer-list";
import { toPublicOffer } from "@/components/offer-card";
import { buttonClass, inputClass, labelClass } from "@/components/classes";
import { CITIES, DOMAINS, cityLabel, domainLabel, todayISO } from "@/lib/labels";
import { isEligible, isProfileComplete, splitOffers } from "@/lib/matching";
import { getProfile, listOpportunities, listReports } from "@/lib/repo";

export const metadata: Metadata = { title: "Offres" };

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
  const hasFilter = Boolean(filters.ville || filters.type || filters.filiere || filters.remunere);
  const [offers, reports] = await Promise.all([listOpportunities(), listReports()]);
  const dismissed = new Set(
    reports.filter((report) => report.kind === "pas_pour_moi" && report.profileId === profile.id).map((report) => report.opportunityId),
  );
  const today = todayISO();
  const all = splitOffers(offers, profile, dismissed, today, {});
  const selected = hasFilter ? splitOffers(offers, profile, dismissed, today, filters) : all;
  const anyEligible = offers.some((offer) => isEligible(offer, today));
  const examples = [...all.pourToi, ...selected.catalogue].some((offer) => offer.source === "simulation");
  const filterBits = [
    filters.ville ? cityLabel(filters.ville) : "",
    filters.type === "stage" ? "Stage" : filters.type === "job" ? "Job" : "",
    filters.filiere ? domainLabel(filters.filiere) : "",
    filters.remunere === "oui" ? "rémunéré" : filters.remunere === "non" ? "non rémunéré" : "",
  ].filter(Boolean);

  return (
    <main className="grid gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Offres</h1>
        <p className="mt-1 text-sm text-muted">
          {profile.firstName ? `${profile.firstName}, ` : ""}
          Pour toi suit ta ville, ton niveau et ta filière. Le catalogue est le reste.
        </p>
        {examples && <p className="mt-2 text-sm">Les lignes marquées « exemple » ne sont pas de vraies annonces.</p>}
      </div>

      {!anyEligible ? (
        <p className="text-sm">Les premières offres arrivent.</p>
      ) : (
        <>
          <section className="grid gap-3" aria-labelledby="pour-toi">
            <h2 id="pour-toi" className="text-xl font-semibold">
              Pour toi <span className="tabular-nums text-base font-medium text-muted">{all.pourToi.length}</span>
            </h2>
            {all.pourToi.length === 0 && all.catalogue.length > 0 && (
              <p className="text-sm">
                Rien pile pour toi cette semaine. Tu peux parcourir le catalogue, ou élargir ce que tu cherches dans ton{" "}
                <Link className="font-medium text-green" href="/profil">
                  profil
                </Link>
                .
              </p>
            )}
            {all.pourToi.length === 0 && all.catalogue.length === 0 && (
              <p className="text-sm">Tu as écarté les offres de cette semaine. Elles ne reviennent pas dans tes listes.</p>
            )}
            {all.pourToi.length > 0 && (
              <OfferList offers={all.pourToi.map((offer) => toPublicOffer(offer))} empty="Rien pile pour toi cette semaine." />
            )}
          </section>

          {(all.catalogue.length > 0 || hasFilter) && (
          <section id="catalogue" className="grid gap-3" aria-labelledby="catalogue-titre">
            <h2 id="catalogue-titre" className="text-xl font-semibold">
              Catalogue <span className="tabular-nums text-base font-medium text-muted">{selected.catalogue.length}</span>
            </h2>
            <p className="text-sm text-muted">Ces filtres ne changent pas « Pour toi ».</p>
            <details className="rounded-lg border border-line bg-card p-3" {...(hasFilter ? { open: true } : {})}>
              <summary className="min-h-11 cursor-pointer py-2 font-medium">Filtrer le catalogue</summary>
              <form className="mt-3 grid gap-3 sm:grid-cols-2" method="get">
                <label className={labelClass}>
                  Ville
                  <select className={inputClass} name="ville" defaultValue={filters.ville ?? ""}>
                    <option value="">Toutes</option>
                    {CITIES.map((city) => (
                      <option key={city.value} value={city.value}>
                        {city.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={labelClass}>
                  Type
                  <select className={inputClass} name="type" defaultValue={filters.type ?? ""}>
                    <option value="">Stage et job</option>
                    <option value="stage">Stage</option>
                    <option value="job">Job</option>
                  </select>
                </label>
                <label className={labelClass}>
                  Filière
                  <select className={inputClass} name="filiere" defaultValue={filters.filiere ?? ""}>
                    <option value="">Toutes</option>
                    {DOMAINS.map((domain) => (
                      <option key={domain.value} value={domain.value}>
                        {domain.label[0].toUpperCase()}
                        {domain.label.slice(1)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={labelClass}>
                  Rémunération
                  <select className={inputClass} name="remunere" defaultValue={filters.remunere ?? ""}>
                    <option value="">Toutes</option>
                    <option value="oui">Rémunéré</option>
                    <option value="non">Non rémunéré</option>
                  </select>
                </label>
                <button className={`${buttonClass} sm:col-span-2`}>Afficher</button>
              </form>
            </details>
            {hasFilter && (
              <p className="text-sm">
                Filtre : {filterBits.join(" · ")}.{" "}
                <Link className="font-medium text-green" href="/">
                  Tout effacer
                </Link>
              </p>
            )}
            <OfferList
              offers={selected.catalogue.map((offer) => toPublicOffer(offer))}
              empty={hasFilter ? "Aucune offre avec ces filtres." : "Le catalogue est vide. Tout ce qui est ouvert est dans Pour toi."}
            />
          </section>
          )}
        </>
      )}
    </main>
  );
}
