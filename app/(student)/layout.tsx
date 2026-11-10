import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { OfflineNote } from "@/components/offline-note";
import { getProfile, isDemo, listInterests } from "@/lib/repo";
import Link from "next/link";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();
  if (!isDemo() && !profile) redirect("/connexion");
  const pendingCount = profile
    ? (await listInterests(profile.id)).filter((item) => item.status === "interesse").length
    : 0;
  return (
    <div className="mx-auto min-h-dvh max-w-lg px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] sm:pb-10">
      {isDemo() && (
        <p className="mt-4 rounded-lg bg-sand px-3 py-2 text-sm">
          Aperçu sur cet ordinateur. Les offres marquées « exemple » ne sont pas de vraies annonces.{" "}
          <Link href="/admin" className="font-medium underline">
            Ouvrir l’espace opérateur
          </Link>
        </p>
      )}
      <Header
        firstName={profile?.firstName ?? ""}
        pendingCount={pendingCount}
        operator={!isDemo() && profile?.role === "operateur"}
        demo={isDemo()}
      />
      <OfflineNote />
      {children}
    </div>
  );
}
