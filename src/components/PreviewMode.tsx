"use client";

import { ChevronLeft, ChevronRight, RotateCcw, Star, AlertTriangle } from "lucide-react";
import type { Card, Category } from "@/types";
import { S } from "@/constants/styles";
import { Fmt } from "./ui/Fmt";

interface PreviewModeProps {
  cards: Card[];
  currentIndex: number;
  isFlipped: boolean;
  onFlip: () => void;
  onNext: () => void;
  onPrev: () => void;
  onBack: () => void;
  getCat: (id: string) => Category;
  total: number;
}

export function PreviewMode({ cards, currentIndex, isFlipped, onFlip, onNext, onPrev, onBack, getCat, total }: PreviewModeProps) {
  const card = cards[currentIndex];
  if (!card) return null;
  const cat = getCat(card.categoryId);

  return (
    <div style={{ animation: "fadeIn .3s ease", textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <button style={S.sec} className="btn" onClick={onBack}><ChevronLeft size={15} /> Zurück</button>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {card.isImportant && <Star size={14} color="#f59e0b" fill="#f59e0b" />}
          {card.isExam && <AlertTriangle size={14} color="#ef4444" />}
          <span style={{ color: "#94a3b8", fontSize: 14, fontWeight: 600 }}>{currentIndex + 1} / {total}</span>
        </div>
        <div style={{ width: 80 }} />
      </div>

      <div onClick={onFlip} style={{ cursor: "pointer", maxWidth: 560, margin: "0 auto" }}>
        <div style={{ background: isFlipped ? `${cat.color}0d` : "#111621", border: `2px solid ${cat.color}44`, borderRadius: 14, padding: 20, textAlign: "left", minHeight: 240, transition: "all .2s" }}>
          <div style={{ background: cat.color, padding: "6px 14px", borderRadius: "6px 6px 0 0", margin: "-20px -20px 14px", display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "white", fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>{cat.name}</span>
            <span style={{ color: "#ffffff99", fontSize: 11 }}>{isFlipped ? "Antwort" : "Frage"}</span>
          </div>
          {!isFlipped ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 160 }}>
              <Fmt html={card.question} style={{ color: "#f1f5f9", fontSize: 18, fontWeight: 600 }} />
            </div>
          ) : (
            <div>
              <Fmt html={card.answer} style={{ color: "#e2e8f0", fontSize: 14 }} />
              {(card.hint || card.detail) && (
                <div style={{ marginTop: 14, padding: 10, background: "#f59e0b12", borderRadius: 8, borderLeft: "3px solid #f59e0b" }}>
                  <p style={{ color: "#fbbf24", fontSize: 10, fontWeight: 700, marginBottom: 3, textTransform: "uppercase" }}>Merkhilfe</p>
                  {card.hint && <Fmt html={card.hint} style={{ color: "#fcd34d", fontSize: 12, fontStyle: "italic" }} />}
                  {card.detail && <Fmt html={card.detail} style={{ color: "#d4a017", fontSize: 11, fontStyle: "italic", marginTop: 4 }} />}
                </div>
              )}
            </div>
          )}
          <p style={{ color: "#475569", fontSize: 10, marginTop: 14, textAlign: "center" }}>Klicke zum {isFlipped ? "Zurückdrehen" : "Umdrehen"}</p>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 18 }}>
        <button style={{ ...S.sec, opacity: currentIndex === 0 ? 0.4 : 1 }} className="btn" onClick={onPrev} disabled={currentIndex === 0}><ChevronLeft size={15} /></button>
        <button style={S.pri} className="btn" onClick={onFlip}><RotateCcw size={15} /> Umdrehen</button>
        <button style={{ ...S.sec, opacity: currentIndex === total - 1 ? 0.4 : 1 }} className="btn" onClick={onNext} disabled={currentIndex === total - 1}><ChevronRight size={15} /></button>
      </div>
    </div>
  );
}
