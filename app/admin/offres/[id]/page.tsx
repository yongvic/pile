import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OfferForm } from "@/components/offer-form";
import { adminMetadata } from "@/lib/admin-meta";
import { statusLabel } from "@/lib/labels";
import { getOpportunity, listOrganizations } from "@/lib/repo";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const gate = await adminMetadata("Offre");
  if (gate.title === "Page introuvable") return gate;
  const { id } = await params;
  const offer = await getOpportunity(id);
  return { title: offer?.title ?? "Offre" };
}

export default async function EditOfferPage({ params }: Props) {
  const { id } = await params;
  const [offer, organizations] = await Promise.all([getOpportunity(id), listOrganizations()]);
  if (!offer) notFound();
  return (
    <main className="grid max-w-2xl gap-4">
      <Link href="/admin/offres" className="inline-flex min-h-11 items-center text-sm font-medium">
        Offres
      </Link>
      <div>
        <p className="text-sm font-medium">{statusLabel(offer.status)}</p>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight">{offer.title}</h1>
      </div>
      <OfferForm offer={offer} organizations={organizations} />
    </main>
  );
}
