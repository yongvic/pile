import type { Metadata } from "next";
import { OrganizationForm, OrganizationList } from "@/components/organizations";
import { adminMetadata } from "@/lib/admin-meta";
import { listOpportunities, listOrganizations } from "@/lib/repo";

export async function generateMetadata(): Promise<Metadata> {
  return adminMetadata("Structures");
}

export default async function StructuresPage() {
  const [organizations, offers] = await Promise.all([listOrganizations(), listOpportunities()]);
  const counts: Record<string, number> = {};
  for (const offer of offers) counts[offer.organizationId] = (counts[offer.organizationId] ?? 0) + 1;
  return (
    <main className="grid max-w-2xl gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Structures</h1>
        <p className="mt-1 text-sm text-muted">
          Cherche le nom avant d’en créer une. Deux offres de la même entreprise partagent la même structure.
        </p>
      </div>
      <OrganizationForm />
      <OrganizationList organizations={organizations} counts={counts} />
    </main>
  );
}
