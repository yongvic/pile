import Link from "next/link";
import { signOutAction } from "@/app/actions";
import type { Profile } from "@/lib/types";

export function Header({ profile, demo }: { profile: Profile | null; demo: boolean }) {
  return (
    <header className="flex items-center justify-between gap-3 py-5">
      <Link href="/" className="font-serif text-2xl tracking-tight">
        Pile
      </Link>
      <nav className="flex items-center gap-3 text-sm">
        <Link href="/profil">{profile?.firstName || "Profil"}</Link>
        <Link href="/interets">Intérêts</Link>
        {(demo || profile?.role === "operateur") && <Link href="/admin">Admin</Link>}
        {!demo && profile && (
          <form action={signOutAction}>
            <button className="text-muted">Sortir</button>
          </form>
        )}
      </nav>
    </header>
  );
}

export function AdminNav() {
  const links = [
    ["/admin", "Tableau"],
    ["/admin/offres", "Offres"],
    ["/admin/structures", "Structures"],
    ["/admin/etudiants", "Étudiants"],
    ["/admin/interets", "Intérêts"],
    ["/admin/signalements", "Signalements"],
  ];
  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line py-4">
      <Link href="/admin" className="font-serif text-2xl">
        Pile
      </Link>
      <nav className="flex flex-wrap gap-3 text-sm">
        {links.map(([href, label]) => (
          <Link key={href} href={href}>
            {label}
          </Link>
        ))}
        <Link href="/">Voir le site</Link>
      </nav>
    </header>
  );
}
