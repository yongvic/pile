import { notFound } from "next/navigation";
import { OfferForm } from "@/components/offer-form";
import { getOpportunity, listOrganizations } from "@/lib/repo";

export default async function EditOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [offer, organizations] = await Promise.all([getOpportunity(id), listOrganizations()]);
  if (!offer) notFound();
  return (
    <main className="grid gap-4">
      <h1 className="font-serif text-3xl">{offer.title}</h1>
      <OfferForm offer={offer} organizations={organizations} />
    </main>
  );
}
