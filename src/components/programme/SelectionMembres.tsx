"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

export interface MembreActif {
  id: string;
  nom: string;
  prenoms: string;
  nomSacre: string | null;
  grade: string;
  equipage: string;
}

const EQUIPAGES = ["ALEPH", "BETH", "GUIMEL"];

function sansAccents(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function gradeAutorise(grade: string, gradesAutorises: string[]) {
  return (
    grade === "Alchimiste" ||
    gradesAutorises.length === 0 ||
    gradesAutorises.includes(grade)
  );
}

/**
 * Liste à cocher des membres actifs, filtrable par nom, grade et équipage.
 * Seuls les membres dont le grade est autorisé pour l'événement sont proposés.
 */
export default function SelectionMembres({
  membres,
  gradesAutorises,
  coches,
  onChange,
  chargement,
}: {
  membres: MembreActif[];
  gradesAutorises: string[];
  coches: string[];
  onChange: (ids: string[]) => void;
  chargement: boolean;
}) {
  const [recherche, setRecherche] = useState("");
  const [equipage, setEquipage] = useState("");
  const [grade, setGrade] = useState("");

  const eligibles = useMemo(
    () => membres.filter((membre) => gradeAutorise(membre.grade, gradesAutorises)),
    [membres, gradesAutorises],
  );

  const filtres = useMemo(() => {
    const terme = sansAccents(recherche.trim());
    return eligibles.filter((membre) => {
      if (equipage && membre.equipage !== equipage) return false;
      if (grade && membre.grade !== grade) return false;
      if (!terme) return true;
      return sansAccents(
        `${membre.nom} ${membre.prenoms} ${membre.nomSacre ?? ""}`,
      ).includes(terme);
    });
  }, [eligibles, recherche, equipage, grade]);

  const cochesSet = new Set(coches);
  const tousFiltresCoches =
    filtres.length > 0 && filtres.every((membre) => cochesSet.has(membre.id));

  const basculer = (id: string) => {
    onChange(
      cochesSet.has(id) ? coches.filter((item) => item !== id) : [...coches, id],
    );
  };

  const basculerFiltres = () => {
    const idsFiltres = new Set(filtres.map((membre) => membre.id));
    onChange(
      tousFiltresCoches
        ? coches.filter((id) => !idsFiltres.has(id))
        : [...new Set([...coches, ...idsFiltres])],
    );
  };

  const gradesProposes = [...new Set(eligibles.map((membre) => membre.grade))];

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="space-y-2 border-b border-gray-200 p-3">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            aria-hidden
          />
          <label htmlFor="filtre-membres" className="sr-only">
            Filtrer les membres
          </label>
          <input
            id="filtre-membres"
            value={recherche}
            onChange={(event) => setRecherche(event.target.value)}
            placeholder="Nom, prénom ou nom sacré"
            className="h-10 w-full rounded-md border border-gray-300 pl-9 pr-3 text-sm outline-none focus:border-gray-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="sr-only" htmlFor="filtre-equipage">Équipage</label>
          <select
            id="filtre-equipage"
            value={equipage}
            onChange={(event) => setEquipage(event.target.value)}
            className="h-10 rounded-md border border-gray-300 bg-white px-2 text-sm outline-none focus:border-gray-500"
          >
            <option value="">Tous les équipages</option>
            {EQUIPAGES.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <label className="sr-only" htmlFor="filtre-grade">Grade</label>
          <select
            id="filtre-grade"
            value={grade}
            onChange={(event) => setGrade(event.target.value)}
            className="h-10 rounded-md border border-gray-300 bg-white px-2 text-sm outline-none focus:border-gray-500"
          >
            <option value="">Tous les grades</option>
            {gradesProposes.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-3 py-2 text-sm">
        <label className="flex cursor-pointer items-center gap-2 text-gray-700">
          <input
            type="checkbox"
            checked={tousFiltresCoches}
            onChange={basculerFiltres}
            disabled={filtres.length === 0}
            className="h-4 w-4 rounded border-gray-300"
          />
          Tout cocher ({filtres.length})
        </label>
        <span className="font-medium text-gray-900" aria-live="polite">
          {coches.length} coché{coches.length > 1 ? "s" : ""}
        </span>
      </div>

      {chargement ? (
        <p className="px-3 py-6 text-center text-sm text-gray-500">Chargement des membres…</p>
      ) : filtres.length === 0 ? (
        <p className="px-3 py-6 text-center text-sm text-gray-500">Aucun membre ne correspond.</p>
      ) : (
        <ul className="max-h-64 divide-y divide-gray-100 overflow-y-auto">
          {filtres.map((membre) => (
            <li key={membre.id}>
              <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={cochesSet.has(membre.id)}
                  onChange={() => basculer(membre.id)}
                  className="h-4 w-4 shrink-0 rounded border-gray-300"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-gray-900">
                    {membre.prenoms} {membre.nom}
                    {membre.nomSacre ? ` (${membre.nomSacre})` : ""}
                  </span>
                  <span className="block text-xs text-gray-500">
                    {membre.grade} · {membre.equipage}
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
