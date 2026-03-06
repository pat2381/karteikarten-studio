"use client";

import { useState, useRef, useEffect } from "react";
import { Edit3, Eye, Printer, Plus, Check, X, HelpCircle, Star, AlertTriangle, Lightbulb, Trash2 } from "lucide-react";
import type { Card, Category, Deck } from "@/types";
import { COLORS } from "@/constants/colors";
import { S } from "@/constants/styles";
import { uid } from "@/lib/helpers";
import { stripHtml } from "@/lib/helpers";
import { CategoryManager } from "./CategoryManager";

interface DeckEditorProps {
  deck: Deck;
  onUpdateDeck: (updates: Partial<Deck>) => void;
  onNewCard: () => void;
  onEditCard: (card: Card) => void;
  onDeleteCard: (id: string) => void;
  getCat: (id: string) => Category;
  onPreview: () => void;
  onPrint: () => void;
}

export function DeckEditor({ deck, onUpdateDeck, onNewCard, onEditCard, onDeleteCard, getCat, onPreview, onPrint }: DeckEditorProps) {
  const [activeTab, setActiveTab] = useState<"cards" | "categories">("cards");
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(deck.name);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (isEditingName && nameInputRef.current) nameInputRef.current.focus(); }, [isEditingName]);

  const grouped: Record<string, { cat: Category; cards: Card[] }> = {};
  deck.cards.forEach((card) => {
    const cat = getCat(card.categoryId);
    if (!grouped[cat.id]) grouped[cat.id] = { cat, cards: [] };
    grouped[cat.id].cards.push(card);
  });

  const addCategory = () => {
    const newCat: Category = {
      id: uid(),
      name: "Neue Kategorie",
      color: COLORS[deck.categories.length % COLORS.length],
      isNew: true,
    };
    onUpdateDeck({ categories: [...deck.categories, newCat] });
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 8 }}>
        {isEditingName ? (
          <form onSubmit={(e) => { e.preventDefault(); onUpdateDeck({ name: nameValue }); setIsEditingName(false); }} style={{ display: "flex", gap: 6 }}>
            <input ref={nameInputRef} value={nameValue} onChange={(e) => setNameValue(e.target.value)} style={S.inlInput} />
            <button type="submit" style={{ ...S.iBtn, color: "#22c55e" }}><Check size={16} /></button>
            <button type="button" style={S.iBtn} onClick={() => setIsEditingName(false)}><X size={16} /></button>
          </form>
        ) : (
          <h2 style={{ color: "#f1f5f9", fontSize: 20, fontWeight: 700, cursor: "pointer" }} onClick={() => { setNameValue(deck.name); setIsEditingName(true); }}>
            {deck.name} <Edit3 size={13} style={{ opacity: 0.3 }} />
          </h2>
        )}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button style={S.sec} className="btn" onClick={onPreview} disabled={!deck.cards.length}><Eye size={15} /> Vorschau</button>
          <button style={S.sec} className="btn" onClick={onPrint} disabled={!deck.cards.length}><Printer size={15} /> PDF</button>
          <button style={S.pri} className="btn" onClick={onNewCard}><Plus size={15} /> Neue Karte</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 3, marginBottom: 14, borderBottom: "1px solid #1e293b" }}>
        {([["cards", `Karten (${deck.cards.length})`], ["categories", "Kategorien"]] as const).map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            style={{ ...S.tabB, borderBottom: activeTab === key ? "2px solid #f59e0b" : "2px solid transparent", color: activeTab === key ? "#f59e0b" : "#64748b" }}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === "cards" && (
        deck.cards.length === 0 ? (
          <div style={S.empty}>
            <HelpCircle size={36} color="#334155" />
            <p style={{ color: "#64748b", fontSize: 13 }}>Noch keine Karten.</p>
            <button style={{ ...S.pri, marginTop: 8 }} className="btn" onClick={onNewCard}><Plus size={15} /> Erste Karte</button>
          </div>
        ) : (
          Object.values(grouped).map(({ cat, cards }) => (
            <div key={cat.id} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: cat.color }} />
                <span style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{cat.name}</span>
                <span style={{ color: "#475569", fontSize: 10 }}>({cards.length})</span>
              </div>
              {cards.map((card) => (
                <div key={card.id} className="card-item" style={S.cRow}>
                  <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 6 }}>
                    {card.isImportant && <Star size={13} color="#f59e0b" fill="#f59e0b" />}
                    {card.isExam && <AlertTriangle size={13} color="#ef4444" />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {stripHtml(card.question) || "Keine Frage"}
                      </p>
                      <p style={{ color: "#64748b", fontSize: 11, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {stripHtml(card.answer)?.slice(0, 80) || ""}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 4, flexShrink: 0, alignItems: "center" }}>
                    {card.hint && <Lightbulb size={14} color="#f59e0b" style={{ opacity: 0.6 }} />}
                    <button
                      className="btn"
                      title="Bearbeiten"
                      onClick={() => onEditCard(card)}
                      style={{ background: "#1a1f2b", border: "1px solid #2a3040", borderRadius: 6, color: "#94a3b8", cursor: "pointer", padding: "5px 8px", display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}
                    >
                      <Edit3 size={14} /> Bearbeiten
                    </button>
                    <button
                      className="btn"
                      title="Löschen"
                      onClick={() => { if (confirm("Karte löschen?")) onDeleteCard(card.id); }}
                      style={{ background: "#2d0a0a", border: "1px solid #ef444433", borderRadius: 6, color: "#ef4444", cursor: "pointer", padding: "5px 8px", display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))
        )
      )}

      {activeTab === "categories" && (
        <CategoryManager
          categories={deck.categories}
          onAdd={addCategory}
          onUpdate={(id, updates) => onUpdateDeck({ categories: deck.categories.map((c) => c.id === id ? { ...c, ...updates, isNew: false } : c) })}
          onDelete={(id) => {
            if (id === "allgemein") return;
            onUpdateDeck({
              categories: deck.categories.filter((c) => c.id !== id),
              cards: deck.cards.map((c) => c.categoryId === id ? { ...c, categoryId: "allgemein" } : c),
            });
          }}
        />
      )}
    </div>
  );
}
