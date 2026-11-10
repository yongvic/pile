import { OfferForm } from "@/components/offer-form";
import { listOrganizations } from "@/lib/repo";

export default async function NewOfferPage() {
  const organizations = await listOrganizations();
  return (
    <main className="grid gap-4">
      <h1 className="font-serif text-3xl">Nouvelle offre</h1>
      <OfferForm organizations={organizations} />
    </main>
  );
}
