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
    <div className="mx-auto min-h-dvh max-w-3xl px-4 pb-16">
      {isDemo() && <p className="mt-4 rounded-2xl bg-sand px-3 py-2 text-sm">Back-office de l’aperçu. Les offres simulées viennent du fichier. Une base Neon enregistre pour de vrai.</p>}
      <AdminNav />
      {children}
    </div>
  );
}
