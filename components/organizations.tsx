"use client";

import { useActionState } from "react";
import { saveOrganizationAction } from "@/app/actions";
import { OFFER_CITIES, cityLabel } from "@/lib/labels";
import type { Organization } from "@/lib/types";
import { buttonClass, inputClass, labelClass } from "./classes";

export function OrganizationForm() {
  const [state, action, pending] = useActionState(saveOrganizationAction, {});
  return (
    <form action={action} className="grid gap-3 rounded-2xl border border-line bg-card p-4">
      {state.error && <p className="text-sm text-clay">{state.error}</p>}
      {state.message && <p className="text-sm text-green">{state.message}</p>}
      <label className={labelClass}>
        Nom
        <input className={inputClass} name="name" required />
      </label>
      <label className={labelClass}>
        Ville
        <select className={inputClass} name="city" defaultValue="Lome">
          {OFFER_CITIES.map((city) => (
            <option key={city.value} value={city.value}>
              {city.label}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        Secteur
        <input className={inputClass} name="sector" />
      </label>
      <label className={labelClass}>
        Site
        <input className={inputClass} name="website" />
      </label>
      <button className={buttonClass} disabled={pending}>
        Enregistrer
      </button>
    </form>
  );
}

export function OrganizationList({ organizations, counts }: { organizations: Organization[]; counts: Record<string, number> }) {
  return (
    <ul className="grid gap-2">
      {organizations.map((organization) => (
        <li key={organization.id} className="rounded-2xl border border-line bg-card p-3 text-sm">
          <span className="font-medium">{organization.name}</span>
          <span className="mt-1 block text-muted">
            {cityLabel(organization.city)} · {counts[organization.id] ?? 0} offre{(counts[organization.id] ?? 0) > 1 ? "s" : ""}
            {organization.sector ? ` · ${organization.sector}` : ""}
          </span>
        </li>
      ))}
    </ul>
  );
}
