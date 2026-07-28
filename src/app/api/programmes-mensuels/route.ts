import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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

function periode(annee: number, mois: number) {
  return annee * 12 + mois;
}

export async function GET(request: NextRequest) {
  const annee = Number(request.nextUrl.searchParams.get("annee"));
  const mois = Number(request.nextUrl.searchParams.get("mois"));
  if (!moisValide(annee, mois)) {
    return NextResponse.json(
      { error: "Mois ou année invalide" },
      { status: 400 },
    );
  }

  try {
    const programmations = await db.programmationMensuelle.findMany({
      where: { annee, mois, visible: true },
      orderBy: [{ ordre: "asc" }, { createdAt: "asc" }],
      include: { activite: true },
    });

    if (programmations.length > 0) {
      return NextResponse.json({
        success: true,
        data: programmations.map((programmation) => ({
          id: programmation.activiteId,
          categorie: programmation.activite.categorie,
          titre: programmation.titre ?? programmation.activite.titre,
          description: programmation.description,
          heures: programmation.heures ?? programmation.activite.heures,
          lieu: programmation.lieu ?? programmation.activite.lieu,
          ordre: programmation.ordre ?? programmation.activite.ordre,
          jours: programmation.jours,
          evenements: [],
        })),
      });
    }

    const clePeriode = periode(annee, mois);
    const catalogue = await db.activiteProgramme.findMany({
      where: {
        actif: true,
        catalogueDepuis: { lte: clePeriode },
        OR: [
          { catalogueJusqua: null },
          { catalogueJusqua: { gte: clePeriode } },
        ],
      },
      orderBy: [{ categorie: "desc" }, { ordre: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        categorie: true,
        titre: true,
        description: true,
        heures: true,
        lieu: true,
        ordre: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: catalogue.map((activite) => ({
        ...activite,
        jours: [],
        evenements: [],
      })),
    });
  } catch (error) {
    console.error("GET /api/programmes-mensuels:", error);
    return NextResponse.json(
      { error: "Programme indisponible" },
      { status: 500 },
    );
  }
}
