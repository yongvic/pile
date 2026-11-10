"use client";

import { useActionState } from "react";
import { saveOrganizationAction } from "@/app/actions";
import { OFFER_CITIES, cityLabel } from "@/lib/labels";
import type { Organization } from "@/lib/types";
import { buttonClass, inputClass, labelClass, quietButtonClass } from "./classes";

export function OrganizationForm({ organization }: { organization?: Organization }) {
  const [state, action, pending] = useActionState(saveOrganizationAction, {});
  return (
    <form action={action} className="grid gap-3 rounded-lg border border-line bg-card p-4">
      {organization && <input type="hidden" name="id" value={organization.id} />}
      {state.error && (
        <p role="alert" className="text-sm text-clay">
          {state.error}
        </p>
      )}
      {state.message && (
        <p role="status" className="text-sm text-green">
          {state.message}
        </p>
      )}
      <label className={labelClass}>
        Nom
        <input className={inputClass} name="name" required defaultValue={organization?.name} />
      </label>
      <label className={labelClass}>
        Ville
        <select className={inputClass} name="city" defaultValue={organization?.city || "Lome"}>
          {OFFER_CITIES.map((city) => (
            <option key={city.value} value={city.value}>
              {city.label}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        Secteur
        <input className={inputClass} name="sector" defaultValue={organization?.sector} />
      </label>
      <label className={labelClass}>
        Site
        <input className={inputClass} name="website" defaultValue={organization?.website} inputMode="url" />
      </label>
      <button className={organization ? quietButtonClass : buttonClass} disabled={pending}>
        {pending ? "Enregistrement…" : organization ? "Enregistrer les modifications" : "Enregistrer la structure"}
      </button>
    </form>
  );
}

export function OrganizationList({ organizations, counts }: { organizations: Organization[]; counts: Record<string, number> }) {
  if (organizations.length === 0) {
    return <p className="text-sm">Aucune structure. Enregistre la première ci-dessus. Une offre ne se publie pas sans structure.</p>;
  }
  return (
    <ul className="border-t border-line">
      {organizations.map((organization) => {
        const count = counts[organization.id] ?? 0;
        return (
          <li key={organization.id} className="border-b border-line py-3 text-sm">
            <p className="font-medium">{organization.name}</p>
            <p className="mt-1 text-muted">
              {cityLabel(organization.city)} · {count} offre{count > 1 ? "s" : ""}
              {organization.sector ? ` · ${organization.sector}` : ""}
            </p>
            {count > 0 && <p className="mt-1">Cette structure a des offres. Elle ne se supprime pas.</p>}
            <details className="mt-2">
              <summary className="inline-flex min-h-11 cursor-pointer items-center font-medium">Modifier</summary>
              <div className="mt-2">
                <OrganizationForm organization={organization} />
              </div>
            </details>
          </li>
        );
      })}
    </ul>
  );
}
