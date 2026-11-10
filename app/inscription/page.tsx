import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function InscriptionPage() {
  return (
    <main className="mx-auto grid min-h-dvh max-w-lg content-center gap-6 px-4">
      <Link href="/" className="font-serif text-4xl">
        Pile
      </Link>
      <h1 className="font-serif text-3xl">Inscription</h1>
      <AuthForm mode="inscription" />
    </main>
  );
}
