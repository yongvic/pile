"use client";

import { useEffect, useRef, useState, useActionState } from "react";
import { saveProfileAction } from "@/app/actions";
import { CITIES, DOMAINS, PROFILE_LEVELS } from "@/lib/labels";
import { isProfileComplete } from "@/lib/matching";
import type { Profile, ProfileLevel, Seek } from "@/lib/types";
import { buttonClass, inputClass, labelClass } from "./classes";

function gapsFrom(values: {
  firstName: string;
  whatsapp: string;
  city: string;
  school: string;
  level: string;
  domains: string[];
  lookingFor: string[];
}): string[] {
  const gaps: string[] = [];
  if (!values.firstName.trim()) gaps.push("le prénom");
  if (!values.whatsapp.trim()) gaps.push("le WhatsApp");
  if (!values.city) gaps.push("la ville");
  if (!values.school.trim()) gaps.push("l’école");
  if (!values.level) gaps.push("le niveau");
  if (values.domains.length === 0) gaps.push("une filière");
  if (values.lookingFor.length === 0) gaps.push("un stage ou un job");
  return gaps;
}

function readForm(form: HTMLFormElement, profile: Profile): { gaps: string[]; ready: boolean } {
  const data = new FormData(form);
  const lookingFor = data
    .getAll("lookingFor")
    .map(String)
    .filter((value): value is Seek => value === "stage" || value === "job");
  const draft: Profile = {
    ...profile,
    firstName: String(data.get("firstName") ?? ""),
    whatsapp: String(data.get("whatsapp") ?? ""),
    phone: String(data.get("phone") ?? ""),
    city: String(data.get("city") ?? ""),
    school: String(data.get("school") ?? ""),
    level: String(data.get("level") ?? "") as ProfileLevel | "",
    domains: data.getAll("domains").map(String),
    lookingFor,
  };
  return {
    gaps: gapsFrom(draft),
    ready: isProfileComplete(draft),
  };
}

export function ProfileForm({ profile, demo }: { profile: Profile; demo: boolean }) {
  const [state, action, pending] = useActionState(saveProfileAction, {});
  const [gaps, setGaps] = useState(() => gapsFrom(profile));
  const [ready, setReady] = useState(() => isProfileComplete(profile));
  const [dirty, setDirty] = useState(false);
  const submitting = useRef(false);

  useEffect(() => {
    if (state.error || state.message) submitting.current = false;
  }, [state.error, state.message]);

  useEffect(() => {
    const onLeave = (event: BeforeUnloadEvent) => {
      if (!dirty || submitting.current) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [dirty]);

  return (
    <form
      action={action}
      className="grid gap-4 pb-28"
      onSubmit={() => {
        submitting.current = true;
      }}
      onChange={(event) => {
        setDirty(true);
        const next = readForm(event.currentTarget, profile);
        setGaps(next.gaps);
        setReady(next.ready);
      }}
    >
      {state.error && (
        <p role="alert" className="text-sm text-clay">
          {state.error}
        </p>
      )}
      {state.message && <p className="text-sm">{state.message}</p>}
      <p className="text-sm text-muted">Compte : {profile.email}</p>
      <label className={labelClass}>
        Prénom
        <input className={inputClass} name="firstName" defaultValue={profile.firstName} autoComplete="given-name" required />
      </label>
      <label className={labelClass}>
        WhatsApp
        <input className={inputClass} name="whatsapp" defaultValue={profile.whatsapp} autoComplete="tel" inputMode="tel" required />
      </label>
      <label className={labelClass}>
        Téléphone
        <input className={inputClass} name="phone" defaultValue={profile.phone} autoComplete="tel" inputMode="tel" />
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
      <fieldset className="grid gap-1 text-sm">
        <legend className="font-medium">Filières</legend>
        {DOMAINS.map((domain) => (
          <label key={domain.value} className="flex min-h-11 items-center gap-3">
            <input type="checkbox" name="domains" value={domain.value} defaultChecked={profile.domains.includes(domain.value)} />
            {domain.label}
          </label>
        ))}
      </fieldset>
      <fieldset className="grid gap-1 text-sm">
        <legend className="font-medium">Tu cherches</legend>
        <label className="flex min-h-11 items-center gap-3">
          <input type="checkbox" name="lookingFor" value="stage" defaultChecked={profile.lookingFor.includes("stage")} />
          Un stage
        </label>
        <label className="flex min-h-11 items-center gap-3">
          <input type="checkbox" name="lookingFor" value="job" defaultChecked={profile.lookingFor.includes("job")} />
          Un job
        </label>
      </fieldset>
      <label className={labelClass}>
        Compétences, une virgule entre chaque
        <input className={inputClass} name="skills" defaultValue={profile.skills.join(", ")} />
      </label>
      <label className={labelClass}>
        Disponibilité
        <input className={inputClass} name="availability" defaultValue={profile.availability} placeholder="Dates, temps plein, temps partiel" />
      </label>
      <label className={labelClass}>
        CV, PDF, 5 Mo maximum. Tu peux enregistrer sans CV.
        <input className={inputClass} type="file" name="cv" accept="application/pdf" />
      </label>
      {profile.cvPath && (
        <a className="inline-flex min-h-11 items-center text-sm font-medium text-green" href={`/cv?profil=${profile.id}`}>
          Ouvrir le CV enregistré
        </a>
      )}
      {demo && <p className="text-sm text-muted">Aperçu : ce profil reste sur cet ordinateur.</p>}
      <p className="text-sm">{ready ? "Le profil suffit pour voir les offres." : `Il manque ${gaps.join(", ")}.`}</p>
      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 border-t border-line bg-paper px-4 py-3 sm:bottom-0">
        <div className="mx-auto max-w-lg">
          <button className={`${buttonClass} w-full`} disabled={pending}>
            {pending ? "Enregistrement…" : ready ? "Voir les offres" : "Enregistrer"}
          </button>
        </div>
      </div>
    </form>
  );
}
