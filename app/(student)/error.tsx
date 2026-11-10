"use client";

import Link from "next/link";

export default function StudentError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid gap-3">
      <h1 className="text-3xl font-semibold tracking-tight">Ça n’a pas pu s’afficher</h1>
      <p className="text-sm">La page n’a pas pu être lue. Tu peux réessayer, ou revenir aux offres. Rien n’a été déclaré à ta place.</p>
      <button type="button" className="inline-flex min-h-11 items-center font-medium text-green" onClick={reset}>
        Réessayer
      </button>
      <Link href="/" className="inline-flex min-h-11 items-center text-sm font-medium">
        Retour aux offres
      </Link>
    </main>
  );
}
