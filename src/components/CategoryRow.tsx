"use client";

import { useState, useEffect, useRef } from "react";
import { Check, Trash2 } from "lucide-react";
import type { Category } from "@/types";
import { COLORS } from "@/constants/colors";
import { S } from "@/constants/styles";

interface CategoryRowProps {
  category: Category;
  onSave: (updates: Partial<Category>) => void;
  onDelete: () => void;
  isLocked: boolean;
  startEditing?: boolean;
}

export function CategoryRow({ category, onSave, onDelete, isLocked, startEditing = false }: CategoryRowProps) {
  const [isEditing, setIsEditing] = useState(startEditing);
  const [name, setName] = useState(category.name);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (isEditing && inputRef.current) inputRef.current.focus(); }, [isEditing]);
  useEffect(() => { setName(category.name); }, [category.name]);

  const handleSave = () => {
    if (name.trim()) { onSave({ name: name.trim() }); setIsEditing(false); }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "#111621", borderRadius: 7, marginBottom: 4, border: "1px solid #1e293b" }}>
      <div style={{ position: "relative" }}>
        <div style={{ width: 22, height: 22, borderRadius: 5, background: category.color, cursor: "pointer", border: "2px solid #2a3040" }} onClick={() => setShowColorPicker((v) => !v)} />
        {showColorPicker && (
          <div style={{ position: "absolute", top: 28, left: 0, background: "#1a1f2b", border: "1px solid #2a3040", borderRadius: 8, padding: 5, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 3, zIndex: 20 }}>
            {COLORS.map((color) => (
              <div key={color} onClick={() => { onSave({ color }); setShowColorPicker(false); }}
                style={{ width: 22, height: 22, borderRadius: 4, background: color, cursor: "pointer", border: color === category.color ? "2px solid white" : "2px solid transparent" }} />
            ))}
          </div>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} style={{ flex: 1, display: "flex", gap: 4 }}>
          <input ref={inputRef} value={name} onChange={(e) => setName(e.target.value)} onBlur={handleSave}
            style={{ ...S.inlInput, flex: 1, fontSize: 13, padding: "3px 8px" }} />
          <button type="submit" style={{ ...S.iBtn, color: "#22c55e" }}><Check size={14} /></button>
        </form>
      ) : (
        <span style={{ flex: 1, color: "#e2e8f0", fontSize: 13, fontWeight: 500, cursor: "pointer" }} onClick={() => setIsEditing(true)}>
          {category.name}
        </span>
      )}

      {!isLocked && (
        <button style={{ ...S.iBtn, color: "#ef4444" }} onClick={() => { if (confirm("Kategorie löschen?")) onDelete(); }}>
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );
}
