import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Deck } from "@/types";

// ── GET /api/decks ── return all decks for the current user ─────────────────
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const rows = await prisma.deck.findMany({
    where: { userId: session.user.id },
    include: { categories: true, cards: true },
    orderBy: { createdAt: "asc" },
  });

  // Map Prisma rows → frontend Deck shape (BigInt → number)
  const decks: Deck[] = rows.map((d) => ({
    id: d.id,
    name: d.name,
    createdAt: Number(d.createdAt),
    categories: d.categories.map((c) => ({ id: c.id, name: c.name, color: c.color })),
    cards: d.cards.map((c) => ({
      id: c.id,
      question: c.question,
      answer: c.answer,
      hint: c.hint ?? undefined,
      detail: c.detail ?? undefined,
      categoryId: c.categoryId,
      isImportant: c.isImportant,
      isExam: c.isExam,
    })),
  }));

  return NextResponse.json(decks);
}

// ── POST /api/decks ── create a new deck ────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const body: Deck = await req.json();

  const deck = await prisma.deck.create({
    data: {
      id: body.id,
      name: body.name,
      createdAt: BigInt(body.createdAt),
      userId: session.user.id,
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

  const result: Deck = {
    id: deck.id,
    name: deck.name,
    createdAt: Number(deck.createdAt),
    categories: deck.categories.map((c) => ({ id: c.id, name: c.name, color: c.color })),
    cards: deck.cards.map((c) => ({
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

  return NextResponse.json(result, { status: 201 });
}
