"use client";

import { FolderPlus, BookOpen, Copy, Trash2, Layers, Plus } from "lucide-react";
import type { Deck } from "@/types";
import { S } from "@/constants/styles";

interface DashboardProps {
  decks: Deck[];
  onCreate: () => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export function Dashboard({ decks, onCreate, onOpen, onDelete, onDuplicate }: DashboardProps) {
  return (
    <div style={{ animation: "fadeIn .4s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ color: "#f1f5f9", fontSize: 22, fontWeight: 700 }}>Meine Kartendecks</h2>
          <p style={{ color: "#64748b", fontSize: 13, marginTop: 2 }}>{decks.length} {decks.length === 1 ? "Deck" : "Decks"}</p>
        </div>
        <button style={S.pri} className="btn" onClick={onCreate}><FolderPlus size={16} /> Neues Deck</button>
      </div>

      {decks.length === 0 ? (
        <div style={S.empty}>
          <BookOpen size={44} color="#334155" />
          <h3 style={{ color: "#94a3b8", fontSize: 17, fontWeight: 600 }}>Noch keine Decks</h3>
          <p style={{ color: "#64748b", fontSize: 13, maxWidth: 300, textAlign: "center", lineHeight: 1.6 }}>Erstelle dein erstes Kartendeck.</p>
          <button style={{ ...S.pri, marginTop: 12 }} className="btn" onClick={onCreate}><Plus size={16} /> Erstes Deck</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
          {decks.map((deck, index) => (
            <div key={deck.id} className="deck-card" style={{ ...S.dCard, animationDelay: `${index * 50}ms` }} onClick={() => onOpen(deck.id)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ background: deck.categories?.[1]?.color || "#f59e0b", width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Layers size={18} color="white" />
                </div>
                <div style={{ display: "flex", gap: 3 }} onClick={(e) => e.stopPropagation()}>
                  <button style={S.iBtn} className="btn" onClick={() => onDuplicate(deck.id)} title="Duplizieren"><Copy size={13} /></button>
                  <button style={{ ...S.iBtn, color: "#ef4444" }} className="btn" onClick={() => onDelete(deck.id)}><Trash2 size={13} /></button>
                </div>
              </div>
              <h3 style={{ color: "#f1f5f9", fontSize: 15, fontWeight: 600, marginTop: 10 }}>{deck.name}</h3>
              <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                <span style={S.badge}>{deck.cards.length} Karten</span>
                {deck.cards.filter((c) => c.isImportant).length > 0 && (
                  <span style={{ ...S.badge, background: "#fef3c7", color: "#92400e" }}>
                    {deck.cards.filter((c) => c.isImportant).length} Wichtig
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
