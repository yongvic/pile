"use client";

import { useActionState } from "react";
import { saveProfileAction } from "@/app/actions";
import { CITIES, DOMAINS, PROFILE_LEVELS } from "@/lib/labels";
import type { Profile } from "@/lib/types";
import { buttonClass, inputClass, labelClass } from "./classes";

export function ProfileForm({ profile, demo }: { profile: Profile; demo: boolean }) {
  const [state, action, pending] = useActionState(saveProfileAction, {});
  return (
    <form action={action} className="grid gap-4">
      {state.error && <p className="text-sm text-clay">{state.error}</p>}
      {state.message && <p className="text-sm text-green">{state.message}</p>}
      <p className="text-sm text-muted">{profile.email}</p>
      <label className={labelClass}>
        Prénom
        <input className={inputClass} name="firstName" defaultValue={profile.firstName} required />
      </label>
      <label className={labelClass}>
        WhatsApp
        <input className={inputClass} name="whatsapp" defaultValue={profile.whatsapp} required />
      </label>
      <label className={labelClass}>
        Téléphone
        <input className={inputClass} name="phone" defaultValue={profile.phone} />
      </label>
      <label className={labelClass}>
        Ville
        <select className={inputClass} name="city" defaultValue={profile.city} required>
          <option value="">Choisir</option>
          {CITIES.map((city) => (
            <option key={city.value} value={city.value}>
              {city.label}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        École
        <input className={inputClass} name="school" defaultValue={profile.school} required />
      </label>
      <label className={labelClass}>
        Niveau
        <select className={inputClass} name="level" defaultValue={profile.level} required>
          <option value="">Choisir</option>
          {PROFILE_LEVELS.map((level) => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
      </label>
      <fieldset className="grid gap-2 text-sm">
        <legend>Filières</legend>
        {DOMAINS.map((domain) => (
          <label key={domain.value} className="flex gap-2">
            <input type="checkbox" name="domains" value={domain.value} defaultChecked={profile.domains.includes(domain.value)} />
            {domain.label}
          </label>
        ))}
      </fieldset>
      <fieldset className="grid gap-2 text-sm">
        <legend>Tu cherches</legend>
        <label className="flex gap-2">
          <input type="checkbox" name="lookingFor" value="stage" defaultChecked={profile.lookingFor.includes("stage")} />
          Un stage
        </label>
        <label className="flex gap-2">
          <input type="checkbox" name="lookingFor" value="job" defaultChecked={profile.lookingFor.includes("job")} />
          Un job
        </label>
      </fieldset>
      <label className={labelClass}>
        Compétences, séparées par des virgules
        <input className={inputClass} name="skills" defaultValue={profile.skills.join(", ")} />
      </label>
      <label className={labelClass}>
        Disponibilité
        <input className={inputClass} name="availability" defaultValue={profile.availability} />
      </label>
      <label className={labelClass}>
        CV (PDF, 5 Mo)
        <input className={inputClass} type="file" name="cv" accept="application/pdf" />
      </label>
      {profile.cvPath && (
        <a className="text-sm text-green" href={`/cv?profil=${profile.id}`}>
          CV enregistré
        </a>
      )}
      <button className={buttonClass} disabled={pending}>
        {pending ? "Enregistrement…" : "Voir les offres"}
      </button>
      {demo && <p className="text-sm text-muted">Aperçu : ce profil reste sur cet ordinateur.</p>}
    </form>
  );
}
