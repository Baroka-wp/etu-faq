"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  Clipboard,
  Loader2,
  MapPin,
  RotateCcw,
  ScanLine,
  Search,
  UserCheck,
  Users,
} from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import EventPresenceScanner from "@/components/admin/EventPresenceScanner";

interface MembrePresence {
  id: string;
  nom: string;
  prenoms: string;
  nomSacre: string | null;
  grade: string;
  equipage: string;
  imageUrl: string | null;
}

interface InscriptionPresence {
  id: string;
  createdAt: string;
  presenceAt: string | null;
  membre: MembrePresence;
}

interface ResultatRecherche extends MembrePresence {
  inscrit: boolean;
  presenceAt: string | null;
}

interface Evenement {
  id: string;
  titre: string;
  date: string;
  lieu: string;
  gradesAutorises: string[];
}

export default function PresenceEvenementPage() {
  const params = useParams<{ evenementId: string }>();
  const router = useRouter();
  const [evenement, setEvenement] = useState<Evenement | null>(null);
  const [inscriptions, setInscriptions] = useState<InscriptionPresence[]>([]);
  const [loading, setLoading] = useState(true);
  const [scannerOuvert, setScannerOuvert] = useState(false);
  const [recherche, setRecherche] = useState("");
  const [resultats, setResultats] = useState<ResultatRecherche[]>([]);
  const [rechercheEnCours, setRechercheEnCours] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [lienCopie, setLienCopie] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    texte: string;
  } | null>(null);

  const apiUrl = `/api/admin/presences/evenement/${encodeURIComponent(params.evenementId)}`;

  const charger = useCallback(async () => {
    try {
      const response = await fetch(apiUrl);
      if (response.status === 401) {
        router.push(
          `/admin-login?retour=${encodeURIComponent(window.location.pathname)}`,
        );
        return;
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Chargement impossible");
      setEvenement(data.data.evenement);
      setInscriptions(data.data.inscriptions);
    } catch (error) {
      setMessage({
        type: "error",
        texte: error instanceof Error ? error.message : "Chargement impossible",
      });
    } finally {
      setLoading(false);
    }
  }, [apiUrl, router]);

  useEffect(() => {
    charger();
  }, [charger]);

  const marquerPresent = useCallback(
    async (membreId: string) => {
      setScannerOuvert(false);
      setActionId(membreId);
      setMessage(null);
      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ membreId }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Pointage impossible");
        setMessage({
          type: "success",
          texte: data.message || "Présence enregistrée",
        });
        setResultats([]);
        setRecherche("");
        await charger();
      } catch (error) {
        setMessage({
          type: "error",
          texte: error instanceof Error ? error.message : "Pointage impossible",
        });
      } finally {
        setActionId(null);
      }
    },
    [apiUrl, charger],
  );

  const rechercher = async () => {
    if (recherche.trim().length < 2) return;
    setRechercheEnCours(true);
    setMessage(null);
    try {
      const response = await fetch(
        `${apiUrl}?q=${encodeURIComponent(recherche.trim())}`,
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Recherche impossible");
      setResultats(data.data);
    } catch (error) {
      setMessage({
        type: "error",
        texte: error instanceof Error ? error.message : "Recherche impossible",
      });
    } finally {
      setRechercheEnCours(false);
    }
  };

  const annulerPresence = async (membre: MembrePresence) => {
    if (
      !window.confirm(
        `Annuler la présence de ${membre.prenoms} ${membre.nom} ?`,
      )
    )
      return;
    setActionId(membre.id);
    setMessage(null);
    try {
      const response = await fetch(
        `${apiUrl}?membreId=${encodeURIComponent(membre.id)}`,
        { method: "DELETE" },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Annulation impossible");
      setMessage({ type: "success", texte: "Présence annulée" });
      await charger();
    } catch (error) {
      setMessage({
        type: "error",
        texte: error instanceof Error ? error.message : "Annulation impossible",
      });
    } finally {
      setActionId(null);
    }
  };

  const copierLien = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setLienCopie(true);
    window.setTimeout(() => setLienCopie(false), 1800);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin-login");
  };

  const presents = useMemo(
    () => inscriptions.filter((inscription) => Boolean(inscription.presenceAt)),
    [inscriptions],
  );
  const absents = useMemo(
    () => inscriptions.filter((inscription) => !inscription.presenceAt),
    [inscriptions],
  );

  return (
    <div className="min-h-screen bg-[#f5f3ed]">
      <AdminSidebar
        activeTab="programmes"
        onTabChange={() => undefined}
        onLogout={handleLogout}
      />
      <main className="min-h-screen px-4 pb-12 pt-16 lg:ml-64 lg:px-8 lg:pt-8">
        <div className="mx-auto max-w-5xl">
          {loading ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
            </div>
          ) : !evenement ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
              {message?.texte || "Événement introuvable"}
            </div>
          ) : (
            <>
              <header className="overflow-hidden rounded-3xl bg-[#172033] text-white shadow-xl shadow-slate-900/10">
                <div className="h-1.5 bg-[linear-gradient(90deg,#11843b_0_33%,#e3c33b_33%_66%,#c91f3b_66%)]" />
                <div className="p-5 sm:p-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
                    Présence liée à l’événement
                  </p>
                  <h1 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl">
                    {evenement.titre}
                  </h1>
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-300">
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-amber-300" />
                      {new Date(evenement.date).toLocaleString("fr-FR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-amber-300" />
                      {evenement.lieu}
                    </span>
                  </div>
                </div>
              </header>

              {message && (
                <div
                  className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-medium ${
                    message.type === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-rose-200 bg-rose-50 text-rose-800"
                  }`}
                >
                  {message.texte}
                </div>
              )}

              <section className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
                <button
                  onClick={() => setScannerOuvert(true)}
                  className="flex min-h-16 items-center justify-center gap-3 rounded-2xl bg-[#172033] px-6 text-base font-bold text-white shadow-sm transition hover:bg-slate-800"
                >
                  <ScanLine className="h-6 w-6 text-amber-300" />
                  Scanner une carte membre
                </button>
                <button
                  onClick={copierLien}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {lienCopie ? (
                    <Check className="h-4 w-4 text-emerald-700" />
                  ) : (
                    <Clipboard className="h-4 w-4" />
                  )}
                  {lienCopie ? "Lien copié" : "Copier le lien de pointage"}
                </button>
              </section>

              <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-amber-50 p-2.5 text-amber-800">
                    <Search className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900">
                      Recherche manuelle
                    </h2>
                    <p className="text-sm text-slate-500">
                      Si la carte n’est pas disponible.
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <input
                    value={recherche}
                    onChange={(event) => {
                      setRecherche(event.target.value);
                      setResultats([]);
                    }}
                    onKeyDown={(event) => event.key === "Enter" && rechercher()}
                    placeholder="Nom, prénom ou nom sacré"
                    className="h-12 min-w-0 flex-1 rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-slate-600 focus:ring-2 focus:ring-slate-200"
                  />
                  <button
                    onClick={rechercher}
                    disabled={recherche.trim().length < 2 || rechercheEnCours}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-800 px-5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {rechercheEnCours ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    Rechercher
                  </button>
                </div>

                {resultats.length > 0 && (
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {resultats.map((membre) => (
                      <article
                        key={membre.id}
                        className="flex items-center gap-3 rounded-xl border border-slate-200 p-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {membre.prenoms} {membre.nom}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {membre.nomSacre || "Sans nom sacré"} ·{" "}
                            {membre.grade}
                          </p>
                        </div>
                        <button
                          onClick={() => marquerPresent(membre.id)}
                          disabled={
                            Boolean(membre.presenceAt) || actionId === membre.id
                          }
                          className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-bold ${
                            membre.presenceAt
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-900 text-white disabled:opacity-50"
                          }`}
                        >
                          {actionId === membre.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : membre.presenceAt ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                          {membre.presenceAt ? "Présent" : "Marquer présent"}
                        </button>
                      </article>
                    ))}
                  </div>
                )}
                {!rechercheEnCours &&
                  recherche.trim().length >= 2 &&
                  resultats.length === 0 && (
                    <p className="mt-3 text-sm text-slate-500">
                      Lancez la recherche pour afficher les membres
                      correspondants.
                    </p>
                  )}
              </section>

              <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <header className="flex items-center justify-between gap-4 border-b border-slate-200 p-5">
                  <div>
                    <h2 className="font-bold text-slate-900">Participants</h2>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {inscriptions.length} inscrit(s) à cet événement
                    </p>
                  </div>
                  <div className="flex items-baseline gap-1 rounded-2xl bg-emerald-50 px-4 py-2 text-emerald-800">
                    <strong className="text-2xl leading-none">
                      {presents.length}
                    </strong>
                    <span className="text-xs font-semibold">présent(s)</span>
                  </div>
                </header>

                {inscriptions.length === 0 ? (
                  <div className="px-5 py-12 text-center">
                    <Users className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="mt-2 text-sm text-slate-500">
                      Aucun membre inscrit ou pointé.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {[...presents, ...absents].map((inscription) => (
                      <article
                        key={inscription.id}
                        className="flex items-center gap-3 px-4 py-3 sm:px-5"
                      >
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                            inscription.presenceAt
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {inscription.presenceAt ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <Users className="h-4 w-4" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {inscription.membre.prenoms}{" "}
                            {inscription.membre.nom}
                            {inscription.membre.nomSacre
                              ? ` (${inscription.membre.nomSacre})`
                              : ""}
                          </p>
                          <p className="text-xs text-slate-500">
                            {inscription.membre.grade}
                            {inscription.presenceAt &&
                              ` · Pointé à ${new Date(inscription.presenceAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`}
                          </p>
                        </div>
                        {inscription.presenceAt && (
                          <button
                            onClick={() => annulerPresence(inscription.membre)}
                            disabled={actionId === inscription.membre.id}
                            className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
                            aria-label={`Annuler la présence de ${inscription.membre.prenoms} ${inscription.membre.nom}`}
                          >
                            {actionId === inscription.membre.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RotateCcw className="h-4 w-4" />
                            )}
                            <span className="hidden sm:inline">Annuler</span>
                          </button>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>

      {scannerOuvert && (
        <EventPresenceScanner
          onDetected={marquerPresent}
          onClose={() => setScannerOuvert(false)}
        />
      )}
    </div>
  );
}
