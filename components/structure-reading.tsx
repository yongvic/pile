"use client";

import { useEffect, useRef, useState } from "react";
import { buttonClass, quietButtonClass } from "./classes";

export type ReadingRow = {
  id: string;
  name: string;
  whatsapp: string;
  school: string;
  level: string;
  status: string;
  date: string;
};

export function StructureReading({ offerTitle, rows }: { offerTitle: string; rows: ReadingRow[] }) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) {
    return (
      <button type="button" className={buttonClass} onClick={() => setOpen(true)}>
        Montrer à la structure
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lecture-titre"
      className="fixed inset-0 z-40 overflow-auto bg-paper px-4 py-4"
    >
      <button ref={closeRef} type="button" className={quietButtonClass} onClick={() => setOpen(false)}>
        Revenir au back-office
      </button>
      <h1 id="lecture-titre" className="mt-4 text-3xl font-semibold tracking-tight">
        {offerTitle}
      </h1>
      <p className="mt-2 max-w-prose text-sm text-muted">
        Prénom, école, niveau, WhatsApp et où en est la candidature. Rien d’autre n’est affiché.
      </p>
      {rows.length === 0 ? (
        <p className="mt-6">Aucun étudiant n’a marqué cette offre.</p>
      ) : (
        <ul className="mt-6 border-t border-line">
          {rows.map((row) => (
            <li key={row.id} className="border-b border-line py-3">
              <p className="font-medium">{row.name}</p>
              <p>{row.whatsapp || "WhatsApp non renseigné"}</p>
              <p className="text-sm text-muted">
                {row.school || "École non renseignée"} · {row.level || "Niveau non renseigné"} · {row.status} · {row.date}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
