import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { isDemo } from "@/lib/repo";

export const metadata: Metadata = { title: "Connexion" };

export default function ConnexionPage() {
  return (
    <main className="mx-auto grid min-h-dvh max-w-lg content-center gap-6 px-4 py-8">
      <Link href="/" className="font-serif text-4xl tracking-tight">
        Pile
      </Link>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Connexion</h1>
        <p className="mt-2 text-sm text-muted">Des stages et des jobs vérifiés, pour ton niveau, au Togo.</p>
      </div>
      {isDemo() && (
        <p className="text-sm">
          Les comptes ne sont pas ouverts dans cet aperçu.{" "}
          <Link className="font-medium text-green" href="/">
            Voir les offres d’exemple
          </Link>
        </p>
      )}
      <AuthForm mode="connexion" />
    </main>
  );
}
