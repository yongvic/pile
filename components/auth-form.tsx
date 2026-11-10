"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordAction, signInAction, signUpAction } from "@/app/actions";
import { buttonClass, inputClass, labelClass } from "./classes";

export function AuthForm({ mode }: { mode: "connexion" | "inscription" }) {
  const action = mode === "connexion" ? signInAction : signUpAction;
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="grid gap-4">
      {state.error && <p className="text-sm text-clay">{state.error}</p>}
      {state.message && <p className="text-sm text-green">{state.message}</p>}
      <label className={labelClass}>
        E-mail
        <input className={inputClass} type="email" name="email" required autoComplete="email" />
      </label>
      <label className={labelClass}>
        Mot de passe
        <input className={inputClass} type="password" name="password" required minLength={6} autoComplete={mode === "connexion" ? "current-password" : "new-password"} />
      </label>
      {mode === "inscription" && (
        <label className={labelClass}>
          Confirmation
          <input className={inputClass} type="password" name="confirm" required minLength={6} autoComplete="new-password" />
        </label>
      )}
      <button className={buttonClass} disabled={pending}>
        {pending ? "Patiente…" : mode === "connexion" ? "Se connecter" : "Créer le compte"}
      </button>
      {mode === "connexion" ? (
        <p className="text-sm">
          <Link href="/inscription">Créer un compte</Link>
          {" · "}
          <Link href="/connexion/nouveau-mot-de-passe">Mot de passe oublié</Link>
        </p>
      ) : (
        <p className="text-sm">
          <Link href="/connexion">Déjà un compte</Link>
        </p>
      )}
    </form>
  );
}

export function ResetForm() {
  const [state, action, pending] = useActionState(requestPasswordAction, {});
  return (
    <form action={action} className="grid gap-4">
      {state.message && <p className="text-sm">{state.message}</p>}
      <button className={buttonClass} disabled={pending}>
        En savoir plus
      </button>
      <Link href="/connexion" className="text-sm">
        Retour
      </Link>
    </form>
  );
}
