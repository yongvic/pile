import Link from "next/link";
import { ResetForm } from "@/components/auth-form";

export default function NewPasswordPage() {
  return (
    <main className="mx-auto grid min-h-dvh max-w-lg content-center gap-6 px-4">
      <Link href="/" className="font-serif text-4xl">
        Pile
      </Link>
      <h1 className="font-serif text-3xl">Mot de passe</h1>
      <ResetForm />
    </main>
  );
}
