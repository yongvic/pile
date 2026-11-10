"use client";

import { useMemo, useState } from "react";
import { OfferCard, type PublicOffer } from "./offer-card";
import { inputClass } from "./classes";

export function OfferList({ offers, empty }: { offers: PublicOffer[]; empty: string }) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLocaleLowerCase("fr");
  const shown = useMemo(() => {
    if (!needle) return offers;
    return offers.filter((offer) =>
      `${offer.title} ${offer.organizationName}`.toLocaleLowerCase("fr").includes(needle),
    );
  }, [offers, needle]);
  const search = offers.length >= 8;

  return (
    <div>
      {search && (
        <label className="mb-2 grid gap-1 text-sm font-medium">
          Chercher un titre
          <input
            className={inputClass}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Titre ou structure"
            type="search"
          />
        </label>
      )}
      {shown.length === 0 ? (
        <p className="text-sm">{needle ? `Aucun titre ne contient « ${query.trim()} ».` : empty}</p>
      ) : (
        <ul className="border-t border-line">
          {shown.map((offer) => (
            <li key={offer.id}>
              <OfferCard offer={offer} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
