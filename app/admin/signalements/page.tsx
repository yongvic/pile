import { revalidatePath } from "next/cache";
import { resolveReport } from "@/lib/repo";
import { DISMISS_REASONS, REPORT_REASONS, formatDay } from "@/lib/labels";
import { listOpportunities, listProfiles, listReports } from "@/lib/repo";
import { quietButtonClass } from "@/components/classes";

const reasons = Object.fromEntries([...DISMISS_REASONS, ...REPORT_REASONS].map((item) => [item.value, item.label]));

export default async function ReportsPage() {
  const [reports, offers, students] = await Promise.all([listReports(), listOpportunities(), listProfiles()]);
  const offerName = new Map(offers.map((offer) => [offer.id, offer.title]));
  const studentName = new Map(students.map((student) => [student.id, student.firstName || student.email]));

  async function treat(formData: FormData) {
    "use server";
    await resolveReport(String(formData.get("id") ?? ""));
    revalidatePath("/admin/signalements");
  }

  return (
    <main className="grid gap-3">
      <h1 className="font-serif text-3xl">Signalements</h1>
      <ul className="grid gap-2">
        {reports.map((report) => (
          <li key={report.id} className="rounded-2xl border border-line bg-card p-3 text-sm">
            <p className="font-medium">
              {report.kind === "signalement" ? "Signalement" : "Pas pour moi"} · {reasons[report.reason] ?? report.reason}
            </p>
            <p>{offerName.get(report.opportunityId)}</p>
            <p className="text-muted">
              {studentName.get(report.profileId)} · {formatDay(report.createdAt)}
              {report.resolvedAt ? " · traité" : ""}
            </p>
            {report.note && <p>{report.note}</p>}
            {!report.resolvedAt && (
              <form action={treat} className="mt-2">
                <input type="hidden" name="id" value={report.id} />
                <button className={quietButtonClass}>Traiter</button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
