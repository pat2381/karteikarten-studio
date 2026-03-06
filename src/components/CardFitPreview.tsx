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

const PREVIEW_W = 280;
const PREVIEW_H = Math.round(PREVIEW_W / 1.41);

export function CardFitPreview({ card, catColor, catName }: CardFitPreviewProps) {
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const [frontFits, setFrontFits] = useState(true);
  const [backFits, setBackFits] = useState(true);
  const [activeSide, setActiveSide] = useState<"front" | "back">("front");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (frontRef.current) setFrontFits(frontRef.current.scrollHeight <= frontRef.current.clientHeight);
      if (backRef.current) setBackFits(backRef.current.scrollHeight <= backRef.current.clientHeight);
    }, 200);
    return () => clearTimeout(timer);
  }, [card.question, card.answer, card.hint, card.detail]);

  const hasExtra = Boolean(card.hint || card.detail);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ color: "#94a3b8", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>Live-Vorschau (A6)</span>
        <div style={{ display: "flex", gap: 4 }}>
          {(["front", "back"] as const).map((side) => (
            <button key={side} onClick={() => setActiveSide(side)}
              style={{ ...S.tabMini, borderBottom: activeSide === side ? "2px solid #f59e0b" : "2px solid transparent", color: activeSide === side ? "#f59e0b" : "#64748b" }}>
              {side === "front" ? "Frage" : "Antwort"}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
        <StatusBadge ok={frontFits} label="Frage" />
        <StatusBadge ok={backFits} label="Antwort" />
      </div>
      <div style={{ width: PREVIEW_W, height: PREVIEW_H, borderRadius: 4, overflow: "hidden", border: "1px solid #2a3040", background: "white", position: "relative", fontSize: 0 }}>
        {activeSide === "front" ? (
          <div ref={frontRef} style={{ width: "100%", height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ background: catColor || "#64748b", padding: "3px 6px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "white", fontSize: 5.5, fontWeight: 700, textTransform: "uppercase" }}>{catName || "Kategorie"}</span>
              <span style={{ color: "#fffc", fontSize: 4.5 }}>Karte</span>
            </div>
            <div style={{ padding: "3px 6px", flex: 1 }}>
              <div style={{ fontSize: 3.5, color: "#6b7280", fontWeight: 700, textTransform: "uppercase", marginBottom: 1 }}>Frage</div>
              <div style={{ borderTop: "0.5px solid #e5e7eb", paddingTop: 2 }} />
              <Fmt html={card.question} style={{ color: "#111", fontSize: 7, fontWeight: 700, lineHeight: 1.35 }} />
            </div>
          </div>
        ) : (
          <div ref={backRef} style={{ width: "100%", height: "100%", overflow: "hidden", display: "flex", flexDirection: "column", background: `${catColor}08` }}>
            <div style={{ background: catColor || "#64748b", padding: "2px 6px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "white", fontSize: 4.5, fontWeight: 700, textTransform: "uppercase" }}>{catName || "Kat."}</span>
              <span style={{ color: "white", fontSize: 4.5, fontWeight: 700 }}>ANTWORT</span>
            </div>
            <div style={{ padding: "3px 6px", flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <Fmt html={card.answer} style={{ color: "#1e293b", fontSize: 5, lineHeight: 1.4, flex: hasExtra ? undefined : 1 }} />
              {hasExtra && (
                <div style={{ marginTop: "auto", padding: "2px 3px", background: "#fef3c7", border: "0.5px solid #f59e0b", borderRadius: 2 }}>
                  <div style={{ color: "#92400e", fontSize: 3.5, fontWeight: 700, marginBottom: 0.5 }}>MERKHILFE:</div>
                  {card.hint && <Fmt html={card.hint} style={{ color: "#78350f", fontSize: 4, fontStyle: "italic", lineHeight: 1.3 }} />}
                  {card.detail && <Fmt html={card.detail} style={{ color: "#78350f", fontSize: 3.5, fontStyle: "italic", lineHeight: 1.3, marginTop: 1 }} />}
                </div>
              )}
            </div>
          </div>
        )}
        {((activeSide === "front" && !frontFits) || (activeSide === "back" && !backFits)) && (
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, #ef444488)", height: 16, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 1 }}>
            <span style={{ color: "white", fontSize: 5, fontWeight: 700, background: "#ef4444", padding: "0 4px", borderRadius: 2 }}>TEXT ZU LANG</span>
          </div>
        )}
      </div>
    </div>
  );
}
