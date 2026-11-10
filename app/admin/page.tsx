import Link from "next/link";
import { formatDay } from "@/lib/labels";
import { listInterests, listOpportunities, listReports } from "@/lib/repo";
import { todayISO } from "@/lib/labels";

export default async function AdminHome() {
  const [offers, interests, reports] = await Promise.all([listOpportunities(), listInterests(), listReports()]);
  const today = todayISO();
  const weekAgo = new Date(Date.parse(`${today}T00:00:00Z`) - 7 * 86_400_000).toISOString();
  const soon = offers.filter((offer) => offer.deadline && offer.deadline >= today && offer.deadline <= addDays(today, 7));
  const openReports = reports.filter((report) => report.kind === "signalement" && !report.resolvedAt);

  return (
    <main className="grid gap-6">
      <h1 className="font-serif text-3xl">Tableau</h1>
      <div className="grid gap-3 sm:grid-cols-3">
        <Count label="Offres publiées" value={offers.filter((offer) => offer.status === "publiee").length} />
        <Count label="Intérêts, 7 jours" value={interests.filter((item) => item.createdAt >= weekAgo).length} />
        <Count label="Signalements ouverts" value={openReports.length} />
      </div>
      <section className="grid gap-2">
        <h2 className="font-serif text-2xl">Signalements ouverts</h2>
        {openReports.length === 0 && <p className="text-sm text-muted">Aucun.</p>}
        {openReports.map((report) => (
          <Link key={report.id} href="/admin/signalements" className="text-sm">
            {report.reason} · {formatDay(report.createdAt)}
          </Link>
        ))}
      </section>
      <section className="grid gap-2">
        <h2 className="font-serif text-2xl">Dates limites proches</h2>
        {soon.length === 0 && <p className="text-sm text-muted">Aucune cette semaine.</p>}
        {soon.map((offer) => (
          <Link key={offer.id} href={`/admin/offres/${offer.id}`} className="text-sm">
            {offer.title} · {formatDay(offer.deadline)}
          </Link>
        ))}
      </section>
    </main>
  );
}

function Count({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <p className="font-serif text-3xl">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}

function addDays(day: string, count: number): string {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + count);
  return date.toISOString().slice(0, 10);
}
