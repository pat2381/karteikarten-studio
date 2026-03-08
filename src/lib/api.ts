import type { Deck } from "@/types";

// ── Typed client-side fetch helpers (replace localStorage calls in App.tsx) ──

export async function apiGetDecks(): Promise<Deck[]> {
  const res = await fetch("/api/decks");
  if (!res.ok) throw new Error("Decks konnten nicht geladen werden");
  return res.json();
}

export async function apiCreateDeck(deck: Deck): Promise<Deck> {
  const res = await fetch("/api/decks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(deck),
  });
  if (!res.ok) throw new Error("Deck konnte nicht erstellt werden");
  return res.json();
}

export async function apiUpdateDeck(id: string, deck: Deck): Promise<Deck> {
  const res = await fetch(`/api/decks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(deck),
  });
  if (!res.ok) throw new Error("Deck konnte nicht gespeichert werden");
  return res.json();
}

export async function apiDeleteDeck(id: string): Promise<void> {
  const res = await fetch(`/api/decks/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Deck konnte nicht gelöscht werden");
}
