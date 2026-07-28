import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { formatAppDateYMD, parseAppDatetimeLocal } from "@/lib/datetime";
import { slugify } from "@/lib/utils";
import { getAuthorizedAdmin } from "@/lib/security/admin";
import { isSameOrigin, safeJson, safeText } from "@/lib/security/http";

const CATEGORIES = ["TEMPLE", "ECOLE"] as const;
type Categorie = (typeof CATEGORIES)[number];

const ACTIVITES_PAR_DEFAUT = [
  {
    categorie: "TEMPLE",
    titre: "Initiation degré Constructeur",
    heures: "9h-12h",
    lieu: "Temple",
    ordre: 1,
  },
  {
    categorie: "TEMPLE",
    titre: "Consécration des Membres du Bureau Exécutif",
    heures: "9h-12h",
    lieu: "Temple",
    ordre: 2,
  },
  {
    categorie: "TEMPLE",
    titre: "Traversée degré Constructeur",
    heures: "9h-12h",
    lieu: "Temple",
    ordre: 3,
  },
  {
    categorie: "TEMPLE",
    titre: "Traversée degré Navigateur",
    heures: "9h-12h",
    lieu: "Temple",
    ordre: 4,
  },
  {
    categorie: "TEMPLE",
    titre: "Traversée initiation Explorateur",
    heures: "À préciser",
    lieu: "Temple",
    ordre: 5,
  },
  {
    categorie: "TEMPLE",
    titre: "Traversée ISALEM",
    heures: "9h-15h",
    lieu: "Temple",
    ordre: 6,
  },
  {
    categorie: "ECOLE",
    titre: "Travaux d'expansion de l'Égrégore d'ETU",
    heures: "19h-21h",
    lieu: "École",
    ordre: 1,
  },
  {
    categorie: "ECOLE",
    titre: "Cours de Philosophie Ésotérique",
    heures: "19h-21h",
    lieu: "École",
    ordre: 2,
  },
  {
    categorie: "ECOLE",
    titre: "Cours d'Évangiles Constructeurs",
    heures: "19h-21h",
    lieu: "École",
    ordre: 3,
  },
  {
    categorie: "ECOLE",
    titre: "Cours d'Évangiles Navigateurs",
    heures: "19h-21h",
    lieu: "École",
    ordre: 4,
  },
  {
    categorie: "ECOLE",
    titre: "Instruction de Grade Constructeurs",
    heures: "19h-21h",
    lieu: "École",
    ordre: 5,
  },
  {
    categorie: "ECOLE",
    titre: "Instruction de Grade Navigateurs",
    heures: "19h-21h",
    lieu: "École",
    ordre: 6,
  },
  {
    categorie: "ECOLE",
    titre: "Instruction des Explorateurs",
    heures: "19h-21h",
    lieu: "École",
    ordre: 7,
  },
  {
    categorie: "ECOLE",
    titre: "Cours d'Explorateurs en ligne",
    heures: "21h-23h",
    lieu: "En ligne",
    ordre: 8,
  },
] as const;

const TOUS_LES_GRADES = [
  "Explorateur",
  "Constructeur",
  "Navigateur",
  "Alchimiste",
];

function moisValide(annee: number, mois: number) {
  return (
    Number.isInteger(annee) &&
    annee >= 2020 &&
    annee <= 2100 &&
    Number.isInteger(mois) &&
    mois >= 1 &&
    mois <= 12
  );
}

function categorieValide(value: unknown): value is Categorie {
  return typeof value === "string" && CATEGORIES.includes(value as Categorie);
}

function periode(annee: number, mois: number) {
  return annee * 12 + mois;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function heureDebut(heures: string) {
  const match = heures.match(/(\d{1,2})h(?:(\d{2}))?/i);
  return match ? `${pad(Number(match[1]))}:${match[2] ?? "00"}` : "12:00";
}

function limitesMois(annee: number, mois: number) {
  const debut = parseAppDatetimeLocal(`${annee}-${pad(mois)}-01T00:00`);
  const suivant =
    mois === 12 ? { annee: annee + 1, mois: 1 } : { annee, mois: mois + 1 };
  const fin = parseAppDatetimeLocal(
    `${suivant.annee}-${pad(suivant.mois)}-01T00:00`,
  );
  return { debut, fin };
}

function estApres(annee: number, mois: number, reference: number) {
  return periode(annee, mois) > reference;
}

async function initialiserCatalogue() {
  if ((await db.activiteProgramme.count()) > 0) return;
  await db.$transaction(
    ACTIVITES_PAR_DEFAUT.map((activite) =>
      db.activiteProgramme.create({
        data: { ...activite, catalogueDepuis: 0 },
      }),
    ),
  );
}

async function initialiserMois(annee: number, mois: number) {
  await initialiserCatalogue();
  const clePeriode = periode(annee, mois);
  const [catalogue, existantes] = await Promise.all([
    db.activiteProgramme.findMany({
      where: {
        actif: true,
        catalogueDepuis: { lte: clePeriode },
        OR: [
          { catalogueJusqua: null },
          { catalogueJusqua: { gte: clePeriode } },
        ],
      },
    }),
    db.programmationMensuelle.findMany({
      where: { annee, mois },
      include: { activite: true },
    }),
  ]);

  const parActivite = new Map(
    existantes.map((item) => [item.activiteId, item]),
  );
  const operations: Prisma.PrismaPromise<unknown>[] = [];

  for (const programmation of existantes) {
    if (
      programmation.titre === null ||
      programmation.description === null ||
      programmation.heures === null ||
      programmation.lieu === null ||
      programmation.ordre === null
    ) {
      operations.push(
        db.programmationMensuelle.update({
          where: { id: programmation.id },
          data: {
            titre: programmation.titre ?? programmation.activite.titre,
            description:
              programmation.description ??
              programmation.activite.description ??
              "",
            heures: programmation.heures ?? programmation.activite.heures,
            lieu: programmation.lieu ?? programmation.activite.lieu,
            ordre: programmation.ordre ?? programmation.activite.ordre,
          },
        }),
      );
    }
  }

  for (const activite of catalogue) {
    const programmation = parActivite.get(activite.id);
    if (!programmation) {
      operations.push(
        db.programmationMensuelle.create({
          data: {
            activiteId: activite.id,
            annee,
            mois,
            jours: [],
            titre: activite.titre,
            description: activite.description,
            heures: activite.heures,
            lieu: activite.lieu,
            ordre: activite.ordre,
          },
        }),
      );
    }
  }

  if (operations.length > 0) await db.$transaction(operations);
}

async function slugDisponible(base: string) {
  let candidat = base;
  let suffixe = 2;
  while (
    await db.traversee.findUnique({
      where: { lienUnique: candidat },
      select: { id: true },
    })
  ) {
    candidat = `${base}-${suffixe++}`;
  }
  return candidat;
}

async function misesAJourEvenements(
  activiteId: string,
  debut: Date,
  fin: Date | undefined,
  valeurs: {
    titre: string;
    description: string | null;
    heures: string;
    lieu: string;
  },
) {
  const evenements = await db.traversee.findMany({
    where: {
      activiteProgrammeId: activiteId,
      date: fin ? { gte: debut, lt: fin } : { gte: debut },
    },
    select: { id: true, date: true },
  });
  return evenements.map((evenement) => {
    const dateYmd = formatAppDateYMD(evenement.date);
    return db.traversee.update({
      where: { id: evenement.id },
      data: {
        titre: valeurs.titre,
        description:
          valeurs.description || `${valeurs.titre} · ${valeurs.heures}`,
        lieu: valeurs.lieu,
        date: parseAppDatetimeLocal(`${dateYmd}T${heureDebut(valeurs.heures)}`),
      },
    });
  });
}

export async function GET(request: NextRequest) {
  if (!(await getAuthorizedAdmin(request))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const annee = Number(request.nextUrl.searchParams.get("annee"));
  const mois = Number(request.nextUrl.searchParams.get("mois"));
  if (!moisValide(annee, mois)) {
    return NextResponse.json(
      { error: "Mois ou année invalide" },
      { status: 400 },
    );
  }

  try {
    await initialiserMois(annee, mois);
    const { debut, fin } = limitesMois(annee, mois);
    const programmations = await db.programmationMensuelle.findMany({
      where: { annee, mois, visible: true },
      orderBy: [{ ordre: "asc" }, { createdAt: "asc" }],
      include: {
        activite: {
          include: {
            evenements: {
              where: { date: { gte: debut, lt: fin } },
              select: {
                id: true,
                date: true,
                lienUnique: true,
                gradesAutorises: true,
                _count: { select: { inscriptions: true } },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: programmations.map((programmation) => ({
        id: programmation.activite.id,
        programmationId: programmation.id,
        categorie: programmation.activite.categorie,
        titre: programmation.titre ?? programmation.activite.titre,
        description: programmation.description,
        heures: programmation.heures ?? programmation.activite.heures,
        lieu: programmation.lieu ?? programmation.activite.lieu,
        ordre: programmation.ordre ?? programmation.activite.ordre,
        jours: programmation.jours,
        specifique: programmation.specifique,
        evenements: programmation.activite.evenements.map((evenement) => ({
          id: evenement.id,
          jour: Number(formatAppDateYMD(evenement.date).slice(-2)),
          lienUnique: evenement.lienUnique,
          gradesAutorises: evenement.gradesAutorises,
          inscrits: evenement._count.inscriptions,
        })),
      })),
    });
  } catch (error) {
    console.error("GET /api/admin/programmes-mensuels:", error);
    return NextResponse.json(
      { error: "Impossible de charger le programme mensuel" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  if (!(await getAuthorizedAdmin(request))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { error: "Origine non autorisée" },
      { status: 403 },
    );
  }

  try {
    const body = await safeJson<Record<string, unknown>>(request, 16_384);

    if (body.action === "creer-lien") {
      const activiteId = safeText(body.activiteId, 120);
      const annee = Number(body.annee);
      const mois = Number(body.mois);
      const jour = Number(body.jour);
      const maxJour = new Date(annee, mois, 0).getDate();
      if (
        !activiteId ||
        !moisValide(annee, mois) ||
        !Number.isInteger(jour) ||
        jour < 1 ||
        jour > maxJour
      ) {
        return NextResponse.json(
          { error: "Date ou activité invalide" },
          { status: 400 },
        );
      }

      await initialiserMois(annee, mois);
      const programmation = await db.programmationMensuelle.findUnique({
        where: { activiteId_annee_mois: { activiteId, annee, mois } },
        include: { activite: true },
      });
      if (!programmation?.visible) {
        return NextResponse.json(
          { error: "Activité introuvable pour ce mois" },
          { status: 404 },
        );
      }

      const titre = programmation.titre ?? programmation.activite.titre;
      const description =
        programmation.description ??
        programmation.activite.description ??
        `${titre} · ${programmation.heures ?? programmation.activite.heures}`;
      const heures = programmation.heures ?? programmation.activite.heures;
      const lieu = programmation.lieu ?? programmation.activite.lieu;
      const dateYmd = `${annee}-${pad(mois)}-${pad(jour)}`;
      const debutJour = parseAppDatetimeLocal(`${dateYmd}T00:00`);
      const finJour = parseAppDatetimeLocal(`${dateYmd}T23:59`);
      const existant = await db.traversee.findFirst({
        where: {
          activiteProgrammeId: activiteId,
          date: { gte: debutJour, lte: finJour },
        },
        include: { _count: { select: { inscriptions: true } } },
      });
      if (existant) return NextResponse.json({ success: true, data: existant });

      const baseSlug = `${slugify(titre)}-${dateYmd}`;
      const lienUnique = await slugDisponible(baseSlug);
      const grades =
        Array.isArray(body.gradesAutorises) && body.gradesAutorises.length > 0
          ? body.gradesAutorises.filter(
              (grade): grade is string =>
                typeof grade === "string" && TOUS_LES_GRADES.includes(grade),
            )
          : TOUS_LES_GRADES;

      const evenement = await db.traversee.create({
        data: {
          type:
            programmation.activite.categorie === "TEMPLE"
              ? "Programme du Temple"
              : "Programme pédagogique",
          titre,
          description,
          date: parseAppDatetimeLocal(`${dateYmd}T${heureDebut(heures)}`),
          lieu,
          lienUnique,
          gradesAutorises: grades.length > 0 ? grades : TOUS_LES_GRADES,
          activiteProgrammeId: activiteId,
        },
        include: { _count: { select: { inscriptions: true } } },
      });

      return NextResponse.json(
        { success: true, data: evenement },
        { status: 201 },
      );
    }

    const categorie = body.categorie;
    const titre = safeText(body.titre, 180);
    const description = safeText(body.description, 1_000) ?? "";
    const heures = safeText(body.heures, 80);
    const lieu = safeText(body.lieu, 120);
    const annee = Number(body.annee);
    const mois = Number(body.mois);
    const appliquerFuturs = body.appliquerFuturs === true;
    if (
      !categorieValide(categorie) ||
      !titre ||
      !heures ||
      !lieu ||
      !moisValide(annee, mois)
    ) {
      return NextResponse.json(
        {
          error: "Catégorie, activité, heures, lieu et mois sont obligatoires",
        },
        { status: 400 },
      );
    }

    await initialiserMois(annee, mois);
    const ordreMax = await db.programmationMensuelle.aggregate({
      where: { annee, mois, visible: true, activite: { categorie } },
      _max: { ordre: true },
    });
    const ordre = (ordreMax._max.ordre ?? 0) + 1;
    const clePeriode = periode(annee, mois);
    const moisFuturs = appliquerFuturs
      ? await db.programmationMensuelle.findMany({
          where: {
            OR: [{ annee: { gt: annee } }, { annee, mois: { gt: mois } }],
          },
          distinct: ["annee", "mois"],
          select: { annee: true, mois: true },
        })
      : [];

    const titreInterne = appliquerFuturs
      ? titre
      : `${titre} · spécifique ${annee}-${pad(mois)} · ${Date.now()}`;
    const activite = await db.activiteProgramme.create({
      data: {
        categorie,
        titre: titreInterne,
        description,
        heures,
        lieu,
        ordre,
        actif: appliquerFuturs,
        catalogueDepuis: appliquerFuturs ? clePeriode : 0,
        programmations: {
          create: [
            {
              annee,
              mois,
              jours: [],
              titre,
              description,
              heures,
              lieu,
              ordre,
              specifique: !appliquerFuturs,
            },
            ...moisFuturs.map((periodeFuture) => ({
              annee: periodeFuture.annee,
              mois: periodeFuture.mois,
              jours: [],
              titre,
              description,
              heures,
              lieu,
              ordre,
            })),
          ],
        },
      },
      include: {
        programmations: { where: { annee, mois } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: activite.id,
          programmationId: activite.programmations[0].id,
          categorie,
          titre,
          description,
          heures,
          lieu,
          ordre,
          jours: [],
          specifique: !appliquerFuturs,
          evenements: [],
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/admin/programmes-mensuels:", error);
    return NextResponse.json(
      { error: "L'opération n'a pas pu être effectuée" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  if (!(await getAuthorizedAdmin(request))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { error: "Origine non autorisée" },
      { status: 403 },
    );
  }

  try {
    const body = await safeJson<Record<string, unknown>>(request, 32_768);
    const annee = Number(body.annee);
    const mois = Number(body.mois);
    if (!moisValide(annee, mois)) {
      return NextResponse.json(
        { error: "Mois ou année invalide" },
        { status: 400 },
      );
    }
    await initialiserMois(annee, mois);

    if (body.action === "modifier-activite") {
      const activiteId = safeText(body.activiteId, 120);
      const titre = safeText(body.titre, 180);
      const description = safeText(body.description, 1_000) ?? "";
      const heures = safeText(body.heures, 80);
      const lieu = safeText(body.lieu, 120);
      const appliquerFuturs = body.appliquerFuturs === true;
      if (!activiteId || !titre || !heures || !lieu) {
        return NextResponse.json(
          { error: "Activité, heures et lieu sont obligatoires" },
          { status: 400 },
        );
      }

      const programmation = await db.programmationMensuelle.findUnique({
        where: { activiteId_annee_mois: { activiteId, annee, mois } },
        include: { activite: true },
      });
      if (!programmation?.visible) {
        return NextResponse.json(
          { error: "Activité introuvable pour ce mois" },
          { status: 404 },
        );
      }

      const clePeriode = periode(annee, mois);
      const { debut, fin } = limitesMois(annee, mois);
      const operations: Prisma.PrismaPromise<unknown>[] = [
        db.programmationMensuelle.update({
          where: { id: programmation.id },
          data: { titre, description, heures, lieu },
        }),
        ...(await misesAJourEvenements(activiteId, debut, fin, {
          titre,
          description,
          heures,
          lieu,
        })),
      ];

      if (appliquerFuturs) {
        const [programmationsFutures, misesAJourFutures] = await Promise.all([
          db.programmationMensuelle.findMany({
            where: { activiteId },
            select: { id: true, annee: true, mois: true },
          }),
          misesAJourEvenements(activiteId, fin, undefined, {
            titre,
            description,
            heures,
            lieu,
          }),
        ]);
        operations.push(
          db.activiteProgramme.update({
            where: { id: activiteId },
            data: {
              titre,
              description,
              heures,
              lieu,
              actif: true,
              catalogueDepuis: programmation.activite.actif
                ? programmation.activite.catalogueDepuis
                : clePeriode,
              catalogueJusqua: null,
            },
          }),
          ...programmationsFutures
            .filter((item) => estApres(item.annee, item.mois, clePeriode))
            .map((item) =>
              db.programmationMensuelle.update({
                where: { id: item.id },
                data: {
                  titre,
                  description,
                  heures,
                  lieu,
                  visible: true,
                  specifique: false,
                },
              }),
            ),
          ...misesAJourFutures,
        );
      }

      await db.$transaction(operations);
      return NextResponse.json({ success: true });
    }

    if (body.action === "reordonner") {
      const activiteIds = Array.isArray(body.activiteIds)
        ? body.activiteIds
            .map((id) => safeText(id, 120))
            .filter((id): id is string => Boolean(id))
        : [];
      const appliquerFuturs = body.appliquerFuturs === true;
      if (activiteIds.length === 0) {
        return NextResponse.json({ error: "Ordre invalide" }, { status: 400 });
      }

      const programmations = await db.programmationMensuelle.findMany({
        where: { annee, mois, activiteId: { in: activiteIds }, visible: true },
        include: { activite: true },
      });
      if (programmations.length !== activiteIds.length) {
        return NextResponse.json(
          { error: "Certaines activités sont introuvables" },
          { status: 404 },
        );
      }

      const clePeriode = periode(annee, mois);
      const operations: Prisma.PrismaPromise<unknown>[] = programmations.map(
        (programmation) =>
          db.programmationMensuelle.update({
            where: { id: programmation.id },
            data: { ordre: activiteIds.indexOf(programmation.activiteId) + 1 },
          }),
      );

      if (appliquerFuturs) {
        const futures = await db.programmationMensuelle.findMany({
          where: { activiteId: { in: activiteIds } },
          select: { id: true, activiteId: true, annee: true, mois: true },
        });
        operations.push(
          ...programmations
            .filter((item) => item.activite.actif)
            .map((item) =>
              db.activiteProgramme.update({
                where: { id: item.activiteId },
                data: { ordre: activiteIds.indexOf(item.activiteId) + 1 },
              }),
            ),
          ...futures
            .filter((item) => estApres(item.annee, item.mois, clePeriode))
            .map((item) =>
              db.programmationMensuelle.update({
                where: { id: item.id },
                data: { ordre: activiteIds.indexOf(item.activiteId) + 1 },
              }),
            ),
        );
      }

      await db.$transaction(operations);
      return NextResponse.json({ success: true });
    }

    const programmations = Array.isArray(body.programmations)
      ? body.programmations
      : [];
    const maxJour = new Date(annee, mois, 0).getDate();
    const existantes = await db.programmationMensuelle.findMany({
      where: { annee, mois },
      select: { id: true, activiteId: true },
    });
    const parActivite = new Map(
      existantes.map((item) => [item.activiteId, item]),
    );
    const operations = programmations.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const valeur = item as Record<string, unknown>;
      const activiteId = safeText(valeur.activiteId, 120);
      if (!activiteId) return [];
      const programmation = parActivite.get(activiteId);
      if (!programmation) return [];
      const jours = Array.isArray(valeur.jours)
        ? [
            ...new Set(
              valeur.jours
                .map(Number)
                .filter(
                  (jour) =>
                    Number.isInteger(jour) && jour >= 1 && jour <= maxJour,
                ),
            ),
          ].sort((a, b) => a - b)
        : [];
      return [
        db.programmationMensuelle.update({
          where: { id: programmation.id },
          data: { jours },
        }),
      ];
    });
    if (operations.length > 0) await db.$transaction(operations);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/admin/programmes-mensuels:", error);
    return NextResponse.json(
      { error: "Impossible d'enregistrer le programme" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await getAuthorizedAdmin(request))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { error: "Origine non autorisée" },
      { status: 403 },
    );
  }

  const evenementId = safeText(
    request.nextUrl.searchParams.get("evenementId"),
    120,
  );
  const activiteId = safeText(
    request.nextUrl.searchParams.get("activiteId"),
    120,
  );
  const annee = Number(request.nextUrl.searchParams.get("annee"));
  const mois = Number(request.nextUrl.searchParams.get("mois"));
  const appliquerFuturs =
    request.nextUrl.searchParams.get("appliquerFuturs") === "1";

  try {
    if (evenementId) {
      await db.traversee.delete({ where: { id: evenementId } });
      return NextResponse.json({ success: true });
    }
    if (!activiteId || !moisValide(annee, mois)) {
      return NextResponse.json(
        { error: "Activité ou mois manquant" },
        { status: 400 },
      );
    }

    const programmation = await db.programmationMensuelle.findUnique({
      where: { activiteId_annee_mois: { activiteId, annee, mois } },
      include: { activite: true },
    });
    if (!programmation?.visible) {
      return NextResponse.json(
        { error: "Activité introuvable pour ce mois" },
        { status: 404 },
      );
    }

    const clePeriode = periode(annee, mois);
    const { debut, fin } = limitesMois(annee, mois);
    const liensActifs = await db.traversee.count({
      where: {
        activiteProgrammeId: activiteId,
        date: appliquerFuturs ? { gte: debut } : { gte: debut, lt: fin },
      },
    });
    if (liensActifs > 0) {
      return NextResponse.json(
        {
          error:
            "Supprimez d'abord les liens d'inscription associés à cette activité",
        },
        { status: 409 },
      );
    }

    const operations: Prisma.PrismaPromise<unknown>[] = [
      db.programmationMensuelle.update({
        where: { id: programmation.id },
        data: { visible: false, jours: [] },
      }),
    ];
    if (appliquerFuturs) {
      const futures = await db.programmationMensuelle.findMany({
        where: { activiteId },
        select: { id: true, annee: true, mois: true },
      });
      operations.push(
        db.activiteProgramme.update({
          where: { id: activiteId },
          data: { catalogueJusqua: clePeriode - 1 },
        }),
        ...futures
          .filter((item) => estApres(item.annee, item.mois, clePeriode))
          .map((item) =>
            db.programmationMensuelle.update({
              where: { id: item.id },
              data: { visible: false, jours: [] },
            }),
          ),
      );
    }
    await db.$transaction(operations);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/programmes-mensuels:", error);
    return NextResponse.json(
      { error: "Suppression impossible" },
      { status: 500 },
    );
  }
}
