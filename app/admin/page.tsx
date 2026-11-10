import type { Metadata } from "next";
import Link from "next/link";
import { REPORT_REASONS, formatDay, todayISO } from "@/lib/labels";
import { adminMetadata } from "@/lib/admin-meta";
import { listInterests, listOpportunities, listReports } from "@/lib/repo";

export async function generateMetadata(): Promise<Metadata> {
  return adminMetadata("À faire");
}

export default async function AdminHome() {
  const [offers, interests, reports] = await Promise.all([listOpportunities(), listInterests(), listReports()]);
  const today = todayISO();
  const weekAgo = new Date(Date.parse(`${today}T00:00:00Z`) - 7 * 86_400_000).toISOString();
  const soon = offers.filter((offer) => offer.deadline && offer.deadline >= today && offer.deadline <= addDays(today, 7));
  const openReports = reports.filter((report) => report.kind === "signalement" && !report.resolvedAt);
  const reasonLabel = Object.fromEntries(REPORT_REASONS.map((item) => [item.value, item.label]));
  const published = offers.filter((offer) => offer.status === "publiee").length;
  const recentInterests = interests.filter((item) => item.createdAt >= weekAgo).length;

  return (
    <main className="grid max-w-3xl gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">À faire</h1>
        <p className="mt-1 text-sm text-muted">Ce qui attend une décision. Les chiffres ouvrent la liste correspondante.</p>
      </div>
      <ul className="grid gap-2 text-sm">
        <li>
          <Link className="inline-flex min-h-11 items-center font-medium" href="/admin/signalements?kind=signalement">
            <span className="tabular-nums">{openReports.length}</span>&nbsp;signalement{openReports.length > 1 ? "s" : ""} ouvert{openReports.length > 1 ? "s" : ""}
          </Link>
        </li>
        <li>
          <Link className="inline-flex min-h-11 items-center font-medium" href="/admin/offres?statut=publiee">
            <span className="tabular-nums">{published}</span>&nbsp;offre{published > 1 ? "s" : ""} publiée{published > 1 ? "s" : ""}
          </Link>
        </li>
        <li>
          <Link className="inline-flex min-h-11 items-center font-medium" href="/admin/interets">
            <span className="tabular-nums">{recentInterests}</span>&nbsp;intérêt{recentInterests > 1 ? "s" : ""} depuis 7 jours
          </Link>
        </li>
      </ul>
      <section className="grid gap-2">
        <h2 className="text-xl font-semibold">Signalements ouverts</h2>
        {openReports.length === 0 && <p className="text-sm">Aucun signalement en attente.</p>}
        <ul>
          {openReports.map((report) => (
            <li key={report.id}>
              <Link href={`/admin/signalements?kind=signalement#${report.id}`} className="inline-flex min-h-11 items-center text-sm">
                {reasonLabel[report.reason] ?? report.reason} · {formatDay(report.createdAt)}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section className="grid gap-2">
        <h2 className="text-xl font-semibold">Dates limites dans 7 jours</h2>
        {soon.length === 0 && <p className="text-sm">Aucune date limite cette semaine.</p>}
        <ul>
          {soon.map((offer) => (
            <li key={offer.id}>
              <Link href={`/admin/offres/${offer.id}`} className="inline-flex min-h-11 items-center text-sm">
                {offer.title} · {formatDay(offer.deadline)}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function addDays(day: string, count: number): string {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + count);
  return date.toISOString().slice(0, 10);
}
