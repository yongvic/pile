import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Page introuvable" };

export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-dvh max-w-lg content-center gap-3 px-4">
      <p className="font-serif text-3xl tracking-tight">Pile</p>
      <h1 className="text-3xl font-semibold tracking-tight">Cette page n’existe pas</h1>
      <p className="text-sm">Le lien est faux, ou l’offre a été retirée.</p>
      <Link className="inline-flex min-h-11 items-center font-medium text-green" href="/">
        Aller aux offres
      </Link>
    </main>
  );
}
