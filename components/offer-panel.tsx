"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { dismissAction, markAppliedAction, markInterestedAction, reportAction } from "@/app/actions";
import { DISMISS_REASONS, REPORT_REASONS } from "@/lib/labels";
import type { ApplyMode, InterestStatus } from "@/lib/types";
import { buttonClass, inputClass, quietButtonClass } from "./classes";

export function OfferPanel({
  id,
  title,
  mode,
  target,
  status,
  closed,
}: {
  id: string;
  title: string;
  mode: ApplyMode;
  target: string;
  status: InterestStatus | null;
  closed: boolean;
}) {
  const router = useRouter();
  const lock = useRef(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  function openTarget() {
    if (!target) return;
    if (mode === "email") {
      window.location.href = `mailto:${target}?subject=${encodeURIComponent(`Candidature — ${title}`)}`;
      return;
    }
    window.open(target, "_blank", "noopener,noreferrer");
  }

  async function apply() {
    if (lock.current) return;
    if (status) {
      openTarget();
      return;
    }
    lock.current = true;
    setPending(true);
    setError("");
    const result = await markInterestedAction(id);
    setPending(false);
    lock.current = false;
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.url?.startsWith("mailto:")) window.location.href = result.url;
    else if (result.url) window.open(result.url, "_blank", "noopener,noreferrer");
    router.refresh();
  }

  async function applied() {
    if (lock.current) return;
    lock.current = true;
    setPending(true);
    setError("");
    const result = await markAppliedAction(id);
    setPending(false);
    lock.current = false;
    if (result.error) setError(result.error);
    else router.refresh();
  }

  const stateLine = closed
    ? "Cette offre n’est plus ouverte. Tu ne peux plus candidater."
    : status === "candidate"
      ? "Candidature déclarée. Ça reste dans ton suivi, et ça ne s’annule pas ici."
      : status === "interesse" && mode === "interet"
        ? "Ton intérêt est enregistré. Pile transmet ton nom. Rien à envoyer toi-même."
        : status === "interesse"
          ? "Marquée. Il reste à déclarer l’envoi. Cette déclaration ne s’annule pas ici."
          : mode === "interet"
            ? "Pile transmet ton nom. La structure n’a pas de compte ici."
            : "Tu n’as pas encore marqué cette offre.";

  const primaryLabel = pending
    ? "Enregistrement…"
    : mode === "email"
      ? status
        ? "Réécrire"
        : "Écrire"
      : status
        ? "Rouvrir le lien"
        : "Candidater";

  return (
    <div className="grid gap-4">
      {message && (
        <p role="status" className="text-sm text-green">
          {message}
        </p>
      )}
      {!closed && mode === "interet" && status === null && (
        <p className="text-sm">Pile transmet ton intérêt. La structure n’a pas encore de compte ici.</p>
      )}
      <ReasonForm
        title="Pas pour moi"
        reasons={DISMISS_REASONS}
        hint={
          status
            ? "Elle sort de tes listes. Elle reste dans Suivi, parce que tu l’avais déjà marquée."
            : "Elle sort de tes listes. Elle ne revient pas."
        }
        onSubmit={async (reason) => {
          const result = await dismissAction(id, reason);
          if (result.error) setError(result.error);
          else router.push("/");
        }}
      />
      <ReasonForm
        title="Signaler"
        note
        reasons={REPORT_REASONS}
        hint="Pile ne demande jamais d’argent. L’offre reste en ligne tant qu’elle n’est pas retirée."
        onSubmit={async (reason, note) => {
          const result = await reportAction(id, reason, note);
          if (result.error) setError(result.error);
          else setMessage(result.message ?? "Signalement envoyé.");
        }}
      />
      <div className="h-28 sm:h-24" aria-hidden />
      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 border-t border-line bg-paper px-4 py-3 sm:bottom-0">
        <div className="mx-auto grid max-w-lg gap-2">
          <p className="text-sm">{stateLine}</p>
          {error && (
            <p role="alert" className="text-sm text-clay">
              {error}
            </p>
          )}
          {closed ? (
            <Link href="/" className={`${buttonClass} w-full`}>
              Retour aux offres
            </Link>
          ) : mode === "interet" ? (
            <button className={`${buttonClass} w-full`} disabled={pending || status !== null} onClick={apply}>
              {pending ? "Enregistrement…" : status ? "Intérêt enregistré" : "Je suis intéressé"}
            </button>
          ) : (
            <div className="grid gap-2">
              {status === "interesse" ? (
                <button className={`${buttonClass} w-full`} disabled={pending} onClick={applied}>
                  {pending ? "Enregistrement…" : "J’ai candidaté"}
                </button>
              ) : status === "candidate" ? null : (
                <button className={`${buttonClass} w-full`} disabled={pending} onClick={apply}>
                  {primaryLabel}
                </button>
              )}
              {status && (
                <button className={`${quietButtonClass} w-full`} type="button" onClick={openTarget}>
                  {mode === "email" ? "Réécrire" : "Rouvrir le lien"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReasonForm({
  title,
  reasons,
  hint,
  note,
  onSubmit,
}: {
  title: string;
  reasons: { value: string; label: string }[];
  hint?: string;
  note?: boolean;
  onSubmit: (reason: string, note: string) => Promise<void>;
}) {
  const [reason, setReason] = useState("");
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);

  async function send() {
    if (!reason || pending) return;
    setPending(true);
    await onSubmit(reason, text);
    setPending(false);
  }

  return (
    <details className="rounded-lg border border-line bg-card p-3 text-sm">
      <summary className="min-h-11 cursor-pointer py-2 font-medium">{title}</summary>
      {hint && <p className="mt-2 text-muted">{hint}</p>}
      <div className="mt-3 grid gap-2">
        <label className="grid gap-1">
          Motif
          <select className={inputClass} value={reason} onChange={(event) => setReason(event.target.value)}>
            <option value="">Choisir un motif</option>
            {reasons.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        {note && (
          <label className="grid gap-1">
            Précision, si tu veux
            <textarea className={inputClass} value={text} onChange={(event) => setText(event.target.value)} rows={3} />
          </label>
        )}
        <button className={quietButtonClass} disabled={!reason || pending} onClick={send} type="button">
          {pending ? "Enregistrement…" : "Envoyer"}
        </button>
      </div>
    </details>
  );
}
