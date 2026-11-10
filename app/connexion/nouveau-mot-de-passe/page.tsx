import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Mot de passe" };

export default function NewPasswordPage() {
  return (
    <main className="mx-auto grid min-h-dvh max-w-lg content-center gap-6 px-4 py-8">
      <p className="font-serif text-4xl tracking-tight">Pile</p>
      <h1 className="text-3xl font-semibold tracking-tight">Mot de passe</h1>
      <p className="max-w-prose text-sm">
        Le message de réinitialisation n’est pas envoyé. Le mot de passe se choisit au moment de l’inscription.
      </p>
      <Link href="/connexion" className="inline-flex min-h-11 items-center font-medium text-green">
        Retour à la connexion
      </Link>
    </main>
  );
}
