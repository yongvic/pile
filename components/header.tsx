"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/actions";

const studentLinks = [
  { href: "/", label: "Offres" },
  { href: "/interets", label: "Suivi" },
  { href: "/profil", label: "Profil" },
];

function current(href: string, path: string): boolean {
  if (href === "/") return path === "/" || path.startsWith("/offres");
  return path === href || path.startsWith(`${href}/`);
}

export function Header({
  firstName,
  pendingCount,
  operator,
  demo,
}: {
  firstName: string;
  pendingCount: number;
  operator: boolean;
  demo: boolean;
}) {
  const path = usePathname();
  return (
    <>
      <header className="flex items-center justify-between gap-3 py-4">
        <Link href="/" className="font-serif text-2xl tracking-tight">
          Pile
        </Link>
        <nav className="hidden items-center gap-4 text-sm sm:flex" aria-label="Pages">
          {studentLinks.map((link) => (
            <StudentLink key={link.href} {...link} path={path} pendingCount={pendingCount} />
          ))}
        </nav>
        <div className="flex items-center gap-2 text-sm">
          {operator && (
            <Link href="/admin" className="inline-flex min-h-11 items-center px-2 font-medium">
              Opérateur
            </Link>
          )}
          {!demo && (
            <form action={signOutAction}>
              <button className="inline-flex min-h-11 items-center px-2 text-muted">Sortir</button>
            </form>
          )}
          {firstName && <span className="hidden text-sm text-muted md:inline">{firstName}</span>}
        </div>
      </header>
      <nav
        className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper pb-[env(safe-area-inset-bottom)] sm:hidden"
        aria-label="Pages"
      >
        <div className="mx-auto grid max-w-lg grid-cols-3">
          {studentLinks.map((link) => (
            <StudentLink key={link.href} {...link} path={path} pendingCount={pendingCount} block />
          ))}
        </div>
      </nav>
    </>
  );
}

function StudentLink({
  href,
  label,
  path,
  pendingCount,
  block,
}: {
  href: string;
  label: string;
  path: string;
  pendingCount: number;
  block?: boolean;
}) {
  const active = current(href, path);
  const suivi = href === "/interets";
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      aria-label={suivi && pendingCount > 0 ? `Suivi, ${pendingCount} en cours` : undefined}
      className={`inline-flex min-h-11 items-center justify-center gap-1 px-2 ${block ? "w-full" : ""} ${active ? "font-semibold underline decoration-2 underline-offset-4" : ""}`}
    >
      {label}
      {suivi && pendingCount > 0 && <span className="tabular-nums">{pendingCount}</span>}
    </Link>
  );
}

const adminLinks = [
  ["/admin", "À faire"],
  ["/admin/offres", "Offres"],
  ["/admin/structures", "Structures"],
  ["/admin/etudiants", "Étudiants"],
  ["/admin/interets", "Intérêts"],
  ["/admin/signalements", "Signalements"],
];

function adminCurrent(href: string, path: string): boolean {
  if (href === "/admin") return path === "/admin";
  return path === href || path.startsWith(`${href}/`);
}

export function AdminNav() {
  const path = usePathname();
  return (
    <header className="mb-6 border-b border-line py-4">
      <div className="flex items-center justify-between gap-3">
        <Link href="/admin" className="font-serif text-2xl tracking-tight">
          Pile
        </Link>
        <Link href="/" className="inline-flex min-h-11 items-center text-sm font-medium">
          Voir les offres
        </Link>
      </div>
      <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 text-sm" aria-label="Back-office">
        {adminLinks.map(([href, label]) => {
          const active = adminCurrent(href, path);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`inline-flex min-h-11 shrink-0 items-center px-2 ${active ? "font-semibold underline decoration-2 underline-offset-4" : ""}`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
