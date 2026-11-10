import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { isDemo } from "@/lib/repo";

export default function ConnexionPage() {
  return (
    <main className="mx-auto grid min-h-dvh max-w-lg content-center gap-6 px-4">
      <Link href="/" className="font-serif text-4xl">
        Pile
      </Link>
      <h1 className="font-serif text-3xl">Connexion</h1>
      {isDemo() && <p className="text-sm text-muted">Sans Neon, l’aperçu s’ouvre directement. Ajoute DATABASE_URL pour créer des comptes.</p>}
      <AuthForm mode="connexion" />
      {isDemo() && (
        <Link className="text-sm text-green" href="/">
          Continuer l’aperçu
        </Link>
      )}
    </main>
  );
}
