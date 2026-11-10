import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminNav } from "@/components/header";
import { ensureOperator, getProfile, isDemo } from "@/lib/repo";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isDemo()) {
    await ensureOperator();
    const profile = await getProfile();
    if (!profile) redirect("/connexion");
    if (profile.role !== "operateur") notFound();
  }
  return (
    <div className="mx-auto min-h-dvh max-w-5xl px-4 pb-16">
      {isDemo() && (
        <p className="mt-4 rounded-lg bg-sand px-3 py-2 text-sm">
          Aperçu. Rien n’est envoyé à une structure tant que tu ne lui montres pas une liste toi-même.
        </p>
      )}
      <AdminNav />
      {children}
    </div>
  );
}
