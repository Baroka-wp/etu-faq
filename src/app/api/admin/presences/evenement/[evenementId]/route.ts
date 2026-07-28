import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthorizedAdmin } from "@/lib/security/admin";
import { isSameOrigin, safeJson, safeText } from "@/lib/security/http";

function gradeAutorise(grade: string, gradesAutorises: string[]) {
  return (
    grade === "Alchimiste" ||
    gradesAutorises.length === 0 ||
    gradesAutorises.includes(grade)
  );
}

const membreSelect = {
  id: true,
  nom: true,
  prenoms: true,
  nomSacre: true,
  grade: true,
  equipage: true,
  imageUrl: true,
} as const;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ evenementId: string }> },
) {
  if (!(await getAuthorizedAdmin(request))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { evenementId } = await params;
  const evenement = await db.traversee.findUnique({
    where: { id: evenementId },
    select: {
      id: true,
      titre: true,
      date: true,
      lieu: true,
      gradesAutorises: true,
    },
  });
  if (!evenement) {
    return NextResponse.json(
      { error: "Événement introuvable" },
      { status: 404 },
    );
  }

  const recherche = safeText(request.nextUrl.searchParams.get("q"), 120);
  if (recherche) {
    const membres = await db.membre.findMany({
      where: {
        statut: "actif",
        OR: [
          { nom: { contains: recherche, mode: "insensitive" } },
          { prenoms: { contains: recherche, mode: "insensitive" } },
          { nomSacre: { contains: recherche, mode: "insensitive" } },
        ],
      },
      select: {
        ...membreSelect,
        traversees: {
          where: { traverseeId: evenementId },
          select: { id: true, presenceAt: true },
        },
      },
      orderBy: [{ nom: "asc" }, { prenoms: "asc" }],
      take: 30,
    });

    return NextResponse.json({
      success: true,
      data: membres
        .filter((membre) =>
          gradeAutorise(membre.grade, evenement.gradesAutorises),
        )
        .slice(0, 12)
        .map(({ traversees, ...membre }) => ({
          ...membre,
          inscrit: traversees.length > 0,
          presenceAt: traversees[0]?.presenceAt ?? null,
        })),
    });
  }

  const inscriptions = await db.inscriptionTraversee.findMany({
    where: { traverseeId: evenementId },
    select: {
      id: true,
      createdAt: true,
      presenceAt: true,
      membre: { select: membreSelect },
    },
    orderBy: [{ presenceAt: "desc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({
    success: true,
    data: { evenement, inscriptions },
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ evenementId: string }> },
) {
  if (!(await getAuthorizedAdmin(request))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { error: "Origine non autorisée" },
      { status: 403 },
    );
  }

  const { evenementId } = await params;
  const body = await safeJson<Record<string, unknown>>(request, 4_096);
  const membreId = safeText(body.membreId, 120);
  if (!membreId) {
    return NextResponse.json({ error: "Membre requis" }, { status: 400 });
  }

  const [evenement, membre] = await Promise.all([
    db.traversee.findUnique({
      where: { id: evenementId },
      select: { id: true, gradesAutorises: true },
    }),
    db.membre.findFirst({
      where: { id: membreId, statut: "actif" },
      select: membreSelect,
    }),
  ]);

  if (!evenement) {
    return NextResponse.json(
      { error: "Événement introuvable" },
      { status: 404 },
    );
  }
  if (!membre) {
    return NextResponse.json(
      { error: "Membre actif introuvable" },
      { status: 404 },
    );
  }
  if (!gradeAutorise(membre.grade, evenement.gradesAutorises)) {
    return NextResponse.json(
      { error: "Le grade de ce membre n'est pas autorisé pour cet événement" },
      { status: 403 },
    );
  }

  const existante = await db.inscriptionTraversee.findUnique({
    where: {
      traverseeId_membreId: { traverseeId: evenementId, membreId },
    },
    select: { id: true, presenceAt: true },
  });
  if (existante?.presenceAt) {
    return NextResponse.json({
      success: true,
      data: { inscription: existante, membre },
      message: `${membre.prenoms} ${membre.nom} était déjà marqué(e) présent(e)`,
    });
  }

  const presenceAt = new Date();
  const inscription = await db.inscriptionTraversee.upsert({
    where: { traverseeId_membreId: { traverseeId: evenementId, membreId } },
    update: { presenceAt },
    create: { traverseeId: evenementId, membreId, presenceAt },
    select: { id: true, presenceAt: true },
  });

  return NextResponse.json({
    success: true,
    data: { inscription, membre },
    message: `${membre.prenoms} ${membre.nom} est marqué(e) présent(e)`,
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ evenementId: string }> },
) {
  if (!(await getAuthorizedAdmin(request))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { error: "Origine non autorisée" },
      { status: 403 },
    );
  }

  const { evenementId } = await params;
  const membreId = safeText(request.nextUrl.searchParams.get("membreId"), 120);
  if (!membreId) {
    return NextResponse.json({ error: "Membre requis" }, { status: 400 });
  }

  const inscription = await db.inscriptionTraversee.findUnique({
    where: { traverseeId_membreId: { traverseeId: evenementId, membreId } },
    select: { id: true, presenceAt: true },
  });
  if (!inscription?.presenceAt) {
    return NextResponse.json(
      { error: "Présence introuvable" },
      { status: 404 },
    );
  }

  await db.inscriptionTraversee.update({
    where: { id: inscription.id },
    data: { presenceAt: null },
  });

  return NextResponse.json({ success: true });
}
