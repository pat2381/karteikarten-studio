import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Deck } from "@/types";

// ── PUT /api/decks/:id ── full replace of a deck ────────────────────────────
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  // Ownership check
  const existing = await prisma.deck.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  if (existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 });
  }

  const body: Deck = await req.json();

  // Delete-and-recreate all categories & cards in one transaction
  const updated = await prisma.$transaction(async (tx) => {
    await tx.card.deleteMany({ where: { deckId: params.id } });
    await tx.category.deleteMany({ where: { deckId: params.id } });

    return tx.deck.update({
      where: { id: params.id },
      data: {
        name: body.name,
        categories: {
          create: body.categories.map((c) => ({
            id: c.id,
            name: c.name,
            color: c.color,
          })),
        },
        cards: {
          create: body.cards.map((c) => ({
            id: c.id,
            question: c.question,
            answer: c.answer,
            hint: c.hint ?? null,
            detail: c.detail ?? null,
            categoryId: c.categoryId,
            isImportant: c.isImportant,
            isExam: c.isExam,
          })),
        },
      },
      include: { categories: true, cards: true },
    });
  });

  const result: Deck = {
    id: updated.id,
    name: updated.name,
    createdAt: Number(updated.createdAt),
    categories: updated.categories.map((c) => ({ id: c.id, name: c.name, color: c.color })),
    cards: updated.cards.map((c) => ({
      id: c.id,
      question: c.question,
      answer: c.answer,
      hint: c.hint ?? undefined,
      detail: c.detail ?? undefined,
      categoryId: c.categoryId,
      isImportant: c.isImportant,
      isExam: c.isExam,
    })),
  };

  return NextResponse.json(result);
}

// ── DELETE /api/decks/:id ────────────────────────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const existing = await prisma.deck.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  if (existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Keine Berechtigung." }, { status: 403 });
  }

  await prisma.deck.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
