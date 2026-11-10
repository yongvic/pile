import { OrganizationForm, OrganizationList } from "@/components/organizations";
import { listOpportunities, listOrganizations } from "@/lib/repo";

export default async function StructuresPage() {
  const [organizations, offers] = await Promise.all([listOrganizations(), listOpportunities()]);
  const counts: Record<string, number> = {};
  for (const offer of offers) counts[offer.organizationId] = (counts[offer.organizationId] ?? 0) + 1;
  return (
    <main className="grid gap-6">
      <h1 className="font-serif text-3xl">Structures</h1>
      <OrganizationForm />
      <OrganizationList organizations={organizations} counts={counts} />
    </main>
  );
}
