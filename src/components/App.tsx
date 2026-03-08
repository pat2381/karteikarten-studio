"use client";

import { useState, useEffect } from "react";
import { Layers, ChevronLeft, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import type { Deck, Card, ViewType } from "@/types";
import { DEFAULT_CAT, FONT_FAMILY } from "@/constants/colors";
import { S, GLOBAL_CSS } from "@/constants/styles";
import { apiGetDecks, apiCreateDeck, apiUpdateDeck, apiDeleteDeck } from "@/lib/api";
import { uid } from "@/lib/helpers";
import { Toast } from "./ui/Toast";
import { Dashboard } from "./Dashboard";
import { DeckEditor } from "./DeckEditor";
import { PreviewMode } from "./PreviewMode";
import { PrintA6 } from "./PrintA6";
import { CardModal } from "./CardModal";

// ── One-time migration: import existing localStorage decks into the database ─
async function migrateLocalStorage(): Promise<Deck[]> {
  try {
    const raw = localStorage.getItem("fc-decks");
    if (!raw) return [];
    const localDecks: Deck[] = JSON.parse(raw);
    if (!Array.isArray(localDecks) || localDecks.length === 0) return [];

    const uploaded: Deck[] = [];
    for (const deck of localDecks) {
      // Give cards fresh IDs in case of collisions
      const migrated: Deck = {
        ...deck,
        id: uid(),
        cards: deck.cards.map((c) => ({ ...c, id: uid() })),
      };
      const created = await apiCreateDeck(migrated);
      uploaded.push(created);
    }
    localStorage.removeItem("fc-decks");
    return uploaded;
  } catch {
    return [];
  }
}

export function App() {
  const { data: session } = useSession();
  const [view, setView] = useState<ViewType>("dashboard");
  const [decks, setDecks] = useState<Deck[]>([]);
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2000); };
  const activeDeck = decks.find((d) => d.id === activeDeckId) ?? null;
  const getCat = (catId: string) => activeDeck?.categories.find((c) => c.id === catId) ?? DEFAULT_CAT;

  // Load decks from API; migrate localStorage data on first empty load
  useEffect(() => {
    apiGetDecks()
      .then(async (data) => {
        if (data.length === 0) {
          const migrated = await migrateLocalStorage();
          if (migrated.length > 0) {
            setDecks(migrated);
            showToast(`${migrated.length} Deck(s) aus lokalem Speicher importiert`);
            return;
          }
        }
        setDecks(data);
      })
      .catch(() => setDecks([]))
      .finally(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Deck operations ────────────────────────────────────────────────────────

  const updateDeck = async (id: string, updates: Partial<Deck>) => {
    const updated = decks.map((d) => d.id === id ? { ...d, ...updates } : d);
    setDecks(updated); // optimistic update
    const deck = updated.find((d) => d.id === id)!;
    await apiUpdateDeck(id, deck);
  };

  const createDeck = async () => {
    const deck: Deck = {
      id: uid(),
      name: "Neues Kartendeck",
      categories: [{ ...DEFAULT_CAT }],
      cards: [],
      createdAt: Date.now(),
    };
    const created = await apiCreateDeck(deck);
    setDecks((prev) => [...prev, created]);
    setActiveDeckId(created.id);
    setView("editor");
    showToast("Deck erstellt");
  };

  const deleteDeck = async (id: string) => {
    if (!confirm("Deck löschen?")) return;
    setDecks((prev) => prev.filter((d) => d.id !== id));
    if (activeDeckId === id) { setActiveDeckId(null); setView("dashboard"); }
    await apiDeleteDeck(id);
    showToast("Gelöscht");
  };

  const duplicateDeck = async (id: string) => {
    const source = decks.find((d) => d.id === id);
    if (!source) return;
    const copy: Deck = {
      ...JSON.parse(JSON.stringify(source)),
      id: uid(),
      name: `${source.name} (Kopie)`,
      createdAt: Date.now(),
    };
    copy.cards = copy.cards.map((c: Card) => ({ ...c, id: uid() }));
    const created = await apiCreateDeck(copy);
    setDecks((prev) => [...prev, created]);
    showToast("Dupliziert");
  };

  // ── Card operations ────────────────────────────────────────────────────────

  const saveCard = async (card: Card) => {
    if (!activeDeck) return;
    const existing = activeDeck.cards.find((c) => c.id === card.id);
    const updatedCards = existing
      ? activeDeck.cards.map((c) => c.id === card.id ? card : c)
      : [...activeDeck.cards, { ...card, id: uid() }];
    await updateDeck(activeDeckId!, { cards: updatedCards });
    setEditingCard(null);
    showToast("Gespeichert");
  };

  const deleteCard = async (cardId: string) => {
    if (!activeDeck) return;
    await updateDeck(activeDeckId!, { cards: activeDeck.cards.filter((c) => c.id !== cardId) });
    showToast("Gelöscht");
  };

  const startNewCard = () => {
    if (!activeDeck) return;
    setEditingCard({
      id: "",
      question: "",
      answer: "",
      hint: "",
      detail: "",
      categoryId: activeDeck.categories[0]?.id || "allgemein",
      isImportant: false,
      isExam: false,
    });
  };

  if (isLoading) return <div style={S.center}><div style={S.spinner} /></div>;

  return (
    <div style={S.app}>
      <style>{GLOBAL_CSS}</style>
      {toast && <Toast message={toast} />}

      <header style={S.header} className="no-print">
        <div style={S.hInner}>
          {/* Logo / home link */}
          <div
            style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
            onClick={() => { setView("dashboard"); setActiveDeckId(null); }}
          >
            <div style={S.logo}><Layers size={18} color="#f59e0b" /></div>
            <div>
              <h1 style={{ color: "#f1f5f9", fontSize: 17, fontWeight: 700, fontFamily: FONT_FAMILY }}>
                Karteikarten<span style={{ color: "#f59e0b" }}> Studio</span>
              </h1>
              <p style={{ color: "#475569", fontSize: 10 }}>Erstelle & drucke deine Lernkarten</p>
            </div>
          </div>

          {/* Breadcrumb when inside a deck */}
          {activeDeck && view !== "dashboard" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button style={S.ghost} onClick={() => { setView("dashboard"); setActiveDeckId(null); }}>
                <ChevronLeft size={14} /> Decks
              </button>
              <span style={{ color: "#334155" }}>/</span>
              <span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>{activeDeck.name}</span>
              <span style={S.badge}>{activeDeck.cards.length}</span>
            </div>
          )}

          {/* User info + logout */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
            {session?.user?.email && (
              <span style={{ color: "#475569", fontSize: 11, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {session.user.name || session.user.email}
              </span>
            )}
            <button
              style={S.ghost}
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              title="Abmelden"
            >
              <LogOut size={14} /> Abmelden
            </button>
          </div>
        </div>
      </header>

      <main style={S.main}>
        {view === "dashboard" && (
          <Dashboard
            decks={decks}
            onCreate={createDeck}
            onOpen={(id) => { setActiveDeckId(id); setView("editor"); }}
            onDelete={deleteDeck}
            onDuplicate={duplicateDeck}
          />
        )}
        {view === "editor" && activeDeck && (
          <DeckEditor
            deck={activeDeck}
            onUpdateDeck={(u) => updateDeck(activeDeckId!, u)}
            onNewCard={startNewCard}
            onEditCard={(card) => setEditingCard({ ...card })}
            onDeleteCard={deleteCard}
            getCat={getCat}
            onPreview={() => { setPreviewIndex(0); setIsFlipped(false); setView("preview"); }}
            onPrint={() => setView("print")}
          />
        )}
        {view === "preview" && activeDeck && (
          <PreviewMode
            cards={activeDeck.cards}
            currentIndex={previewIndex}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped((f) => !f)}
            onNext={() => { setPreviewIndex((i) => Math.min(i + 1, activeDeck.cards.length - 1)); setIsFlipped(false); }}
            onPrev={() => { setPreviewIndex((i) => Math.max(i - 1, 0)); setIsFlipped(false); }}
            onBack={() => setView("editor")}
            getCat={getCat}
            total={activeDeck.cards.length}
          />
        )}
        {view === "print" && activeDeck && (
          <PrintA6 deck={activeDeck} getCat={getCat} onBack={() => setView("editor")} />
        )}
      </main>

      {editingCard && activeDeck && (
        <CardModal
          card={editingCard}
          categories={activeDeck.categories}
          onSave={saveCard}
          onClose={() => setEditingCard(null)}
        />
      )}
    </div>
  );
}
