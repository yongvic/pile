"use client";

import { useActionState } from "react";
import { saveOfferAction } from "@/app/actions";
import { DOMAINS, OFFER_CITIES, OFFER_LEVELS } from "@/lib/labels";
import type { Opportunity, Organization } from "@/lib/types";
import { buttonClass, inputClass, labelClass, quietButtonClass } from "./classes";

export function OfferForm({ offer, organizations }: { offer?: Opportunity; organizations: Organization[] }) {
  const [state, action, pending] = useActionState(saveOfferAction, {});
  return (
    <form action={action} className="grid gap-4">
      {state.error && <p className="text-sm text-clay">{state.error}</p>}
      {offer && <input type="hidden" name="id" value={offer.id} />}
      <input type="hidden" name="status" value={offer?.status ?? "brouillon"} />
      <input type="hidden" name="verifiedAt" value={offer?.verifiedAt ?? ""} />
      <label className={labelClass}>
        Titre
        <input className={inputClass} name="title" defaultValue={offer?.title} required />
      </label>
      <label className={labelClass}>
        Structure existante
        <select className={inputClass} name="organizationId" defaultValue={offer?.organizationId ?? ""}>
          <option value="">Nouvelle structure</option>
          {organizations.map((organization) => (
            <option key={organization.id} value={organization.id}>
              {organization.name}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-3 rounded-2xl border border-line p-3">
        <p className="text-sm text-muted">Ou créer la structure ici</p>
        <input className={inputClass} name="newOrganizationName" placeholder="Nom" />
        <select className={inputClass} name="newOrganizationCity" defaultValue="Lome">
          {OFFER_CITIES.map((city) => (
            <option key={city.value} value={city.value}>
              {city.label}
            </option>
          ))}
        </select>
        <input className={inputClass} name="newOrganizationSector" placeholder="Secteur" />
      </div>
      <label className={labelClass}>
        Type
        <select className={inputClass} name="type" defaultValue={offer?.type ?? "stage"}>
          <option value="stage">stage</option>
          <option value="job">job</option>
        </select>
      </label>
      <label className={labelClass}>
        Missions
        <textarea className={inputClass} name="description" rows={5} defaultValue={offer?.description} />
      </label>
      <label className={labelClass}>
        Ville
        <select className={inputClass} name="city" defaultValue={offer?.city ?? "Lome"}>
          {OFFER_CITIES.map((city) => (
            <option key={city.value} value={city.value}>
              {city.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex gap-2 text-sm">
        <input type="checkbox" name="remote" defaultChecked={offer?.remote} />
        Remote
      </label>
      <fieldset className="grid gap-2 text-sm">
        <legend>Filières</legend>
        {DOMAINS.map((domain) => (
          <label key={domain.value} className="flex gap-2">
            <input type="checkbox" name="domains" value={domain.value} defaultChecked={offer?.domains.includes(domain.value)} />
            {domain.label}
          </label>
        ))}
      </fieldset>
      <fieldset className="grid gap-2 text-sm">
        <legend>Niveaux acceptés</legend>
        {OFFER_LEVELS.map((level) => (
          <label key={level.value} className="flex gap-2">
            <input type="checkbox" name="levels" value={level.value} defaultChecked={offer?.levels.includes(level.value)} />
            {level.label}
          </label>
        ))}
      </fieldset>
      <label className={labelClass}>
        Rémunération
        <select className={inputClass} name="paid" defaultValue={offer?.paid ?? "inconnu"}>
          <option value="oui">rémunéré</option>
          <option value="non">non rémunéré</option>
          <option value="inconnu">non précisé</option>
        </select>
      </label>
      <label className={labelClass}>
        Note de rémunération
        <input className={inputClass} name="compensationNote" defaultValue={offer?.compensationNote} />
      </label>
      <label className={labelClass}>
        Durée
        <input className={inputClass} name="duration" defaultValue={offer?.duration} />
      </label>
      <label className={labelClass}>
        Début
        <input className={inputClass} type="date" name="startDate" defaultValue={offer?.startDate ?? ""} />
      </label>
      <label className={labelClass}>
        Date limite
        <input className={inputClass} type="date" name="deadline" defaultValue={offer?.deadline ?? ""} />
      </label>
      <label className={labelClass}>
        Candidature
        <select className={inputClass} name="applyMode" defaultValue={offer?.applyMode ?? "lien"}>
          <option value="lien">lien</option>
          <option value="email">e-mail</option>
          <option value="interet">intérêt interne</option>
        </select>
      </label>
      <label className={labelClass}>
        Lien ou e-mail
        <input className={inputClass} name="applyTarget" defaultValue={offer?.applyTarget} />
      </label>
      <label className={labelClass}>
        Source
        <input className={inputClass} name="source" defaultValue={offer?.source ?? "saisie"} />
      </label>
      <div className="flex flex-wrap gap-2">
        <button className={quietButtonClass} name="intent" value="brouillon" disabled={pending}>
          Brouillon
        </button>
        <button className={buttonClass} name="intent" value="publier" disabled={pending}>
          Publier
        </button>
        {offer && (
          <>
            <button className={quietButtonClass} name="intent" value="reverifier" disabled={pending}>
              J’ai revérifié
            </button>
            <button className={quietButtonClass} name="intent" value="pourvue" disabled={pending}>
              Pourvue
            </button>
            <button className={quietButtonClass} name="intent" value="expiree" disabled={pending}>
              Expirée
            </button>
          </>
        )}
      </div>
    </form>
  );
}
