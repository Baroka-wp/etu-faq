"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  Download,
  ExternalLink,
  FileImage,
  Link2,
  Loader2,
  Pencil,
  Plus,
  Save,
  ScanLine,
  Search,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import ProgrammeCalendar from "@/components/programme/ProgrammeCalendar";

type Categorie = "TEMPLE" | "ECOLE";

interface EvenementLie {
  id: string;
  jour: number;
  lienUnique: string;
  gradesAutorises: string[];
  inscrits: number;
}

interface Activite {
  id: string;
  categorie: Categorie;
  titre: string;
  description: string | null;
  heures: string;
  lieu: string;
  ordre: number;
  specifique?: boolean;
  jours: number[];
  evenements: EvenementLie[];
}

interface Inscrit {
  id: string;
  createdAt: string;
  membre: {
    id: string;
    nom: string;
    prenoms: string;
    nomSacre: string | null;
    grade: string;
    telephoneWhatsapp: string;
  };
}

interface MembreCandidat {
  id: string;
  nom: string;
  prenoms: string;
  nomSacre: string | null;
  grade: string;
}

interface Selection {
  activiteId: string;
  jour: number;
}

const CATEGORIES: Record<Categorie, { label: string }> = {
  TEMPLE: { label: "Programme du Temple" },
  ECOLE: { label: "Programme pédagogique" },
};
const MOIS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];
const GRADES = ["Explorateur", "Constructeur", "Navigateur", "Alchimiste"];

export default function ProgrammesMensuelsPage() {
  const router = useRouter();
  const exportRef = useRef<HTMLDivElement>(null);
  const now = new Date();
  const [date, setDate] = useState(
    new Date(now.getFullYear(), now.getMonth(), 1),
  );
  const [categorie, setCategorie] = useState<Categorie>("TEMPLE");
  const [activites, setActivites] = useState<Activite[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    texte: string;
  } | null>(null);
  const [exporting, setExporting] = useState<"png" | "pdf" | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    titre: "",
    description: "",
    heures: "",
    lieu: "",
  });
  const [appliquerFuturs, setAppliquerFuturs] = useState(false);
  const [activiteEnEdition, setActiviteEnEdition] = useState<Activite | null>(
    null,
  );
  const [editForm, setEditForm] = useState({
    titre: "",
    description: "",
    heures: "",
    lieu: "",
  });
  const [editing, setEditing] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [creatingLink, setCreatingLink] = useState(false);
  const [grades, setGrades] = useState([...GRADES]);
  const [inscrits, setInscrits] = useState<Inscrit[]>([]);
  const [loadingInscrits, setLoadingInscrits] = useState(false);
  const [rechercheMembre, setRechercheMembre] = useState("");
  const [membresTrouves, setMembresTrouves] = useState<MembreCandidat[]>([]);
  const [rechercheEnCours, setRechercheEnCours] = useState(false);
  const [inscriptionEnCours, setInscriptionEnCours] = useState<string | null>(
    null,
  );
  const [retraitEnCours, setRetraitEnCours] = useState<string | null>(null);

  const annee = date.getFullYear();
  const mois = date.getMonth() + 1;
  const activitesAffichees = activites.filter(
    (item) => item.categorie === categorie,
  );
  const configuration = CATEGORIES[categorie];
  const activiteSelectionnee = selection
    ? (activites.find((item) => item.id === selection.activiteId) ?? null)
    : null;
  const evenementSelectionne =
    activiteSelectionnee && selection
      ? (activiteSelectionnee.evenements.find(
          (item) => item.jour === selection.jour,
        ) ?? null)
      : null;

  const charger = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch(
        `/api/admin/programmes-mensuels?annee=${annee}&mois=${mois}`,
      );
      if (response.status === 401) {
        router.push("/admin-login");
        return;
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setActivites(data.data);
      setDirty(false);
    } catch (error) {
      setMessage({
        type: "error",
        texte: error instanceof Error ? error.message : "Chargement impossible",
      });
    } finally {
      setLoading(false);
    }
  }, [annee, mois, router]);

  useEffect(() => {
    charger();
  }, [charger]);

  const changerMois = (direction: number) => {
    if (
      dirty &&
      !window.confirm("Les dates non enregistrées seront perdues. Continuer ?")
    )
      return;
    setSelection(null);
    setAppliquerFuturs(false);
    setDate(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + direction, 1),
    );
  };

  const cocherJour = (activiteId: string, jour: number) => {
    const activite = activites.find((item) => item.id === activiteId);
    if (!activite) return;
    const dejaCoche = activite.jours.includes(jour);
    if (dejaCoche) {
      setSelection({ activiteId, jour });
      const event = activite.evenements.find((item) => item.jour === jour);
      setGrades(
        event?.gradesAutorises.length ? event.gradesAutorises : [...GRADES],
      );
      return;
    }
    setActivites((current) =>
      current.map((item) =>
        item.id === activiteId
          ? { ...item, jours: [...item.jours, jour].sort((a, b) => a - b) }
          : item,
      ),
    );
    setDirty(true);
  };

  const enregistrer = async (afficherMessage = true) => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/programmes-mensuels", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          annee,
          mois,
          programmations: activites.map(({ id, jours }) => ({
            activiteId: id,
            jours,
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setDirty(false);
      if (afficherMessage)
        setMessage({
          type: "success",
          texte: "Programme enregistré avec succès",
        });
      return true;
    } catch (error) {
      setMessage({
        type: "error",
        texte:
          error instanceof Error ? error.message : "Erreur d'enregistrement",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const ajouterActivite = async (event: React.FormEvent) => {
    event.preventDefault();
    setAdding(true);
    try {
      const response = await fetch("/api/admin/programmes-mensuels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ajouter-activite",
          categorie,
          annee,
          mois,
          appliquerFuturs,
          ...form,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setActivites((current) =>
        [...current, data.data].sort((a, b) => a.ordre - b.ordre),
      );
      setForm({ titre: "", description: "", heures: "", lieu: "" });
      setShowAdd(false);
      setMessage({
        type: "success",
        texte: appliquerFuturs
          ? "Activité ajoutée à ce mois et au catalogue des mois futurs"
          : `Activité ajoutée uniquement à ${MOIS[mois - 1]} ${annee}`,
      });
    } catch (error) {
      setMessage({
        type: "error",
        texte: error instanceof Error ? error.message : "Ajout impossible",
      });
    } finally {
      setAdding(false);
    }
  };

  const ouvrirEdition = (activite: Activite) => {
    setActiviteEnEdition(activite);
    setEditForm({
      titre: activite.titre,
      description: activite.description || "",
      heures: activite.heures,
      lieu: activite.lieu,
    });
  };

  const modifierActivite = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!activiteEnEdition) return;
    setEditing(true);
    try {
      const response = await fetch("/api/admin/programmes-mensuels", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "modifier-activite",
          activiteId: activiteEnEdition.id,
          annee,
          mois,
          appliquerFuturs,
          ...editForm,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setActivites((current) =>
        current.map((item) =>
          item.id === activiteEnEdition.id
            ? {
                ...item,
                titre: editForm.titre.trim(),
                description: editForm.description.trim() || null,
                heures: editForm.heures.trim(),
                lieu: editForm.lieu.trim(),
                specifique: appliquerFuturs ? false : item.specifique,
              }
            : item,
        ),
      );
      setActiviteEnEdition(null);
      setMessage({
        type: "success",
        texte: appliquerFuturs
          ? "Activité modifiée pour ce mois et les mois futurs"
          : `Activité modifiée uniquement pour ${MOIS[mois - 1]} ${annee}`,
      });
    } catch (error) {
      setMessage({
        type: "error",
        texte:
          error instanceof Error ? error.message : "Modification impossible",
      });
    } finally {
      setEditing(false);
    }
  };

  const deplacerActivite = async (activite: Activite, direction: -1 | 1) => {
    if (reordering) return;
    const categorieActuelle = activitesAffichees;
    const index = categorieActuelle.findIndex(
      (item) => item.id === activite.id,
    );
    const nouvellePosition = index + direction;
    if (
      index < 0 ||
      nouvellePosition < 0 ||
      nouvellePosition >= categorieActuelle.length
    )
      return;

    const nouvelleCategorie = [...categorieActuelle];
    [nouvelleCategorie[index], nouvelleCategorie[nouvellePosition]] = [
      nouvelleCategorie[nouvellePosition],
      nouvelleCategorie[index],
    ];
    const precedent = activites;
    const ordreParId = new Map(
      nouvelleCategorie.map((item, position) => [item.id, position + 1]),
    );
    setActivites((current) =>
      current
        .map((item) =>
          item.categorie === categorie
            ? { ...item, ordre: ordreParId.get(item.id) ?? item.ordre }
            : item,
        )
        .sort((a, b) => (a.categorie === b.categorie ? a.ordre - b.ordre : 0)),
    );
    setReordering(true);
    try {
      const response = await fetch("/api/admin/programmes-mensuels", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reordonner",
          annee,
          mois,
          appliquerFuturs,
          activiteIds: nouvelleCategorie.map((item) => item.id),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setMessage({
        type: "success",
        texte: appliquerFuturs
          ? "Nouvel ordre appliqué à ce mois et aux mois futurs"
          : "Nouvel ordre appliqué uniquement à ce mois",
      });
    } catch (error) {
      setActivites(precedent);
      setMessage({
        type: "error",
        texte:
          error instanceof Error ? error.message : "Déplacement impossible",
      });
    } finally {
      setReordering(false);
    }
  };

  const retirerActivite = async (activite: Activite) => {
    const portee = appliquerFuturs
      ? "de ce mois et des mois futurs"
      : `de ${MOIS[mois - 1]} ${annee} uniquement`;
    if (!window.confirm(`Retirer « ${activite.titre} » ${portee} ?`)) return;
    const response = await fetch(
      `/api/admin/programmes-mensuels?activiteId=${activite.id}&annee=${annee}&mois=${mois}&appliquerFuturs=${appliquerFuturs ? "1" : "0"}`,
      { method: "DELETE" },
    );
    const data = await response.json();
    if (!response.ok) {
      setMessage({ type: "error", texte: data.error });
      return;
    }
    setActivites((current) =>
      current.filter((item) => item.id !== activite.id),
    );
    setMessage({
      type: "success",
      texte: appliquerFuturs
        ? "Activité retirée de ce mois et des mois futurs"
        : "Activité retirée uniquement de ce mois",
    });
  };

  const retirerDate = () => {
    if (!selection || !activiteSelectionnee) return;
    if (evenementSelectionne) {
      setMessage({
        type: "error",
        texte: "Supprimez d'abord le lien d'inscription de cette date",
      });
      return;
    }
    setActivites((current) =>
      current.map((item) =>
        item.id === selection.activiteId
          ? {
              ...item,
              jours: item.jours.filter((jour) => jour !== selection.jour),
            }
          : item,
      ),
    );
    setDirty(true);
    setSelection(null);
  };

  const creerLien = async () => {
    if (!selection) return;
    setCreatingLink(true);
    try {
      if (dirty && !(await enregistrer(false))) return;
      const response = await fetch("/api/admin/programmes-mensuels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "creer-lien",
          activiteId: selection.activiteId,
          annee,
          mois,
          jour: selection.jour,
          gradesAutorises: grades,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      await charger();
      setMessage({ type: "success", texte: "Lien d'inscription créé" });
    } catch (error) {
      setMessage({
        type: "error",
        texte:
          error instanceof Error
            ? error.message
            : "Création du lien impossible",
      });
    } finally {
      setCreatingLink(false);
    }
  };

  const supprimerLien = async () => {
    if (
      !evenementSelectionne ||
      !window.confirm(
        "Supprimer ce lien et toutes les inscriptions associées ?",
      )
    )
      return;
    const response = await fetch(
      `/api/admin/programmes-mensuels?evenementId=${evenementSelectionne.id}`,
      { method: "DELETE" },
    );
    const data = await response.json();
    if (!response.ok) {
      setMessage({ type: "error", texte: data.error });
      return;
    }
    setSelection(null);
    await charger();
    setMessage({ type: "success", texte: "Lien d'inscription supprimé" });
  };

  const copierLien = async () => {
    if (!evenementSelectionne) return;
    await navigator.clipboard.writeText(
      `${window.location.origin}/traversee/${evenementSelectionne.lienUnique}`,
    );
    setMessage({ type: "success", texte: "Lien copié dans le presse-papiers" });
  };

  const chargerInscrits = async () => {
    if (!evenementSelectionne) return;
    setLoadingInscrits(true);
    try {
      const response = await fetch(
        `/api/admin/traversees/${evenementSelectionne.id}/inscrits`,
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setInscrits(data.data);
    } catch (error) {
      setMessage({
        type: "error",
        texte: error instanceof Error ? error.message : "Liste indisponible",
      });
    } finally {
      setLoadingInscrits(false);
    }
  };

  const rechercherMembre = async () => {
    if (!evenementSelectionne || rechercheMembre.trim().length < 2) return;
    setRechercheEnCours(true);
    try {
      const response = await fetch(
        `/api/admin/traversees/${evenementSelectionne.id}/inscrits?q=${encodeURIComponent(rechercheMembre.trim())}`,
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setMembresTrouves(data.data);
    } catch (error) {
      setMessage({
        type: "error",
        texte: error instanceof Error ? error.message : "Recherche impossible",
      });
    } finally {
      setRechercheEnCours(false);
    }
  };

  const inscrireMembre = async (membre: MembreCandidat) => {
    if (!evenementSelectionne) return;
    setInscriptionEnCours(membre.id);
    try {
      const response = await fetch(
        `/api/admin/traversees/${evenementSelectionne.id}/inscrits`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ membreId: membre.id }),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setMembresTrouves((current) =>
        current.filter((item) => item.id !== membre.id),
      );
      await Promise.all([chargerInscrits(), charger()]);
      setMessage({
        type: "success",
        texte: `${membre.prenoms} ${membre.nom} a été inscrit(e)`,
      });
    } catch (error) {
      setMessage({
        type: "error",
        texte:
          error instanceof Error ? error.message : "Inscription impossible",
      });
    } finally {
      setInscriptionEnCours(null);
    }
  };

  const retirerInscription = async (inscription: Inscrit) => {
    if (!evenementSelectionne) return;
    const nom = `${inscription.membre.prenoms} ${inscription.membre.nom}`;
    if (!window.confirm(`Retirer ${nom} de la liste des inscrits ?`)) return;
    setRetraitEnCours(inscription.id);
    try {
      const response = await fetch(
        `/api/admin/traversees/${evenementSelectionne.id}/inscrits?inscriptionId=${encodeURIComponent(inscription.id)}`,
        { method: "DELETE" },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      await Promise.all([chargerInscrits(), charger()]);
      setMessage({
        type: "success",
        texte: `${nom} a été retiré(e) de cette liste`,
      });
    } catch (error) {
      setMessage({
        type: "error",
        texte: error instanceof Error ? error.message : "Retrait impossible",
      });
    } finally {
      setRetraitEnCours(null);
    }
  };

  useEffect(() => {
    setInscrits([]);
    setRechercheMembre("");
    setMembresTrouves([]);
    if (evenementSelectionne) chargerInscrits();
  }, [evenementSelectionne?.id]);

  const exporterInscriptions = () => {
    if (!activiteSelectionnee || !selection || inscrits.length === 0) return;
    const pdf = new jsPDF("landscape", "mm", "a4");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text("LISTE DES INSCRIPTIONS", 15, 18);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text(
      `${activiteSelectionnee.titre} · ${selection.jour} ${MOIS[mois - 1]} ${annee} · ${activiteSelectionnee.lieu}`,
      15,
      26,
    );
    let y = 38;
    pdf.setFont("helvetica", "bold");
    pdf.text("N°", 15, y);
    pdf.text("Nom", 28, y);
    pdf.text("Prénoms", 75, y);
    pdf.text("Nom sacré", 130, y);
    pdf.text("Grade", 185, y);
    pdf.text("Téléphone", 225, y);
    pdf.line(15, y + 2, 282, y + 2);
    y += 9;
    pdf.setFont("helvetica", "normal");
    inscrits.forEach((item, index) => {
      if (y > 195) {
        pdf.addPage();
        y = 18;
      }
      pdf.text(String(index + 1), 15, y);
      pdf.text(item.membre.nom.slice(0, 24), 28, y);
      pdf.text(item.membre.prenoms.slice(0, 28), 75, y);
      pdf.text((item.membre.nomSacre || "—").slice(0, 25), 130, y);
      pdf.text(item.membre.grade, 185, y);
      pdf.text(item.membre.telephoneWhatsapp, 225, y);
      pdf.line(15, y + 3, 282, y + 3);
      y += 9;
    });
    pdf.save(`inscriptions-${evenementSelectionne?.lienUnique}.pdf`);
  };

  const creerCanvas = async () => {
    if (!exportRef.current) throw new Error("Aperçu indisponible");
    return html2canvas(exportRef.current, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      logging: false,
      width: exportRef.current.scrollWidth,
      height: exportRef.current.scrollHeight,
    });
  };

  const exporterCalendrier = async (format: "png" | "pdf") => {
    setExporting(format);
    try {
      const canvas = await creerCanvas();
      const nom = `programme-${categorie.toLowerCase()}-${annee}-${String(mois).padStart(2, "0")}`;
      if (format === "png") {
        const lien = document.createElement("a");
        lien.download = `${nom}.png`;
        lien.href = canvas.toDataURL("image/png");
        lien.click();
      } else {
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "mm",
          format: "a4",
        });
        const largeur = 287;
        const hauteur = (canvas.height * largeur) / canvas.width;
        pdf.addImage(
          canvas.toDataURL("image/png"),
          "PNG",
          5,
          Math.max(5, (210 - hauteur) / 2),
          largeur,
          Math.min(hauteur, 200),
          undefined,
          "FAST",
        );
        pdf.save(`${nom}.pdf`);
      }
    } catch (error) {
      setMessage({
        type: "error",
        texte: error instanceof Error ? error.message : "Export impossible",
      });
    } finally {
      setExporting(null);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin-login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar
        activeTab="programmes"
        onTabChange={() => undefined}
        onLogout={handleLogout}
      />
      <main className="min-h-screen lg:ml-64">
        <header className="border-b border-gray-200 bg-white px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Planifications
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Programmes mensuels, liens d'inscription et listes des membres.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAdd(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Plus className="h-4 w-4" /> Ajouter une activité
              </button>
              <button
                onClick={() => enregistrer()}
                disabled={!dirty || saving}
                className="inline-flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}{" "}
                Enregistrer
              </button>
            </div>
          </div>
        </header>

        <div className="space-y-6 p-4 sm:p-6 lg:p-8">
          {message && (
            <div
              className={`rounded-lg border px-4 py-3 text-sm ${message.type === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"}`}
            >
              {message.texte}
            </div>
          )}

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex rounded-lg bg-gray-100 p-1">
                {(Object.keys(CATEGORIES) as Categorie[]).map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setCategorie(item);
                      setSelection(null);
                    }}
                    className={`flex-1 rounded-md px-5 py-2 text-sm font-medium transition ${categorie === item ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
                  >
                    {CATEGORIES[item].label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center rounded-lg border border-gray-300 bg-white">
                  <button
                    onClick={() => changerMois(-1)}
                    className="p-2 text-gray-500 hover:bg-gray-50"
                    aria-label="Mois précédent"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="min-w-36 px-2 text-center text-sm font-semibold text-gray-800">
                    {MOIS[mois - 1]} {annee}
                  </span>
                  <button
                    onClick={() => changerMois(1)}
                    className="p-2 text-gray-500 hover:bg-gray-50"
                    aria-label="Mois suivant"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={() => exporterCalendrier("png")}
                  disabled={!!exporting || loading}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <FileImage className="h-4 w-4" /> PNG
                </button>
                <button
                  onClick={() => exporterCalendrier("pdf")}
                  disabled={!!exporting || loading}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Download className="h-4 w-4" /> PDF
                </button>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Portée des modifications
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {appliquerFuturs
                    ? `Les changements seront appliqués à ${MOIS[mois - 1]} ${annee} et au catalogue des mois suivants.`
                    : `Les changements resteront propres à ${MOIS[mois - 1]} ${annee}. Les autres mois ne seront pas modifiés.`}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={appliquerFuturs}
                onClick={() => setAppliquerFuturs((current) => !current)}
                className={`inline-flex min-h-11 shrink-0 items-center gap-3 rounded-xl border px-3 py-2 text-left transition ${
                  appliquerFuturs
                    ? "border-amber-300 bg-amber-50 text-amber-950"
                    : "border-gray-300 bg-white text-gray-700"
                }`}
              >
                <span
                  className={`relative h-6 w-11 rounded-full transition ${
                    appliquerFuturs ? "bg-amber-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                      appliquerFuturs ? "left-6" : "left-1"
                    }`}
                  />
                </span>
                <span className="text-xs font-semibold">
                  {appliquerFuturs
                    ? "Ce mois + mois futurs"
                    : "Ce mois uniquement"}
                </span>
              </button>
            </div>
          </div>

          <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4">
              <div className="rounded-lg bg-gray-100 p-2">
                <CalendarDays className="h-5 w-5 text-gray-700" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">
                  Calendrier mensuel
                </h2>
                <p className="text-xs text-gray-500">
                  Cliquez une première fois pour cocher. Cliquez de nouveau pour
                  gérer le lien et les inscriptions.
                </p>
              </div>
            </div>
            <div className="overflow-x-auto bg-gray-50 p-4">
              {loading ? (
                <div className="flex min-h-80 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <div ref={exportRef}>
                  <ProgrammeCalendar
                    categorie={categorie}
                    annee={annee}
                    mois={mois}
                    activites={activitesAffichees}
                    onDateClick={cocherJour}
                    onRemoveActivity={retirerActivite}
                    onEditActivity={ouvrirEdition}
                    onMoveActivity={deplacerActivite}
                  />
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {selection && activiteSelectionnee && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4"
          onMouseDown={() => setSelection(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-gray-200 p-6">
              <div>
                <p className="text-sm text-gray-500">
                  {selection.jour} {MOIS[mois - 1]} {annee} ·{" "}
                  {activiteSelectionnee.heures}
                </p>
                <h2 className="mt-1 text-xl font-semibold text-gray-900">
                  {activiteSelectionnee.titre}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {activiteSelectionnee.lieu}
                </p>
              </div>
              <button
                onClick={() => setSelection(null)}
                className="rounded-md p-2 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-5 p-6">
              {!evenementSelectionne ? (
                <>
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-700">
                      Grades autorisés
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {GRADES.map((grade) => (
                        <button
                          key={grade}
                          onClick={() =>
                            setGrades((current) =>
                              current.includes(grade)
                                ? current.filter((item) => item !== grade)
                                : [...current, grade],
                            )
                          }
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium ${grades.includes(grade) ? "border-gray-800 bg-gray-800 text-white" : "border-gray-300 bg-white text-gray-600"}`}
                        >
                          {grades.includes(grade) ? "✓ " : ""}
                          {grade}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <h3 className="font-medium text-gray-900">
                      Créer le lien d'inscription
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Les membres pourront ouvrir le lien et s'inscrire avec
                      leur nom sacré.
                    </p>
                    <button
                      onClick={creerLien}
                      disabled={creatingLink || grades.length === 0}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-50"
                    >
                      {creatingLink ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Link2 className="h-4 w-4" />
                      )}{" "}
                      Créer le lien public
                    </button>
                  </div>
                  <button
                    onClick={retirerDate}
                    className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" /> Retirer cette date du
                    calendrier
                  </button>
                </>
              ) : (
                <>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Lien public
                    </p>
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                      <div className="min-w-0 flex-1 truncate rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700">
                        {typeof window !== "undefined"
                          ? window.location.origin
                          : ""}
                        /traversee/{evenementSelectionne.lienUnique}
                      </div>
                      <button
                        onClick={copierLien}
                        className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Clipboard className="h-4 w-4" /> Copier
                      </button>
                      <a
                        href={`/traversee/${evenementSelectionne.lienUnique}`}
                        target="_blank"
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-800 px-3 py-2 text-sm text-white"
                      >
                        <ExternalLink className="h-4 w-4" /> Ouvrir
                      </a>
                    </div>
                  </div>
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Pointage des présences
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          Ce lien est réservé au pointage de cet événement.
                        </p>
                      </div>
                      <a
                        href={`/admin/presences/evenement/${evenementSelectionne.id}`}
                        className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-gray-900 px-4 text-sm font-semibold text-white hover:bg-gray-800"
                      >
                        <ScanLine className="h-4 w-4" />
                        Ouvrir le pointage
                      </a>
                    </div>
                  </div>
                  <div>
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Membres inscrits
                        </h3>
                        <p className="text-sm text-gray-500">
                          {evenementSelectionne.inscrits} inscription(s)
                        </p>
                      </div>
                      {inscrits.length > 0 && (
                        <button
                          onClick={exporterInscriptions}
                          className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Download className="h-4 w-4" /> Exporter PDF
                        </button>
                      )}
                    </div>
                    <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <p className="text-sm font-medium text-gray-800">
                        Inscrire un membre
                      </p>
                      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                        <input
                          value={rechercheMembre}
                          onChange={(event) => {
                            setRechercheMembre(event.target.value);
                            setMembresTrouves([]);
                          }}
                          onKeyDown={(event) =>
                            event.key === "Enter" && rechercherMembre()
                          }
                          placeholder="Nom, prénom ou nom sacré"
                          className="h-10 min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-gray-500"
                        />
                        <button
                          onClick={rechercherMembre}
                          disabled={
                            rechercheMembre.trim().length < 2 ||
                            rechercheEnCours
                          }
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-gray-800 px-4 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-50"
                        >
                          {rechercheEnCours ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Search className="h-4 w-4" />
                          )}{" "}
                          Rechercher
                        </button>
                      </div>
                      {membresTrouves.length > 0 && (
                        <div className="mt-3 max-h-48 space-y-1.5 overflow-y-auto">
                          {membresTrouves.map((membre) => (
                            <div
                              key={membre.id}
                              className="flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-white px-3 py-2"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-gray-900">
                                  {membre.prenoms} {membre.nom}{" "}
                                  {membre.nomSacre
                                    ? `(${membre.nomSacre})`
                                    : ""}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {membre.grade}
                                </p>
                              </div>
                              <button
                                onClick={() => inscrireMembre(membre)}
                                disabled={inscriptionEnCours === membre.id}
                                className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-gray-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-900 disabled:opacity-50"
                              >
                                {inscriptionEnCours === membre.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <UserPlus className="h-3.5 w-3.5" />
                                )}{" "}
                                Inscrire
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {!rechercheEnCours &&
                        rechercheMembre.trim().length >= 2 &&
                        membresTrouves.length === 0 && (
                          <p className="mt-3 text-xs text-gray-500">
                            Lancez la recherche pour afficher les membres
                            disponibles.
                          </p>
                        )}
                    </div>
                    {loadingInscrits ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                      </div>
                    ) : inscrits.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-gray-300 py-8 text-center">
                        <Users className="mx-auto h-8 w-8 text-gray-300" />
                        <p className="mt-2 text-sm text-gray-500">
                          Aucun membre inscrit
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-[700px] w-full text-sm">
                          <thead className="bg-gray-50 text-left text-gray-600">
                            <tr>
                              <th className="px-3 py-2">Membre</th>
                              <th className="px-3 py-2">Nom sacré</th>
                              <th className="px-3 py-2">Grade</th>
                              <th className="px-3 py-2">Téléphone</th>
                              <th className="px-3 py-2 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {inscrits.map((item) => (
                              <tr key={item.id}>
                                <td className="px-3 py-2 font-medium text-gray-900">
                                  {item.membre.prenoms} {item.membre.nom}
                                </td>
                                <td className="px-3 py-2 text-gray-600">
                                  {item.membre.nomSacre || "—"}
                                </td>
                                <td className="px-3 py-2 text-gray-600">
                                  {item.membre.grade}
                                </td>
                                <td className="px-3 py-2 text-gray-600">
                                  {item.membre.telephoneWhatsapp}
                                </td>
                                <td className="px-3 py-2 text-right">
                                  <button
                                    onClick={() => retirerInscription(item)}
                                    disabled={retraitEnCours === item.id}
                                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                                  >
                                    {retraitEnCours === item.id ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-3.5 w-3.5" />
                                    )}{" "}
                                    Retirer
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={supprimerLien}
                    className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" /> Supprimer le lien et ses
                    inscriptions
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4"
          onMouseDown={() => setShowAdd(false)}
        >
          <div
            className="w-full max-w-md rounded-lg bg-white shadow-xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-gray-200 p-6">
              <div>
                <p className="text-sm text-gray-500">{configuration.label}</p>
                <h2 className="mt-1 text-xl font-semibold text-gray-900">
                  Nouvelle activité · {MOIS[mois - 1]} {annee}
                </h2>
              </div>
              <button
                onClick={() => setShowAdd(false)}
                className="rounded-md p-2 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={ajouterActivite} className="space-y-4 p-6">
              <label className="block text-sm font-medium text-gray-700">
                Activité
                <input
                  required
                  value={form.titre}
                  onChange={(e) => setForm({ ...form, titre: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Description
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={3}
                  placeholder="Informations utiles sur cette activité"
                  className="mt-1 w-full resize-none rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm font-medium text-gray-700">
                  Heures
                  <input
                    required
                    value={form.heures}
                    onChange={(e) =>
                      setForm({ ...form, heures: e.target.value })
                    }
                    placeholder="19h-21h"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
                  />
                </label>
                <label className="block text-sm font-medium text-gray-700">
                  Lieu
                  <input
                    required
                    value={form.lieu}
                    onChange={(e) => setForm({ ...form, lieu: e.target.value })}
                    placeholder={categorie === "TEMPLE" ? "Temple" : "École"}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
                  />
                </label>
              </div>
              <div
                className={`rounded-lg border px-3 py-2.5 text-xs ${
                  appliquerFuturs
                    ? "border-amber-200 bg-amber-50 text-amber-900"
                    : "border-gray-200 bg-gray-50 text-gray-600"
                }`}
              >
                {appliquerFuturs
                  ? "Cette activité sera également ajoutée au catalogue utilisé pour les mois futurs."
                  : "Cette activité sera ajoutée à ce mois uniquement."}
              </div>
              <button
                disabled={adding}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-gray-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-50"
              >
                {adding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}{" "}
                Ajouter l'activité
              </button>
            </form>
          </div>
        </div>
      )}

      {activiteEnEdition && (
        <div
          className="fixed inset-0 z-[75] flex items-center justify-center bg-black/40 p-4"
          onMouseDown={() => setActiviteEnEdition(null)}
        >
          <div
            className="w-full max-w-md rounded-lg bg-white shadow-xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-gray-200 p-6">
              <div>
                <p className="text-sm text-gray-500">
                  {MOIS[mois - 1]} {annee}
                </p>
                <h2 className="mt-1 text-xl font-semibold text-gray-900">
                  Modifier l’activité
                </h2>
              </div>
              <button
                onClick={() => setActiviteEnEdition(null)}
                className="rounded-md p-2 text-gray-400 hover:bg-gray-100"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={modifierActivite} className="space-y-4 p-6">
              <label className="block text-sm font-medium text-gray-700">
                Activité
                <input
                  required
                  value={editForm.titre}
                  onChange={(event) =>
                    setEditForm({ ...editForm, titre: event.target.value })
                  }
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Description
                <textarea
                  value={editForm.description}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      description: event.target.value,
                    })
                  }
                  rows={3}
                  className="mt-1 w-full resize-none rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm font-medium text-gray-700">
                  Heures
                  <input
                    required
                    value={editForm.heures}
                    onChange={(event) =>
                      setEditForm({ ...editForm, heures: event.target.value })
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
                  />
                </label>
                <label className="block text-sm font-medium text-gray-700">
                  Lieu
                  <input
                    required
                    value={editForm.lieu}
                    onChange={(event) =>
                      setEditForm({ ...editForm, lieu: event.target.value })
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-500"
                  />
                </label>
              </div>
              <div
                className={`rounded-lg border px-3 py-2.5 text-xs ${
                  appliquerFuturs
                    ? "border-amber-200 bg-amber-50 text-amber-900"
                    : "border-gray-200 bg-gray-50 text-gray-600"
                }`}
              >
                {appliquerFuturs
                  ? "Le catalogue et les mois futurs reprendront aussi ces nouvelles informations."
                  : "Seul ce mois sera modifié."}
              </div>
              <button
                disabled={editing}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-gray-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-50"
              >
                {editing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Pencil className="h-4 w-4" />
                )}
                Enregistrer les modifications
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
