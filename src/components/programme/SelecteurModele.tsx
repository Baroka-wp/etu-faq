"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarPlus, Check, Loader2, Plus, Search, X } from "lucide-react";

export interface Modele {
  cle: string;
  source: "catalogue" | "evenement";
  activiteId: string | null;
  categorie: "TEMPLE" | "ECOLE" | null;
  titre: string;
  description: string | null;
  heures: string;
  lieu: string;
  derniereUtilisation: string | null;
  utilisations: number;
}

const MOIS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

function sansAccents(valeur: string) {
  return valeur.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/**
 * Choix du modèle d'événement posé sur une date : un modèle existant
 * (activité du catalogue ou ancien événement) ou un modèle tout neuf.
 */
export default function SelecteurModele({
  annee,
  mois,
  jour,
  categorie,
  activiteSuggeree,
  onFermer,
  onAppliquer,
}: {
  annee: number;
  mois: number;
  jour: number;
  categorie: "TEMPLE" | "ECOLE";
  activiteSuggeree: string | null;
  onFermer: () => void;
  onAppliquer: (choix: {
    activiteId: string | null;
    titre: string;
    description: string;
    heures: string;
    lieu: string;
    categorie: "TEMPLE" | "ECOLE";
    creerLien: boolean;
  }) => Promise<void>;
}) {
  const [modeles, setModeles] = useState<Modele[] | null>(null);
  const [recherche, setRecherche] = useState("");
  const [creerLien, setCreerLien] = useState(true);
  const [enCours, setEnCours] = useState(false);
  const [nouveau, setNouveau] = useState(false);
  const [form, setForm] = useState({ titre: "", description: "", heures: "", lieu: "" });

  useEffect(() => {
    fetch("/api/admin/programmes-mensuels/modeles")
      .then((reponse) => reponse.json())
      .then((corps) => setModeles(corps.data ?? []))
      .catch(() => setModeles([]));
  }, []);

  const liste = useMemo(() => {
    if (!modeles) return [];
    const terme = sansAccents(recherche.trim());
    const filtres = modeles.filter(
      (modele) => !terme || sansAccents(`${modele.titre} ${modele.lieu}`).includes(terme),
    );
    // La ligne cliquée d'abord, puis le programme affiché, puis les plus récents.
    return filtres.sort((a, b) => {
      if (a.activiteId === activiteSuggeree) return -1;
      if (b.activiteId === activiteSuggeree) return 1;
      const memeCategorie = Number(b.categorie === categorie) - Number(a.categorie === categorie);
      if (memeCategorie !== 0) return memeCategorie;
      return (b.derniereUtilisation ?? "").localeCompare(a.derniereUtilisation ?? "");
    });
  }, [modeles, recherche, activiteSuggeree, categorie]);

  const choisir = async (modele: Modele) => {
    if (enCours) return;
    setEnCours(true);
    try {
      await onAppliquer({
        activiteId: modele.activiteId,
        titre: modele.titre,
        description: modele.description ?? "",
        heures: modele.heures,
        lieu: modele.lieu,
        categorie: modele.categorie ?? categorie,
        creerLien,
      });
    } finally {
      setEnCours(false);
    }
  };

  const creer = async (event: React.FormEvent) => {
    event.preventDefault();
    if (enCours) return;
    setEnCours(true);
    try {
      await onAppliquer({
        activiteId: null,
        titre: form.titre.trim(),
        description: form.description.trim(),
        heures: form.heures.trim(),
        lieu: form.lieu.trim(),
        categorie,
        creerLien,
      });
    } finally {
      setEnCours(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[78] flex items-center justify-center bg-black/40 p-4"
      onMouseDown={onFermer}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titre-modele"
        className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-lg bg-white shadow-xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-gray-200 p-5">
          <div>
            <p className="text-sm text-gray-500">
              Séance du {jour} {MOIS[mois - 1]} {annee}
            </p>
            <h2 id="titre-modele" className="mt-1 text-lg font-semibold text-gray-900">
              {nouveau ? "Nouveau modèle" : "Choisir un modèle"}
            </h2>
          </div>
          <button
            onClick={onFermer}
            className="rounded-md p-2 text-gray-400 hover:bg-gray-100"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {nouveau ? (
          <form onSubmit={creer} className="space-y-3 overflow-y-auto p-5">
            <label className="block text-sm font-medium text-gray-700">
              Titre
              <input
                required
                autoFocus
                value={form.titre}
                onChange={(event) => setForm({ ...form, titre: event.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Description
              <textarea
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                rows={2}
                className="mt-1 w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-medium text-gray-700">
                Heures
                <input
                  required
                  placeholder="9h-12h"
                  value={form.heures}
                  onChange={(event) => setForm({ ...form, heures: event.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Lieu
                <input
                  required
                  placeholder={categorie === "TEMPLE" ? "Temple" : "École"}
                  value={form.lieu}
                  onChange={(event) => setForm({ ...form, lieu: event.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
                />
              </label>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setNouveau(false)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Retour
              </button>
              <button
                disabled={enCours}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-50"
              >
                {enCours ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Créer et poser sur le {jour}
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="border-b border-gray-200 p-4">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  aria-hidden
                />
                <label htmlFor="recherche-modele" className="sr-only">
                  Rechercher un modèle
                </label>
                <input
                  id="recherche-modele"
                  autoFocus
                  value={recherche}
                  onChange={(event) => setRecherche(event.target.value)}
                  placeholder="Rechercher parmi les événements déjà créés"
                  className="h-10 w-full rounded-md border border-gray-300 pl-9 pr-3 text-sm outline-none focus:border-gray-500"
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {!modeles ? (
                <p className="p-6 text-center text-sm text-gray-500">Chargement des modèles…</p>
              ) : liste.length === 0 ? (
                <p className="p-6 text-center text-sm text-gray-500">Aucun modèle ne correspond.</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {liste.map((modele) => (
                    <li key={modele.cle}>
                      <button
                        type="button"
                        disabled={enCours}
                        onClick={() => choisir(modele)}
                        className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-gray-900">
                            {modele.titre}
                          </span>
                          <span className="mt-0.5 block text-xs text-gray-500">
                            {modele.heures} · {modele.lieu}
                            {modele.utilisations > 0 && ` · ${modele.utilisations} séance(s)`}
                          </span>
                        </span>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                            modele.source === "evenement"
                              ? "bg-stone-100 text-stone-600"
                              : modele.categorie === "TEMPLE"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-indigo-50 text-indigo-700"
                          }`}
                        >
                          {modele.source === "evenement"
                            ? "Ancien"
                            : modele.categorie === "TEMPLE"
                              ? "Temple"
                              : "École"}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-3 border-t border-gray-200 p-4">
              <label className="flex cursor-pointer items-center gap-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={creerLien}
                  onChange={(event) => setCreerLien(event.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="flex items-center gap-1.5">
                  <CalendarPlus className="h-4 w-4 text-gray-400" aria-hidden />
                  Créer aussi le lien d’inscription
                </span>
              </label>
              <button
                type="button"
                onClick={() => setNouveau(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Plus className="h-4 w-4" /> Créer un nouveau modèle
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
