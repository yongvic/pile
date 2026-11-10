import { cityLabel, statusLabel } from "@/lib/labels";
import { listInterests, listProfiles } from "@/lib/repo";

export default async function StudentsPage() {
  const [students, interests] = await Promise.all([listProfiles(), listInterests()]);
  return (
    <main className="grid gap-3">
      <h1 className="font-serif text-3xl">Étudiants</h1>
      <ul className="grid gap-2">
        {students.map((student) => {
          const count = interests.filter((item) => item.profileId === student.id).length;
          const complete = Boolean(student.firstName && student.whatsapp && student.city && student.level && student.domains.length);
          return (
            <li key={student.id} className="rounded-2xl border border-line bg-card p-3 text-sm">
              <p className="font-medium">{student.firstName || student.email}</p>
              <p className="text-muted">
                {student.school || "École non renseignée"} · {cityLabel(student.city)} · {student.level || "niveau ?"} · {student.domains.join(", ") || "filière ?"}
              </p>
              <p>
                {student.whatsapp} · {complete ? "profil complet" : "profil incomplet"} · {count} intérêt{count > 1 ? "s" : ""}
              </p>
              {student.cvPath && (
                <a className="text-green" href={`/cv?profil=${student.id}`}>
                  CV
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
