import type { Metadata } from "next";
import { cityLabel, domainLabel, levelLabel } from "@/lib/labels";
import { adminMetadata } from "@/lib/admin-meta";
import { isProfileComplete } from "@/lib/matching";
import { listInterests, listProfiles } from "@/lib/repo";

export async function generateMetadata(): Promise<Metadata> {
  return adminMetadata("Étudiants");
}

export default async function StudentsPage() {
  const [students, interests] = await Promise.all([listProfiles(), listInterests()]);
  return (
    <main className="grid gap-3">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Étudiants</h1>
        <p className="mt-1 max-w-prose text-sm text-muted">
          Cette liste reste dans le back-office. Elle ne se montre pas à une structure : les e-mails et les CV y figurent.
        </p>
      </div>
      {students.length === 0 ? (
        <p className="text-sm">Aucun étudiant pour l’instant.</p>
      ) : (
        <ul className="border-t border-line">
          {students.map((student) => {
            const count = interests.filter((item) => item.profileId === student.id).length;
            const complete = isProfileComplete(student);
            return (
              <li key={student.id} className="border-b border-line py-3 text-sm">
                <p className="font-medium">{student.firstName || "Prénom non renseigné"}</p>
                <p className="text-muted">Compte : {student.email}</p>
                <p className="text-muted">
                  {student.school || "École non renseignée"} · {student.city ? cityLabel(student.city) : "Ville non renseignée"} ·{" "}
                  {student.level ? levelLabel(student.level) : "Niveau non renseigné"} ·{" "}
                  {student.domains.map(domainLabel).join(", ") || "Filière non renseignée"}
                </p>
                <p>
                  {student.whatsapp || "WhatsApp non renseigné"} · {complete ? "profil complet" : "profil incomplet"} · {count} intérêt
                  {count > 1 ? "s" : ""}
                </p>
                {student.cvPath && (
                  <a className="inline-flex min-h-11 items-center font-medium text-green" href={`/cv?profil=${student.id}`}>
                    Ouvrir le CV
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
