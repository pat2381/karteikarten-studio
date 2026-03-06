"use client";

import { Plus } from "lucide-react";
import type { Category } from "@/types";
import { S } from "@/constants/styles";
import { CategoryRow } from "./CategoryRow";

interface CategoryManagerProps {
  categories: Category[];
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<Category>) => void;
  onDelete: (id: string) => void;
}

export function CategoryManager({ categories, onAdd, onUpdate, onDelete }: CategoryManagerProps) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <p style={{ color: "#64748b", fontSize: 12 }}>Farbe anklicken zum Ändern. Name anklicken zum Bearbeiten.</p>
        <button style={S.sec} className="btn" onClick={onAdd}><Plus size={14} /> Kategorie</button>
      </div>
      {categories.map((cat) => (
        <CategoryRow
          key={cat.id}
          category={cat}
          onSave={(updates) => onUpdate(cat.id, updates)}
          onDelete={() => onDelete(cat.id)}
          isLocked={cat.id === "allgemein"}
          startEditing={Boolean(cat.isNew)}
        />
      ))}
    </div>
  );
}
