import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { getProfile, isDemo } from "@/lib/repo";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const profile = isDemo() ? await getProfile() : await getProfile();
  if (!isDemo() && !profile) redirect("/connexion");
  return (
    <div className="mx-auto min-h-dvh max-w-lg px-4 pb-16">
      {isDemo() && (
        <p className="mt-4 rounded-2xl bg-sand px-3 py-2 text-sm">
          Aperçu local, offres simulées. Les comptes s’ouvrent quand Neon est branché avec DATABASE_URL.
        </p>
      )}
      <Header profile={profile} demo={isDemo()} />
      {children}
    </div>
  );
}
