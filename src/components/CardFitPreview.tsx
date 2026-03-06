"use client";

import { useRef, useState, useEffect } from "react";
import type { Card } from "@/types";
import { Fmt } from "./ui/Fmt";
import { StatusBadge } from "./ui/StatusBadge";
import { S } from "@/constants/styles";

interface CardFitPreviewProps {
  card: Card;
  catColor: string;
  catName: string;
}

// ---------------------------------------------------------------------------
// Strategy: render the card at its real A6 pixel size (559 × 397 px at 96 dpi)
// with human-readable font sizes, then shrink the whole block via
// CSS transform: scale().  This gives a readable, accurate print preview
// without any tiny "microscope" font sizes.
//
// Font sizes mirror the print output (pt → px at 96 dpi):
//   14 pt question  →  19 px    |   9.5 pt answer  →  13 px
//   10 pt cat name  →  13 px    |   7 pt labels    →   9 px
//   8 pt card num   →  11 px    |   8 pt hint text →  11 px
// Padding (mm → px):  3mm = 11px, 5mm = 19px, 2mm = 8px
// ---------------------------------------------------------------------------
const CARD_W = 559; // A6 landscape at 96 dpi
const CARD_H = 397;

// The outer container widths the user actually sees on screen
const CONTAINER_W = { small: 340, large: 520 } as const;

export function CardFitPreview({ card, catColor, catName }: CardFitPreviewProps) {
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const [frontFits, setFrontFits] = useState(true);
  const [backFits, setBackFits] = useState(true);
  const [activeSide, setActiveSide] = useState<"front" | "back">("front");
  const [zoom, setZoom] = useState<"small" | "large">("large"); // default: large for readability

  const containerW = CONTAINER_W[zoom];
  const scale = containerW / CARD_W;
  const containerH = Math.round(CARD_H * scale);

  // CSS transform does NOT affect scrollHeight/clientHeight, so overflow
  // detection works correctly against the unscaled 559 × 397 inner div.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (frontRef.current)
        setFrontFits(frontRef.current.scrollHeight <= frontRef.current.clientHeight + 2);
      if (backRef.current)
        setBackFits(backRef.current.scrollHeight <= backRef.current.clientHeight + 2);
    }, 200);
    return () => clearTimeout(timer);
  }, [card.question, card.answer, card.hint, card.detail]);

  const hasExtra = Boolean(card.hint || card.detail);
  const hdrBg = catColor || "#64748b";

  return (
    <div>
      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ color: "#94a3b8", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>
          Live-Vorschau (A6)
        </span>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {(["front", "back"] as const).map((side) => (
            <button
              key={side}
              onClick={() => setActiveSide(side)}
              style={{
                ...S.tabMini,
                borderBottom: activeSide === side ? "2px solid #f59e0b" : "2px solid transparent",
                color: activeSide === side ? "#f59e0b" : "#64748b",
              }}
            >
              {side === "front" ? "Frage" : "Antwort"}
            </button>
          ))}
          <button
            onClick={() => setZoom((z) => (z === "small" ? "large" : "small"))}
            title={zoom === "small" ? "Vergrößern" : "Verkleinern"}
            style={{
              background: "#1a1f2b",
              border: "1px solid #2a3040",
              borderRadius: 4,
              color: "#94a3b8",
              cursor: "pointer",
              padding: "2px 8px",
              fontSize: 11,
              fontWeight: 600,
              lineHeight: 1.6,
            }}
          >
            {zoom === "small" ? "🔍 Groß" : "🔍 Klein"}
          </button>
        </div>
      </div>

      {/* ── Fit indicators ───────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        <StatusBadge ok={frontFits} label="Frage passt" />
        <StatusBadge ok={backFits} label="Antwort passt" />
      </div>

      {/* ── Preview ──────────────────────────────────────────────────────
          Outer div: clips to the visible (scaled) size.
          Inner div: full A6 (559×397 px), shrunk by transform: scale().   */}
      <div
        style={{
          width: containerW,
          height: containerH,
          overflow: "hidden",
          border: "1px solid #2a3040",
          borderRadius: 6,
          position: "relative",
          transition: "width .2s ease, height .2s ease",
        }}
      >
        <div
          style={{
            width: CARD_W,
            height: CARD_H,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            background: "white",
            position: "absolute",
            top: 0,
            left: 0,
            fontFamily: "Arial, Helvetica, sans-serif",
          }}
        >
          {/* ── Front ────────────────────────────────────────────── */}
          {activeSide === "front" && (
            <div
              ref={frontRef}
              style={{ width: "100%", height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}
            >
              <div style={{ background: hdrBg, padding: "11px 19px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                <span style={{ color: "white", fontSize: 13, fontWeight: 700, textTransform: "uppercase" }}>
                  {catName || "Kategorie"}
                </span>
                <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 11 }}>Karte</span>
              </div>
              <div style={{ padding: "11px 19px", flex: 1, overflow: "hidden" }}>
                <div style={{ fontSize: 9, color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>
                  Frage
                </div>
                <div style={{ borderTop: "1px solid #e5e7eb", marginBottom: 7 }} />
                <Fmt html={card.question} style={{ color: "#111", fontSize: 19, fontWeight: 700, lineHeight: 1.4 }} />
              </div>
            </div>
          )}

          {/* ── Back ─────────────────────────────────────────────── */}
          {activeSide === "back" && (
            <div
              ref={backRef}
              style={{ width: "100%", height: "100%", overflow: "hidden", display: "flex", flexDirection: "column", background: "white" }}
            >
              <div style={{ background: hdrBg, padding: "8px 19px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                <span style={{ color: "white", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
                  {catName || "Kat."}
                </span>
                <span style={{ color: "white", fontSize: 11, fontWeight: 700 }}>ANTWORT</span>
              </div>
              <div style={{ padding: "11px 19px", flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <Fmt
                  html={card.answer}
                  style={{ color: "#1e293b", fontSize: 13, lineHeight: 1.5, flex: hasExtra ? undefined : 1 }}
                />
                {hasExtra && (
                  <div style={{ marginTop: "auto", padding: "8px 11px", background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: 3 }}>
                    <div style={{ color: "#92400e", fontSize: 9, fontWeight: 700, marginBottom: 4 }}>MERKHILFE:</div>
                    {card.hint && (
                      <Fmt html={card.hint} style={{ color: "#78350f", fontSize: 11, fontStyle: "italic", lineHeight: 1.35 }} />
                    )}
                    {card.detail && (
                      <Fmt html={card.detail} style={{ color: "#78350f", fontSize: 10, fontStyle: "italic", lineHeight: 1.35, marginTop: 3 }} />
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── "Text zu lang" overlay ───────────────────────────── */}
          {((activeSide === "front" && !frontFits) || (activeSide === "back" && !backFits)) && (
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                background: "linear-gradient(transparent, rgba(239,68,68,0.5))",
                height: 52,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                paddingBottom: 8,
              }}
            >
              <span style={{ color: "white", fontSize: 12, fontWeight: 700, background: "#ef4444", padding: "2px 10px", borderRadius: 3 }}>
                TEXT ZU LANG
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Scale info ───────────────────────────────────────────────── */}
      <p style={{ color: "#475569", fontSize: 9, marginTop: 4, textAlign: "right" }}>
        {Math.round(scale * 100)} % · A6 (148 × 105 mm)
      </p>
    </div>
  );
}
