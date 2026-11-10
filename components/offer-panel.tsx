"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { dismissAction, markAppliedAction, markInterestedAction, reportAction } from "@/app/actions";
import { DISMISS_REASONS, REPORT_REASONS } from "@/lib/labels";
import type { ApplyMode, InterestStatus } from "@/lib/types";
import { buttonClass, inputClass, quietButtonClass } from "./classes";

export function OfferPanel({
  id,
  mode,
  status,
}: {
  id: string;
  mode: ApplyMode;
  status: InterestStatus | null;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function apply() {
    setPending(true);
    setError("");
    const result = await markInterestedAction(id);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.url?.startsWith("mailto:")) window.location.href = result.url;
    else if (result.url) window.open(result.url, "_blank", "noopener,noreferrer");
    router.refresh();
  }

  async function applied() {
    setPending(true);
    const result = await markAppliedAction(id);
    setPending(false);
    if (result.error) setError(result.error);
    else router.refresh();
  }

  return (
    <div className="grid gap-4">
      {error && <p className="text-sm text-clay">{error}</p>}
      {message && <p className="text-sm text-green">{message}</p>}
      {mode === "interet" ? (
        <button className={buttonClass} disabled={pending || status !== null} onClick={apply}>
          {status ? "Intérêt enregistré" : "Je suis intéressé"}
        </button>
      ) : (
        <button className={buttonClass} disabled={pending} onClick={apply}>
          {mode === "email" ? "Écrire" : "Candidater"}
        </button>
      )}
      {mode === "interet" && status === null && (
        <p className="text-sm text-muted">Pile transmet ton intérêt. La structure n’a pas encore de compte ici.</p>
      )}
      {mode !== "interet" && status === "interesse" && (
        <button className={quietButtonClass} disabled={pending} onClick={applied}>
          J’ai candidaté
        </button>
      )}
      {status === "candidate" && <p className="text-sm text-green">Candidature déclarée.</p>}
      <ReasonForm
        title="Pas pour moi"
        reasons={DISMISS_REASONS}
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
        hint="Pile ne demande jamais d’argent."
        onSubmit={async (reason, note) => {
          const result = await reportAction(id, reason, note);
          if (result.error) setError(result.error);
          else setMessage(result.message ?? "Signalement envoyé.");
        }}
      />
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
  const [reason, setReason] = useState(reasons[0]?.value ?? "autre");
  const [text, setText] = useState("");
  return (
    <details className="rounded-2xl border border-line bg-card p-3 text-sm">
      <summary>{title}</summary>
      {hint && <p className="mt-2 text-muted">{hint}</p>}
      <div className="mt-3 grid gap-2">
        <select className={inputClass} value={reason} onChange={(event) => setReason(event.target.value)}>
          {reasons.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        {note && <textarea className={inputClass} value={text} onChange={(event) => setText(event.target.value)} placeholder="Une phrase, si tu veux" />}
        <button
          className={quietButtonClass}
          onClick={() => onSubmit(reason, text)}
          type="button"
        >
          Envoyer
        </button>
      </div>
    </details>
  );
}
