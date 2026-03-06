"use client";

import React from "react";
import { ChevronLeft, Printer, Download } from "lucide-react";
import type { Deck, Category } from "@/types";
import { S } from "@/constants/styles";
import { Fmt } from "./ui/Fmt";

interface PrintA6Props {
  deck: Deck;
  getCat: (id: string) => Category;
  onBack: () => void;
}

export function PrintA6({ deck, getCat, onBack }: PrintA6Props) {
  const total = deck.cards.length;

  const handlePrint = (saveAsPdf = false) => {
    const originalTitle = document.title;
    if (saveAsPdf) document.title = deck.name;
    window.print();
    if (saveAsPdf) setTimeout(() => { document.title = originalTitle; }, 500);
  };

  return (
    <div>
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, paddingBottom: 12, borderBottom: "1px solid #1e293b", flexWrap: "wrap", gap: 8 }}>
        <button style={S.sec} className="btn" onClick={onBack}><ChevronLeft size={15} /> Zurück</button>
        <p style={{ color: "#94a3b8", fontSize: 11, textAlign: "center", flex: 1 }}>DIN A6 quer (148×105mm) — Beidseitig, kurze Kante</p>
        <div style={{ display: "flex", gap: 6 }}>
          <button style={S.sec} className="btn" onClick={() => handlePrint(false)}><Printer size={15} /> Drucken</button>
          <button style={S.pri} className="btn" onClick={() => handlePrint(true)}><Download size={15} /> Als PDF speichern</button>
        </div>
      </div>

      <style>{`
        @media print {
          /* Fix 1: Force background colors and images to print */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          @page { size: 148mm 105mm; margin: 0; }
          html, body { background: white !important; margin: 0 !important; padding: 0 !important; }
          .no-print { display: none !important; }
          /* Fix 2: page-break on .a6p, no extra wrapper div in the DOM */
          .a6p {
            page-break-after: always;
            break-after: page;
            page-break-inside: avoid;
            break-inside: avoid;
            width: 148mm !important;
            height: 105mm !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            overflow: hidden !important;
          }
          .a6p:last-child {
            page-break-after: auto;
            break-after: auto;
          }
        }
        @media screen { .a6p { margin: 6px auto; box-shadow: 0 2px 10px #0003; } }
      `}</style>

      {/* Fix 2: React.Fragment with key — no wrapper <div> that causes blank pages */}
      {deck.cards.map((card, index) => {
        const cat = getCat(card.categoryId);
        const hasExtra = Boolean(card.hint || card.detail);
        return (
          <React.Fragment key={card.id}>
            {/* Front side – Frage */}
            <div className="a6p" style={{ width: "148mm", height: "105mm", background: "white", borderRadius: 4, overflow: "hidden", position: "relative" }}>
              <div style={{ background: cat.color, padding: "3mm 5mm", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "white", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>{cat.name}</span>
                <span style={{ color: "#ffffffbb", fontSize: 8 }}>Karte {index + 1}/{total}</span>
              </div>
              <div style={{ padding: "3mm 5mm" }}>
                <div style={{ display: "flex", gap: 4, alignItems: "center", marginBottom: 2 }}>
                  <span style={{ color: "#6b7280", fontSize: 7, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Frage</span>
                  {card.isImportant && <span style={{ fontSize: 7, color: "#f59e0b", fontWeight: 700 }}>★ WICHTIG</span>}
                  {card.isExam && <span style={{ fontSize: 7, color: "#ef4444", fontWeight: 700 }}>⚠ PRÜFUNG</span>}
                </div>
                <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 3 }} />
                <Fmt html={card.question} style={{ color: "#111", fontSize: 14, fontWeight: 700, lineHeight: 1.4 }} />
              </div>
              <div style={{ position: "absolute", bottom: 2, left: 0, right: 0, textAlign: "center" }}>
                <span style={{ color: "#d1d5db", fontSize: 5.5 }}>{deck.name}</span>
              </div>
            </div>

            {/* Back side – Antwort */}
            <div className="a6p" style={{ width: "148mm", height: "105mm", background: "white", borderRadius: 4, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ background: cat.color, padding: "2mm 5mm", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "white", fontSize: 8, fontWeight: 700, textTransform: "uppercase" }}>{cat.name} – Karte {index + 1}</span>
                <span style={{ color: "white", fontSize: 8, fontWeight: 700 }}>ANTWORT</span>
              </div>
              <div style={{ padding: "3mm 5mm", flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <Fmt html={card.answer} style={{ color: "#1e293b", fontSize: 9.5, lineHeight: 1.5, flex: hasExtra ? undefined : 1 }} />
                {hasExtra && (
                  <div style={{ marginTop: "auto", padding: "2mm 3mm", background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: 3 }}>
                    <p style={{ color: "#92400e", fontSize: 7, fontWeight: 700, marginBottom: 1 }}>MERKHILFE / DETAILWISSEN:</p>
                    {card.hint && <Fmt html={card.hint} style={{ color: "#78350f", fontSize: 8, fontStyle: "italic", lineHeight: 1.4 }} />}
                    {card.detail && <Fmt html={card.detail} style={{ color: "#78350f", fontSize: 7.5, fontStyle: "italic", lineHeight: 1.4, marginTop: 1 }} />}
                  </div>
                )}
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
