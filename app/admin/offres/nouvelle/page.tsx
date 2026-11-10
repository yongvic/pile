import type { Metadata } from "next";
import Link from "next/link";
import { OfferForm } from "@/components/offer-form";
import { adminMetadata } from "@/lib/admin-meta";
import { listOrganizations } from "@/lib/repo";

export async function generateMetadata(): Promise<Metadata> {
  return adminMetadata("Nouvelle offre");
}

export default async function NewOfferPage() {
  const organizations = await listOrganizations();
  return (
    <main className="grid max-w-2xl gap-4">
      <Link href="/admin/offres" className="inline-flex min-h-11 items-center text-sm font-medium">
        Offres
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight">Nouvelle offre</h1>
      <p className="text-sm text-muted">Elle reste en brouillon tant que tu ne publies pas. Publier la rend visible des étudiants.</p>
      <OfferForm organizations={organizations} />
    </main>
  );
}
