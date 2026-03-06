"use client";

import React from "react";
import { ChevronLeft, Printer, Download } from "lucide-react";
import type { Deck, Category } from "@/types";
import { S } from "@/constants/styles";
import { Fmt } from "./ui/Fmt";
import { sanitizeHtml } from "@/lib/sanitize";

interface PrintA6Props {
  deck: Deck;
  getCat: (id: string) => Category;
  onBack: () => void;
}

// ---------------------------------------------------------------------------
// Builds a completely standalone HTML document for the print popup.
// NO Next.js styles, NO dark theme — just the cards on a white page.
// This is the only reliable way to get @page { size } to work and prevent
// the app's dark background from bleeding into the PDF.
// ---------------------------------------------------------------------------
function buildPrintHtml(
  deck: Deck,
  getCat: (id: string) => Category,
  docTitle: string
): string {
  const total = deck.cards.length;

  const pages = deck.cards.flatMap((card, index) => {
    const cat = getCat(card.categoryId);
    const hasExtra = Boolean(card.hint || card.detail);

    const importantBadge = card.isImportant
      ? `<span style="font-size:7pt;color:#f59e0b;font-weight:700;margin-left:4px;">★ WICHTIG</span>`
      : "";
    const examBadge = card.isExam
      ? `<span style="font-size:7pt;color:#ef4444;font-weight:700;margin-left:4px;">⚠ PRÜFUNG</span>`
      : "";

    const front = `
<div class="card">
  <div class="hdr" style="background:${cat.color}">
    <span class="hdr-l">${cat.name}</span>
    <span class="hdr-r">Karte ${index + 1}/${total}</span>
  </div>
  <div class="body">
    <div class="label-row">FRAGE${importantBadge}${examBadge}</div>
    <div class="rule"></div>
    <div class="question">${sanitizeHtml(card.question)}</div>
  </div>
  <div class="foot">${deck.name}</div>
</div>`;

    const hintBlock = hasExtra
      ? `<div class="hint">
          <div class="hint-title">MERKHILFE / DETAILWISSEN:</div>
          ${card.hint ? `<div class="hint-text">${sanitizeHtml(card.hint)}</div>` : ""}
          ${card.detail ? `<div class="hint-detail">${sanitizeHtml(card.detail)}</div>` : ""}
        </div>`
      : "";

    const back = `
<div class="card card-flex">
  <div class="hdr" style="background:${cat.color}">
    <span class="hdr-l">${cat.name} – Karte ${index + 1}</span>
    <span class="hdr-r hdr-white">ANTWORT</span>
  </div>
  <div class="body body-flex">
    <div class="answer">${sanitizeHtml(card.answer)}</div>
    ${hintBlock}
  </div>
</div>`;

    return [front, back];
  });

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>${docTitle}</title>
<style>
  /* Reset — no external fonts, no app styles */
  * {
    margin: 0; padding: 0; box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }
  html, body { background: #fff; font-family: Arial, Helvetica, sans-serif; }

  /* A6 landscape: 148 mm wide × 105 mm tall */
  @page { size: 148mm 105mm; margin: 0; }

  .card {
    width: 148mm;
    height: 105mm;
    background: #fff;
    overflow: hidden;
    position: relative;
    page-break-after: always;
    break-after: page;
  }
  .card-flex { display: flex; flex-direction: column; }
  .card:last-child { page-break-after: auto; break-after: auto; }

  /* Coloured header bar */
  .hdr {
    padding: 3mm 5mm;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
  }
  .hdr-l { color: #fff; font-size: 10pt; font-weight: 700; text-transform: uppercase; }
  .hdr-r { color: rgba(255,255,255,0.75); font-size: 8pt; }
  .hdr-white { color: #fff !important; opacity: 1; font-weight: 700; }

  /* Card body */
  .body { padding: 3mm 5mm; overflow: hidden; }
  .body-flex { flex: 1; display: flex; flex-direction: column; }

  /* Front side */
  .label-row {
    color: #6b7280; font-size: 7pt; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.5px;
    margin-bottom: 2mm;
    display: flex; align-items: center; flex-wrap: wrap; gap: 4px;
  }
  .rule { border-top: 1px solid #e5e7eb; margin-bottom: 3px; }
  .question { color: #111; font-size: 14pt; font-weight: 700; line-height: 1.4; }

  /* Back side */
  .answer { color: #1e293b; font-size: 9.5pt; line-height: 1.5; }

  /* Footer (deck name, front side) */
  .foot {
    position: absolute; bottom: 2mm; left: 0; right: 0;
    text-align: center; color: #d1d5db; font-size: 5.5pt;
  }

  /* Hint / Merkhilfe box */
  .hint {
    margin-top: auto; padding: 2mm 3mm;
    background: #fef3c7; border: 1px solid #f59e0b; border-radius: 3px;
  }
  .hint-title { color: #92400e; font-size: 7pt; font-weight: 700; margin-bottom: 1mm; }
  .hint-text  { color: #78350f; font-size: 8pt; font-style: italic; line-height: 1.4; }
  .hint-detail { color: #78350f; font-size: 7.5pt; font-style: italic; line-height: 1.4; margin-top: 1mm; }
</style>
</head>
<body>
${pages.join("\n")}
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function PrintA6({ deck, getCat, onBack }: PrintA6Props) {
  const total = deck.cards.length;

  const openPrintWindow = (saveAsPdf = false) => {
    const title = saveAsPdf ? deck.name : "Karteikarten drucken";
    const html = buildPrintHtml(deck, getCat, title);

    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) {
      alert(
        "Das Popup-Fenster wurde vom Browser blockiert.\n" +
        "Bitte erlaube Popups für diese Seite und versuche es erneut."
      );
      return;
    }

    win.document.open();
    win.document.write(html);
    win.document.close();

    // Give the browser a moment to render, then open print dialog
    setTimeout(() => {
      win.focus();
      win.print();
    }, 300);
  };

  return (
    <div>
      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: 14, paddingBottom: 12, borderBottom: "1px solid #1e293b",
          flexWrap: "wrap", gap: 8,
        }}
      >
        <button style={S.sec} className="btn" onClick={onBack}>
          <ChevronLeft size={15} /> Zurück
        </button>
        <p style={{ color: "#94a3b8", fontSize: 11, textAlign: "center", flex: 1 }}>
          DIN A6 quer (148×105 mm) — Beidseitig, kurze Kante
        </p>
        <div style={{ display: "flex", gap: 6 }}>
          <button style={S.sec} className="btn" onClick={() => openPrintWindow(false)}>
            <Printer size={15} /> Drucken
          </button>
          <button style={S.pri} className="btn" onClick={() => openPrintWindow(true)}>
            <Download size={15} /> Als PDF speichern
          </button>
        </div>
      </div>

      {/* ── Screen preview (React / Fmt) — not used for printing ────── */}
      <style>{`@media screen { .a6p { margin: 6px auto; box-shadow: 0 2px 10px #0003; } }`}</style>

      {deck.cards.map((card, index) => {
        const cat = getCat(card.categoryId);
        const hasExtra = Boolean(card.hint || card.detail);
        return (
          <React.Fragment key={card.id}>
            {/* Front */}
            <div
              className="a6p"
              style={{
                width: "148mm", height: "105mm", background: "white",
                borderRadius: 4, overflow: "hidden", position: "relative",
              }}
            >
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

            {/* Back */}
            <div
              className="a6p"
              style={{
                width: "148mm", height: "105mm", background: "white",
                borderRadius: 4, overflow: "hidden", display: "flex", flexDirection: "column",
              }}
            >
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
