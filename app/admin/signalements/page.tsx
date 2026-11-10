import type { Metadata } from "next";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { resolveReport, listOpportunities, listProfiles, listReports } from "@/lib/repo";
import { DISMISS_REASONS, REPORT_REASONS, formatDay } from "@/lib/labels";
import { quietButtonClass } from "@/components/classes";
import { adminMetadata } from "@/lib/admin-meta";

export async function generateMetadata(): Promise<Metadata> {
  return adminMetadata("Signalements");
}

const reasons = Object.fromEntries([...DISMISS_REASONS, ...REPORT_REASONS].map((item) => [item.value, item.label]));

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const { kind } = await searchParams;
  const current = kind === "signalement" || kind === "pas_pour_moi" ? kind : "";
  const [reports, offers, students] = await Promise.all([listReports(), listOpportunities(), listProfiles()]);
  const offerName = new Map(offers.map((offer) => [offer.id, offer.title]));
  const studentName = new Map(students.map((student) => [student.id, student.firstName || student.email]));
  const visible = current ? reports.filter((report) => report.kind === current) : reports;
  const open = visible.filter((report) => !report.resolvedAt);
  const done = visible.filter((report) => report.resolvedAt);

  async function treat(formData: FormData) {
    "use server";
    await resolveReport(String(formData.get("id") ?? ""));
    revalidatePath("/admin/signalements");
  }

  return (
    <main className="grid max-w-3xl gap-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Signalements</h1>
        <p className="mt-1 max-w-prose text-sm text-muted">
          Un signalement demande de retirer ou de corriger une offre. « Pas pour moi » sert à voir si le tri dérape. Les deux ne se traitent pas de la même façon.
        </p>
      </div>
      <form className="flex gap-2 overflow-x-auto text-sm" method="get">
        {[
          ["", "Tout"],
          ["signalement", "Signalements"],
          ["pas_pour_moi", "Pas pour moi"],
        ].map(([value, label]) => {
          const active = current === value;
          return (
            <button
              key={value || "tout"}
              name="kind"
              value={value}
              aria-pressed={active}
              className={`inline-flex min-h-11 shrink-0 items-center rounded-full px-3 ${active ? "bg-ink font-medium text-paper" : "border border-line"}`}
            >
              {label}
            </button>
          );
        })}
      </form>
      {visible.length === 0 && <p className="text-sm">Rien dans cette liste.</p>}
      <ReportGroup title="À traiter" rows={open} offerName={offerName} studentName={studentName} treat={treat} />
      <ReportGroup title="Déjà traités" rows={done} offerName={offerName} studentName={studentName} />
    </main>
  );
}

function ReportGroup({
  title,
  rows,
  offerName,
  studentName,
  treat,
}: {
  title: string;
  rows: { id: string; kind: string; reason: string; note: string; opportunityId: string; profileId: string; createdAt: string; resolvedAt: string | null }[];
  offerName: Map<string, string>;
  studentName: Map<string, string>;
  treat?: (formData: FormData) => Promise<void>;
}) {
  if (rows.length === 0) return null;
  return (
    <section className="grid gap-2">
      <h2 className="text-xl font-semibold">
        {title} <span className="tabular-nums text-base font-medium text-muted">{rows.length}</span>
      </h2>
      <ul className="border-t border-line">
        {rows.map((report) => {
          const titleText = offerName.get(report.opportunityId);
          return (
            <li key={report.id} id={report.id} className="border-b border-line py-3 text-sm">
              <p className="font-medium">
                {report.kind === "signalement" ? "Signalement" : "Pas pour moi"} · {reasons[report.reason] ?? report.reason}
              </p>
              {titleText ? (
                <Link className="inline-flex min-h-11 items-center font-medium text-green" href={`/admin/offres/${report.opportunityId}`}>
                  Ouvrir l’offre : {titleText}
                </Link>
              ) : (
                <p>Offre introuvable</p>
              )}
              <p className="text-muted">
                {studentName.get(report.profileId) || "Étudiant"} · {formatDay(report.createdAt)}
                {report.resolvedAt ? " · traité" : ""}
              </p>
              {report.note && <p>{report.note}</p>}
              {treat && !report.resolvedAt && (
                <form action={treat} className="mt-2">
                  <input type="hidden" name="id" value={report.id} />
                  <button className={quietButtonClass}>Marquer comme traité</button>
                </form>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
