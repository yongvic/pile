import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Inscription" };

export default function InscriptionPage() {
  return (
    <main className="mx-auto grid min-h-dvh max-w-lg content-center gap-6 px-4 py-8">
      <Link href="/connexion" className="inline-flex min-h-11 items-center text-sm font-medium">
        Connexion
      </Link>
      <p className="font-serif text-4xl tracking-tight">Pile</p>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Inscription</h1>
        <p className="mt-2 text-sm text-muted">Ensuite, ton profil. Les offres viennent après.</p>
      </div>
      <AuthForm mode="inscription" />
    </main>
  );
}
