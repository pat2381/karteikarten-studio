"use client";

import { useState, useEffect } from "react";
import { X, Save, HelpCircle, MessageSquare, Lightbulb, BookOpen, Star, AlertTriangle } from "lucide-react";
import type { Card, Category } from "@/types";
import { DEFAULT_CAT } from "@/constants/colors";
import { S } from "@/constants/styles";
import { stripHtml } from "@/lib/helpers";
import { RichEditor } from "./ui/RichEditor";
import { CardFitPreview } from "./CardFitPreview";

interface CardModalProps {
  card: Card;
  categories: Category[];
  onSave: (card: Card) => void;
  onClose: () => void;
}

export function CardModal({ card, categories, onSave, onClose }: CardModalProps) {
  const [formData, setFormData] = useState<Card>({ ...card });
  const [editorKey, setEditorKey] = useState(0);

  useEffect(() => {
    setFormData({ ...card });
    setEditorKey((k) => k + 1);
  }, [card.id]);

  const set = <K extends keyof Card>(key: K, value: Card[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const selectedCat = categories.find((c) => c.id === formData.categoryId) || categories[0] || DEFAULT_CAT;
  const canSave = Boolean(stripHtml(formData.question) && stripHtml(formData.answer));

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ color: "#f1f5f9", fontSize: 17, fontWeight: 700 }}>{!card.id ? "Neue Karte" : "Karte bearbeiten"}</h3>
          <button style={S.iBtn} onClick={onClose}><X size={18} /></button>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
              <div style={{ flex: 1, minWidth: 130 }}>
                <label style={S.label}>Kategorie</label>
                <select value={formData.categoryId} onChange={(e) => set("categoryId", e.target.value)} style={S.sel}>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <label style={S.chkL}>
                <input type="checkbox" checked={formData.isImportant} onChange={(e) => set("isImportant", e.target.checked)} style={S.chk} />
                <Star size={13} color="#f59e0b" /> Wichtig
              </label>
              <label style={S.chkL}>
                <input type="checkbox" checked={formData.isExam} onChange={(e) => set("isExam", e.target.checked)} style={S.chk} />
                <AlertTriangle size={13} color="#ef4444" /> Prüfung
              </label>
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={S.label}><HelpCircle size={12} /> Frage *</label>
              <RichEditor key={`q${editorKey}`} value={formData.question} onChange={(v) => set("question", v)} placeholder="Deine Frage..." minH={55} />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={S.label}><MessageSquare size={12} /> Antwort *</label>
              <RichEditor key={`a${editorKey}`} value={formData.answer} onChange={(v) => set("answer", v)} placeholder="Antwort eingeben..." minH={90} />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={S.label}><Lightbulb size={12} color="#f59e0b" /> Merkhilfe</label>
              <RichEditor key={`h${editorKey}`} value={formData.hint || ""} onChange={(v) => set("hint", v)} placeholder="Eselsbrücke, Merksatz..." minH={40} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={S.label}><BookOpen size={12} color="#38bdf8" /> Detailwissen</label>
              <RichEditor key={`d${editorKey}`} value={formData.detail || ""} onChange={(v) => set("detail", v)} placeholder="Hintergrundwissen..." minH={40} />
            </div>
          </div>
          <div style={{ flexShrink: 0, position: "sticky", top: 0 }}>
            <CardFitPreview card={formData} catColor={selectedCat.color} catName={selectedCat.name} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
          <button style={S.sec} className="btn" onClick={onClose}>Abbrechen</button>
          <button style={{ ...S.pri, opacity: canSave ? 1 : 0.5 }} className="btn" disabled={!canSave} onClick={() => onSave(formData)}>
            <Save size={15} /> Speichern
          </button>
        </div>
      </div>
    </div>
  );
}
