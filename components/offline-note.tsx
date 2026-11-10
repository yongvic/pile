"use client";

import { useEffect, useState } from "react";

export function OfflineNote() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener("offline", sync);
    window.addEventListener("online", sync);
    return () => {
      window.removeEventListener("offline", sync);
      window.removeEventListener("online", sync);
    };
  }, []);

  if (!offline) return null;
  return (
    <p role="status" className="mb-3 rounded-lg bg-sand px-3 py-2 text-sm">
      Pas de réseau. Tu peux lire cette page. L’enregistrement partira quand la connexion reviendra.
    </p>
  );
}
