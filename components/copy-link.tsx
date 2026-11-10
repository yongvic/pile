"use client";

import { useState } from "react";
import { quietButtonClass } from "./classes";

export function CopyLink({ path }: { path: string }) {
  const [state, setState] = useState<"idle" | "done" | "failed">("idle");
  const [url, setUrl] = useState("");

  async function copy() {
    const next = `${window.location.origin}${path}`;
    setUrl(next);
    try {
      await navigator.clipboard.writeText(next);
      setState("done");
    } catch {
      setState("failed");
    }
  }

  return (
    <div className="grid gap-2">
      <button type="button" className={quietButtonClass} onClick={copy}>
        {state === "done" ? "Lien copié" : "Copier le lien"}
      </button>
      {state === "failed" && (
        <label className="grid gap-1 text-sm">
          Copie ce lien à la main
          <input className="min-h-11 w-full rounded-lg border border-line bg-card px-3" readOnly value={url} />
        </label>
      )}
    </div>
  );
}
