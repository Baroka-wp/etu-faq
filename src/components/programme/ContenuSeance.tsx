"use client";

import { useEffect, useState } from "react";
import { BookOpen, ImagePlus, Loader2, Save, X } from "lucide-react";
import {
  MONOGRAPHIE_PRIX_DEFAUT,
  RUBRIQUES_SEANCE,
  formatPrixFcfa,
} from "@/lib/monographie";

export interface ContenuEvenement {
  id: string;
  instruction: string | null;
  seminaire: string | null;
  sujetPlanche: string | null;
  monographieActive: boolean;
  monographiePrix: number;
  monographieImageUrl: string | null;
}

/** Instruction, séminaire, sujet de planche et monographie d'un événement. */
export default function ContenuSeance({
  evenement,
  onEnregistre,
}: {
  evenement: ContenuEvenement;
  onEnregistre: (message: { type: "success" | "error"; texte: string }) => void;
}) {
  const [valeurs, setValeurs] = useState(() => initial(evenement));
  const [enregistrement, setEnregistrement] = useState(false);
  const [televersement, setTeleversement] = useState(false);

  // On ne réinitialise le formulaire que si le contenu enregistré change,
  // pas à chaque rendu du parent.
  const reference = JSON.stringify(initial(evenement));
  useEffect(() => {
    setValeurs(JSON.parse(reference));
  }, [reference]);

  const modifie = JSON.stringify(valeurs) !== reference;

  const televerser = async (fichier: File) => {
    setTeleversement(true);
    try {
      const formData = new FormData();
      formData.append("file", fichier);
      const response = await fetch("/api/admin/bibliotheque/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok || !data.secure_url) throw new Error(data.error);
      setValeurs((current) => ({ ...current, monographieImageUrl: data.secure_url }));
    } catch (error) {
      onEnregistre({
        type: "error",
        texte: error instanceof Error && error.message ? error.message : "Téléversement impossible",
      });
    } finally {
      setTeleversement(false);
    }
  };

  const enregistrer = async () => {
    const prix = Number(valeurs.monographiePrix);
    if (!Number.isInteger(prix) || prix < 0) {
      onEnregistre({ type: "error", texte: "Le prix doit être un nombre entier de FCFA" });
      return;
    }
    setEnregistrement(true);
    try {
      const response = await fetch(`/api/admin/traversees/${evenement.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...valeurs, monographiePrix: prix }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      onEnregistre({ type: "success", texte: "Contenu de la séance enregistré" });
    } catch (error) {
      onEnregistre({
        type: "error",
        texte: error instanceof Error ? error.message : "Enregistrement impossible",
      });
    } finally {
      setEnregistrement(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900">Contenu de la séance</h3>
      <p className="mt-1 text-sm text-gray-500">
        Facultatif. Ce qui est renseigné s’affiche sur la page publique.
      </p>

      <div className="mt-4 space-y-3">
        {RUBRIQUES_SEANCE.map(({ cle, label }) => (
          <div key={cle}>
            <label htmlFor={`seance-${cle}`} className="text-sm font-medium text-gray-700">
              {label}
            </label>
            <textarea
              id={`seance-${cle}`}
              value={valeurs[cle]}
              onChange={(event) =>
                setValeurs((current) => ({ ...current, [cle]: event.target.value }))
              }
              rows={2}
              maxLength={1000}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
            />
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={valeurs.monographieActive}
            onChange={(event) =>
              setValeurs((current) => ({ ...current, monographieActive: event.target.checked }))
            }
            className="mt-0.5 h-4 w-4 rounded border-gray-300"
          />
          <span>
            <span className="flex items-center gap-2 text-sm font-medium text-gray-900">
              <BookOpen className="h-4 w-4" aria-hidden /> Monographie à acquérir
            </span>
            <span className="mt-0.5 block text-xs text-gray-500">
              À l’inscription, le membre indique s’il l’a déjà ou s’il veut l’obtenir (message WhatsApp).
            </span>
          </span>
        </label>

        {valeurs.monographieActive && (
          <div className="mt-4 flex flex-col gap-4 sm:flex-row">
            <div className="shrink-0">
              {valeurs.monographieImageUrl ? (
                <div className="relative h-32 w-24 overflow-hidden rounded-md border border-gray-200 bg-white">
                  <img
                    src={valeurs.monographieImageUrl}
                    alt="Couverture de la monographie"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setValeurs((current) => ({ ...current, monographieImageUrl: "" }))}
                    className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-gray-600 shadow hover:text-red-600"
                    aria-label="Retirer la couverture"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex h-32 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-gray-300 bg-white text-center text-xs text-gray-500 hover:border-gray-400">
                  {televersement ? (
                    <Loader2 className="h-5 w-5 animate-spin" aria-label="Téléversement" />
                  ) : (
                    <ImagePlus className="h-5 w-5" aria-hidden />
                  )}
                  Couverture
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    disabled={televersement}
                    onChange={(event) => {
                      const fichier = event.target.files?.[0];
                      if (fichier) void televerser(fichier);
                      event.target.value = "";
                    }}
                  />
                </label>
              )}
            </div>
            <div className="flex-1">
              <label htmlFor="monographie-prix" className="text-sm font-medium text-gray-700">
                Prix (FCFA)
              </label>
              <input
                id="monographie-prix"
                type="number"
                inputMode="numeric"
                min={0}
                step={100}
                value={valeurs.monographiePrix}
                onChange={(event) =>
                  setValeurs((current) => ({ ...current, monographiePrix: event.target.value }))
                }
                className="mt-1 h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-gray-500 sm:w-40"
              />
              <p className="mt-1 text-xs text-gray-500">
                Affiché au membre : {formatPrixFcfa(Number(valeurs.monographiePrix) || 0)}
              </p>
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={enregistrer}
        disabled={!modifie || enregistrement || televersement}
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-40"
      >
        {enregistrement ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Enregistrer le contenu
      </button>
    </div>
  );
}

function initial(evenement: ContenuEvenement) {
  return {
    instruction: evenement.instruction ?? "",
    seminaire: evenement.seminaire ?? "",
    sujetPlanche: evenement.sujetPlanche ?? "",
    monographieActive: evenement.monographieActive,
    monographiePrix: String(evenement.monographiePrix ?? MONOGRAPHIE_PRIX_DEFAUT),
    monographieImageUrl: evenement.monographieImageUrl ?? "",
  };
}
