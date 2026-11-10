import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";
import { isProfileComplete } from "@/lib/matching";
import { getProfile, isDemo } from "@/lib/repo";

export const metadata: Metadata = { title: "Profil" };

export default async function ProfilePage() {
  const profile = await getProfile();
  if (!profile) redirect("/connexion");
  const complete = isProfileComplete(profile);
  return (
    <main className="grid gap-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Profil</h1>
        <p className="mt-1 text-sm text-muted">
          {complete
            ? "Ces informations trient les offres pour toi."
            : "Encore quelques infos pour voir les offres, pile pour toi."}
        </p>
      </div>
      {complete && (
        <Link href="/" className="inline-flex min-h-11 items-center text-sm font-medium">
          Offres
        </Link>
      )}
      <ProfileForm profile={profile} demo={isDemo()} />
    </main>
  );
}
