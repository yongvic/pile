import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";
import { getProfile, isDemo } from "@/lib/repo";

export default async function ProfilePage() {
  const profile = await getProfile();
  if (!profile) redirect("/connexion");
  return (
    <main className="grid gap-4">
      <h1 className="font-serif text-3xl">Ton profil</h1>
      <p className="text-sm text-muted">Encore quelques infos pour voir les offres, pile pour toi.</p>
      <ProfileForm profile={profile} demo={isDemo()} />
    </main>
  );
}
