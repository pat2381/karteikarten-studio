# Karteikarten Studio — Refactoring Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Monolithische 470-Zeilen JSX-Datei in eine wartbare Next.js 14 App Router + TypeScript Struktur aufteilen und dabei 7 Bugs beheben.

**Architecture:** State bleibt zentral in `App.tsx`. Komponenten sind rein funktional und erhalten alle Daten via Props. Utility-Funktionen (storage, helpers, sanitize) sind von React entkoppelt und einzeln testbar.

**Tech Stack:** Next.js 14 (App Router), TypeScript, React 18, Lucide React, Jest + React Testing Library

---

## Finale Zielstruktur

```
src/
  app/
    page.tsx
    layout.tsx
    globals.css
  components/
    ui/
      RichEditor.tsx
      Fmt.tsx
      StatusBadge.tsx
      Toast.tsx
    CardFitPreview.tsx
    CardModal.tsx
    Dashboard.tsx
    DeckEditor.tsx
    CategoryManager.tsx
    CategoryRow.tsx
    PreviewMode.tsx
    PrintA6.tsx
  lib/
    storage.ts
    helpers.ts
    sanitize.ts
  constants/
    colors.ts
    styles.ts
  types/
    index.ts
```

---

## Task 1: Next.js Projekt initialisieren

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `.gitignore`

**Step 1: Sicherstellen dass Node.js verfügbar ist**

```bash
node --version
npm --version
```
Expected: Node >= 18, npm >= 9

**Step 2: Neues Next.js Projekt scaffolden**

> Hinweis: Die bestehende `karteikarten-studio.jsx` bleibt erhalten und wird am Ende gelöscht.

```bash
cd "C:/Users/pat2381/Downloads/karteikarten-studio"
npx create-next-app@latest . --typescript --no-tailwind --eslint --app --src-dir --import-alias "@/*" --yes
```

Expected: Projekt-Dateien werden erstellt. Falls Fehler "directory not empty": `--yes` erzwingt Überschreiben.

**Step 3: Zusätzliche Dependencies installieren**

```bash
npm install lucide-react
npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom @types/jest ts-jest
```

**Step 4: Jest konfigurieren**

Erstelle `jest.config.ts`:
```typescript
import type { Config } from "jest";
const config: Config = {
  testEnvironment: "jsdom",
  transform: { "^.+\\.tsx?$": "ts-jest" },
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
  setupFilesAfterFramework: ["<rootDir>/jest.setup.ts"],
};
export default config;
```

Erstelle `jest.setup.ts`:
```typescript
import "@testing-library/jest-dom";
```

**Step 5: Standard-Dateien bereinigen**

```bash
rm -f src/app/page.tsx src/app/globals.css src/app/favicon.ico public/vercel.svg public/next.svg
```

**Step 6: Commit**

```bash
git add .
git commit -m "chore: initialize Next.js 14 project with TypeScript"
```

---

## Task 2: TypeScript-Interfaces definieren

**Files:**
- Create: `src/types/index.ts`
- Test: `src/types/__tests__/index.test.ts`

**Step 1: Testdatei schreiben**

Erstelle `src/types/__tests__/index.test.ts`:
```typescript
import type { Card, Deck, Category, ViewType } from "../index";

describe("Types", () => {
  it("Card hat alle Pflichtfelder", () => {
    const card: Card = {
      id: "abc",
      question: "<p>Frage</p>",
      answer: "<p>Antwort</p>",
      categoryId: "allgemein",
      isImportant: false,
      isExam: false,
    };
    expect(card.id).toBe("abc");
    expect(card.hint).toBeUndefined();
  });

  it("Deck hat categories und cards", () => {
    const deck: Deck = {
      id: "d1",
      name: "Mathe",
      categories: [],
      cards: [],
      createdAt: Date.now(),
    };
    expect(deck.categories).toHaveLength(0);
  });
});
```

**Step 2: Test ausführen — soll FAIL**

```bash
npx jest src/types/__tests__/index.test.ts
```
Expected: FAIL — "Cannot find module '../index'"

**Step 3: Typen implementieren**

Erstelle `src/types/index.ts`:
```typescript
export interface Category {
  id: string;
  name: string;
  color: string;
  isNew?: boolean;
}

export interface Card {
  id: string;
  question: string;
  answer: string;
  hint?: string;
  detail?: string;
  categoryId: string;
  isImportant: boolean;
  isExam: boolean;
}

export interface Deck {
  id: string;
  name: string;
  categories: Category[];
  cards: Card[];
  createdAt: number;
}

export type ViewType = "dashboard" | "editor" | "preview" | "print";

// Erweiterung des window-Objekts für window.storage
declare global {
  interface Window {
    storage?: {
      get(key: string): Promise<{ value: string } | null>;
      set(key: string, value: string): Promise<void>;
    };
  }
}
```

**Step 4: Tests ausführen — soll PASS**

```bash
npx jest src/types/__tests__/index.test.ts
```
Expected: PASS (2 tests)

**Step 5: Commit**

```bash
git add src/types/
git commit -m "feat: add TypeScript interfaces for Card, Deck, Category"
```

---

## Task 3: Konstanten auslagern

**Files:**
- Create: `src/constants/colors.ts`
- Create: `src/constants/styles.ts`

**Step 1: `src/constants/colors.ts` erstellen**

```typescript
export const COLORS: string[] = [
  "#dc2626", "#ea580c", "#d97706", "#ca8a04", "#16a34a",
  "#059669", "#0891b2", "#2563eb", "#4f46e5", "#7c3aed",
  "#9333ea", "#be123c", "#78716c", "#64748b",
];

export const TEXT_COLORS: string[] = [
  "#111827", "#dc2626", "#ea580c", "#16a34a",
  "#2563eb", "#7c3aed", "#be123c", "#ca8a04",
];

import type { Category } from "@/types";

export const DEFAULT_CAT: Category = {
  id: "allgemein",
  name: "Allgemein",
  color: "#64748b",
};

export const FONT_FAMILY = "'DM Sans', sans-serif";
```

**Step 2: `src/constants/styles.ts` erstellen**

> Styles aus der originalen karteikarten-studio.jsx übernehmen und in separate Datei auslagern.

```typescript
import { FONT_FAMILY } from "./colors";

// Globales CSS (wird in App als <style> eingefügt)
export const GLOBAL_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0c0f14; }
  ::selection { background: #f59e0b44; }
  input:focus, textarea:focus, select:focus {
    outline: none;
    box-shadow: 0 0 0 2px #f59e0b44;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes toastA {
    0% { transform: translate(-50%, 30px); opacity: 0; }
    10% { transform: translate(-50%, 0); opacity: 1; }
    85% { transform: translate(-50%, 0); opacity: 1; }
    100% { transform: translate(-50%, 30px); opacity: 0; }
  }
  .card-item:hover { background: #1a1f2b !important; }
  .btn:hover { filter: brightness(1.12); }
  .btn:disabled { opacity: .5; cursor: not-allowed; filter: none; }
  .deck-card:hover { border-color: #f59e0b !important; transform: translateY(-2px); }
`;

// Style-Objekt für inline-Styles
export const S: Record<string, React.CSSProperties> = {
  app: { minHeight: "100vh", background: "#0c0f14", fontFamily: FONT_FAMILY, color: "#e2e8f0" },
  header: { background: "#111621", borderBottom: "1px solid #1a1f2b", padding: "10px 20px", position: "sticky", top: 0, zIndex: 50 },
  hInner: { maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 },
  logo: { width: 32, height: 32, borderRadius: 7, background: "#f59e0b18", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #f59e0b33" },
  main: { maxWidth: 1100, margin: "0 auto", padding: "20px 20px 60px" },
  pri: { background: "#f59e0b", color: "#000", border: "none", borderRadius: 7, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontFamily: FONT_FAMILY, transition: "all .15s" },
  sec: { background: "#1a1f2b", color: "#94a3b8", border: "1px solid #2a3040", borderRadius: 7, padding: "7px 12px", fontSize: 12, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontFamily: FONT_FAMILY, transition: "all .15s" },
  ghost: { background: "transparent", color: "#94a3b8", border: "none", padding: "4px 6px", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 3, fontFamily: FONT_FAMILY },
  iBtn: { background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: 3, borderRadius: 4, display: "flex", alignItems: "center" },
  badge: { background: "#f59e0b18", color: "#f59e0b", fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: 20 },
  tabB: { background: "none", border: "none", color: "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer", padding: "7px 14px", fontFamily: FONT_FAMILY, transition: "all .15s" },
  tabMini: { background: "none", border: "none", color: "#64748b", fontSize: 9, fontWeight: 600, cursor: "pointer", padding: "3px 8px", fontFamily: FONT_FAMILY },
  dCard: { background: "#111621", border: "1px solid #1e293b", borderRadius: 10, padding: 16, cursor: "pointer", transition: "all .2s" },
  cRow: { display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#111621", borderRadius: 7, marginBottom: 3, border: "1px solid #1a1f2b", transition: "background .15s" },
  empty: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "50px 16px", gap: 10 },
  overlay: { position: "fixed", inset: 0, background: "#000c", zIndex: 100, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "24px 16px", overflowY: "auto", backdropFilter: "blur(3px)" },
  modal: { background: "#111621", border: "1px solid #2a3040", borderRadius: 14, padding: 22, width: "100%", maxWidth: 920, marginTop: 10, marginBottom: 40 },
  label: { color: "#94a3b8", fontSize: 10, fontWeight: 600, marginBottom: 3, display: "flex", alignItems: "center", gap: 3, textTransform: "uppercase", letterSpacing: 0.4 },
  sel: { width: "100%", background: "#0c0f14", border: "1px solid #2a3040", borderRadius: 7, color: "#e2e8f0", fontSize: 13, padding: "7px 10px", fontFamily: FONT_FAMILY },
  inlInput: { background: "#0c0f14", border: "1px solid #f59e0b44", borderRadius: 5, color: "#f1f5f9", fontSize: 16, fontWeight: 700, padding: "3px 8px", fontFamily: FONT_FAMILY },
  chkL: { display: "flex", alignItems: "center", gap: 4, color: "#94a3b8", fontSize: 11, fontWeight: 500, cursor: "pointer", padding: "6px 8px", background: "#0c0f14", border: "1px solid #2a3040", borderRadius: 7 },
  chk: { accentColor: "#f59e0b", width: 14, height: 14, cursor: "pointer" },
  toast: { position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", background: "#f59e0b", color: "#000", padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 200, animation: "toastA 2s ease both", fontFamily: FONT_FAMILY },
  center: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0c0f14" },
  spinner: { width: 28, height: 28, border: "3px solid #1e293b", borderTop: "3px solid #f59e0b", borderRadius: "50%", animation: "spin .8s linear infinite" },
};
```

**Step 3: Commit**

```bash
git add src/constants/
git commit -m "feat: extract COLORS, DEFAULT_CAT, S-styles into constants"
```

---

## Task 4: Utility-Funktionen mit Tests

**Files:**
- Create: `src/lib/helpers.ts`
- Create: `src/lib/storage.ts`
- Create: `src/lib/sanitize.ts`
- Test: `src/lib/__tests__/helpers.test.ts`
- Test: `src/lib/__tests__/storage.test.ts`
- Test: `src/lib/__tests__/sanitize.test.ts`

### 4a: helpers.ts

**Step 1: Test schreiben**

Erstelle `src/lib/__tests__/helpers.test.ts`:
```typescript
import { uid, stripHtml } from "../helpers";

describe("uid()", () => {
  it("gibt einen nicht-leeren String zurück", () => {
    expect(uid()).toBeTruthy();
  });
  it("ist jedes Mal einzigartig", () => {
    expect(uid()).not.toBe(uid());
  });
});

describe("stripHtml()", () => {
  it("entfernt HTML-Tags", () => {
    expect(stripHtml("<p>Hallo</p>")).toBe("Hallo");
  });
  it("gibt leeren String für undefined zurück", () => {
    expect(stripHtml("")).toBe("");
  });
  it("behält Text ohne Tags", () => {
    expect(stripHtml("Kein HTML")).toBe("Kein HTML");
  });
  it("entfernt verschachtelte Tags", () => {
    expect(stripHtml("<b><i>Text</i></b>")).toBe("Text");
  });
});
```

**Step 2: Test ausführen — soll FAIL**

```bash
npx jest src/lib/__tests__/helpers.test.ts
```

**Step 3: helpers.ts implementieren**

Erstelle `src/lib/helpers.ts`:
```typescript
export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function stripHtml(html: string): string {
  if (!html) return "";
  // Server-seitig: einfacher Regex-Fallback
  if (typeof document === "undefined") {
    return html.replace(/<[^>]*>/g, "").trim();
  }
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent?.trim() ?? "";
}
```

**Step 4: Tests ausführen — soll PASS**

```bash
npx jest src/lib/__tests__/helpers.test.ts
```

### 4b: storage.ts (Bug-Fix: localStorage-Fallback)

**Step 5: Test schreiben**

Erstelle `src/lib/__tests__/storage.test.ts`:
```typescript
import { load, save } from "../storage";

// window.storage simulieren
const mockStorage: Record<string, string> = {};
beforeEach(() => {
  Object.defineProperty(global, "window", {
    value: {
      storage: {
        get: jest.fn(async (key: string) =>
          mockStorage[key] ? { value: mockStorage[key] } : null
        ),
        set: jest.fn(async (key: string, value: string) => {
          mockStorage[key] = value;
        }),
      },
    },
    writable: true,
  });
});

describe("load()", () => {
  it("gibt Fallback zurück wenn kein Wert vorhanden", async () => {
    const result = await load("nonexistent", []);
    expect(result).toEqual([]);
  });

  it("parst gespeicherten JSON-Wert", async () => {
    mockStorage["test-key"] = JSON.stringify({ name: "Test" });
    const result = await load("test-key", null);
    expect(result).toEqual({ name: "Test" });
  });
});

describe("save()", () => {
  it("speichert Daten ohne Fehler", async () => {
    await expect(save("key", { data: 1 })).resolves.not.toThrow();
  });
});
```

**Step 6: storage.ts implementieren (Bug-Fix #2: localStorage-Fallback)**

Erstelle `src/lib/storage.ts`:
```typescript
// Bug-Fix: window.storage ohne Fallback → localStorage als Fallback hinzugefügt
// window.storage wird zuerst versucht (custom Umgebung), dann localStorage

async function getStorageItem(key: string): Promise<string | null> {
  if (typeof window === "undefined") return null;

  if (window.storage) {
    const result = await window.storage.get(key);
    return result?.value ?? null;
  }

  // Fallback: Standard localStorage
  return localStorage.getItem(key);
}

async function setStorageItem(key: string, value: string): Promise<void> {
  if (typeof window === "undefined") return;

  if (window.storage) {
    await window.storage.set(key, value);
    return;
  }

  // Fallback: Standard localStorage
  localStorage.setItem(key, value);
}

export async function load<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await getStorageItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function save<T>(key: string, data: T): Promise<void> {
  try {
    await setStorageItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Storage error:", e);
  }
}
```

### 4c: sanitize.ts (Bug-Fix: XSS)

**Step 7: Test schreiben**

Erstelle `src/lib/__tests__/sanitize.test.ts`:
```typescript
import { sanitizeHtml } from "../sanitize";

describe("sanitizeHtml()", () => {
  it("erlaubt sichere Tags", () => {
    const result = sanitizeHtml("<b>Fett</b> und <i>kursiv</i>");
    expect(result).toContain("<b>Fett</b>");
    expect(result).toContain("<i>kursiv</i>");
  });

  it("entfernt script-Tags (XSS-Schutz)", () => {
    const result = sanitizeHtml('<script>alert("xss")</script>Text');
    expect(result).not.toContain("<script>");
    expect(result).toContain("Text");
  });

  it("entfernt onclick-Attribute", () => {
    const result = sanitizeHtml('<b onclick="evil()">Text</b>');
    expect(result).not.toContain("onclick");
    expect(result).toContain("Text");
  });

  it("behandelt leeren String", () => {
    expect(sanitizeHtml("")).toBe("");
  });
});
```

**Step 8: sanitize.ts implementieren (Bug-Fix #1: XSS)**

Erstelle `src/lib/sanitize.ts`:
```typescript
// Bug-Fix: dangerouslySetInnerHTML ohne Sanitierung → XSS-Schutz

const ALLOWED_TAGS = new Set([
  "b", "i", "em", "strong", "u", "s",
  "ul", "ol", "li", "br", "p",
  "span", "font",
]);

// Erlaubte Attribute pro Tag
const ALLOWED_ATTRS = new Set(["style", "color", "face", "size"]);

function sanitizeNode(node: Element): void {
  Array.from(node.children).forEach((child) => {
    const tag = child.tagName.toLowerCase();

    if (!ALLOWED_TAGS.has(tag)) {
      // Nicht erlaubtes Tag: durch seine Kinder ersetzen
      const fragment = document.createDocumentFragment();
      Array.from(child.childNodes).forEach((n) => fragment.appendChild(n.cloneNode(true)));
      child.replaceWith(fragment);
      return;
    }

    // Nicht erlaubte Attribute entfernen
    Array.from(child.attributes).forEach((attr) => {
      if (!ALLOWED_ATTRS.has(attr.name.toLowerCase())) {
        child.removeAttribute(attr.name);
      }
    });

    sanitizeNode(child);
  });
}

export function sanitizeHtml(html: string): string {
  if (!html) return "";
  if (typeof document === "undefined") return html;

  const container = document.createElement("div");
  container.innerHTML = html;
  sanitizeNode(container);
  return container.innerHTML;
}
```

**Step 9: Alle Tests ausführen**

```bash
npx jest src/lib/
```
Expected: PASS (alle Lib-Tests)

**Step 10: Commit**

```bash
git add src/lib/
git commit -m "feat: add helpers, storage (localStorage-fallback), sanitize (XSS-fix)"
```

---

## Task 5: UI-Basiskomponenten

**Files:**
- Create: `src/components/ui/Fmt.tsx`
- Create: `src/components/ui/StatusBadge.tsx`
- Create: `src/components/ui/Toast.tsx`

### Fmt.tsx (Bug-Fix: dangerouslySetInnerHTML mit Sanitierung)

Erstelle `src/components/ui/Fmt.tsx`:
```tsx
"use client";

import { sanitizeHtml } from "@/lib/sanitize";

interface FmtProps {
  html: string;
  style?: React.CSSProperties;
}

// Bug-Fix: HTML wird jetzt durch sanitizeHtml() geleitet bevor dangerouslySetInnerHTML
export function Fmt({ html, style = {} }: FmtProps) {
  if (!html) return null;

  return (
    <div
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
      style={{ lineHeight: 1.6, wordBreak: "break-word", ...style }}
    />
  );
}
```

### StatusBadge.tsx

Erstelle `src/components/ui/StatusBadge.tsx`:
```tsx
import { CheckCircle, AlertCircle } from "lucide-react";

interface StatusBadgeProps {
  ok: boolean;
  label: string;
}

export function StatusBadge({ ok, label }: StatusBadgeProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 3,
        padding: "2px 6px",
        borderRadius: 10,
        background: ok ? "#052e16" : "#450a0a",
        border: `1px solid ${ok ? "#16a34a33" : "#ef444433"}`,
      }}
    >
      {ok ? (
        <CheckCircle size={10} color="#22c55e" />
      ) : (
        <AlertCircle size={10} color="#ef4444" />
      )}
      <span
        style={{
          fontSize: 9,
          fontWeight: 600,
          color: ok ? "#4ade80" : "#f87171",
        }}
      >
        {label}
        {ok ? " passt" : " zu lang!"}
      </span>
    </div>
  );
}
```

### Toast.tsx

Erstelle `src/components/ui/Toast.tsx`:
```tsx
import { S } from "@/constants/styles";

interface ToastProps {
  message: string;
}

export function Toast({ message }: ToastProps) {
  return <div style={S.toast}>{message}</div>;
}
```

**Step: Commit**

```bash
git add src/components/ui/
git commit -m "feat: add Fmt (XSS-fix), StatusBadge, Toast components"
```

---

## Task 6: RichEditor

**Files:**
- Create: `src/components/ui/RichEditor.tsx`

Erstelle `src/components/ui/RichEditor.tsx`:
```tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Bold, Italic, List, ListOrdered, Palette } from "lucide-react";
import { FONT_FAMILY, TEXT_COLORS } from "@/constants/colors";

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minH?: number;
  label?: string;
}

function ToolbarButton({
  icon,
  title,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: "none",
        border: "none",
        color: "#94a3b8",
        cursor: "pointer",
        padding: "2px 5px",
        borderRadius: 3,
        display: "flex",
        alignItems: "center",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#2a3040")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
    >
      {icon}
    </button>
  );
}

function Separator() {
  return (
    <div style={{ width: 1, height: 16, background: "#2a3040", margin: "0 2px" }} />
  );
}

export function RichEditor({
  value,
  onChange,
  placeholder,
  minH = 60,
}: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [height, setHeight] = useState(minH);

  useEffect(() => {
    if (editorRef.current && !initialized.current) {
      editorRef.current.innerHTML = value || "";
      initialized.current = true;
    }
  }, []);

  useEffect(() => {
    if (editorRef.current && initialized.current) {
      if (editorRef.current.innerHTML !== (value || "")) {
        editorRef.current.innerHTML = value || "";
      }
    }
  }, [value]);

  // Hinweis: document.execCommand ist deprecated, aber noch der einfachste Ansatz
  // ohne externe Rich-Text-Library. Browser-Support bleibt vorerst gut.
  const execCommand = (command: string, val: string | null = null) => {
    editorRef.current?.focus();
    document.execCommand(command, false, val ?? undefined);
    onChange(editorRef.current?.innerHTML || "");
  };

  const handleInput = () => onChange(editorRef.current?.innerHTML || "");

  const onDragStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const startY =
        "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
      const startH = height;

      const onMove = (ev: MouseEvent | TouchEvent) => {
        const y =
          "touches" in ev ? ev.touches[0].clientY : (ev as MouseEvent).clientY;
        setHeight(Math.max(minH, startH + (y - startY)));
      };

      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        document.removeEventListener("touchmove", onMove);
        document.removeEventListener("touchend", onUp);
      };

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
      document.addEventListener("touchmove", onMove);
      document.addEventListener("touchend", onUp);
    },
    [height, minH]
  );

  return (
    <div
      style={{
        border: "1px solid #2a3040",
        borderRadius: 8,
        overflow: "hidden",
        background: "#0c0f14",
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          gap: 1,
          padding: "3px 5px",
          background: "#151a25",
          borderBottom: "1px solid #2a3040",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <ToolbarButton
          icon={<Bold size={13} />}
          title="Fett"
          onClick={() => execCommand("bold")}
        />
        <ToolbarButton
          icon={<Italic size={13} />}
          title="Kursiv"
          onClick={() => execCommand("italic")}
        />
        <Separator />
        <ToolbarButton
          icon={<List size={13} />}
          title="Aufzählung"
          onClick={() => execCommand("insertUnorderedList")}
        />
        <ToolbarButton
          icon={<ListOrdered size={13} />}
          title="Nummeriert"
          onClick={() => execCommand("insertOrderedList")}
        />
        <Separator />
        <ToolbarButton
          icon={<span style={{ fontSize: 13, fontWeight: 800 }}>A</span>}
          title="Größer"
          onClick={() => execCommand("fontSize", "5")}
        />
        <ToolbarButton
          icon={<span style={{ fontSize: 10, fontWeight: 800 }}>A</span>}
          title="Kleiner"
          onClick={() => execCommand("fontSize", "2")}
        />
        <Separator />
        <div style={{ position: "relative" }}>
          <ToolbarButton
            icon={<Palette size={13} />}
            title="Farbe"
            onClick={() => setShowColorPicker((v) => !v)}
          />
          {showColorPicker && (
            <div
              style={{
                position: "absolute",
                top: 26,
                left: 0,
                background: "#1a1f2b",
                border: "1px solid #2a3040",
                borderRadius: 8,
                padding: 5,
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 3,
                zIndex: 20,
              }}
            >
              {TEXT_COLORS.map((color) => (
                <div
                  key={color}
                  onClick={() => {
                    execCommand("foreColor", color);
                    setShowColorPicker(false);
                  }}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 3,
                    background: color,
                    cursor: "pointer",
                    border: "2px solid #2a3040",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        data-placeholder={placeholder}
        style={{
          height,
          padding: "8px 11px",
          color: "#e2e8f0",
          fontSize: 13,
          lineHeight: 1.6,
          fontFamily: FONT_FAMILY,
          outline: "none",
          wordBreak: "break-word",
          overflowY: "auto",
        }}
      />

      {/* Resize handle */}
      <div
        onMouseDown={onDragStart}
        onTouchStart={onDragStart}
        style={{
          height: 8,
          cursor: "ns-resize",
          background: "#151a25",
          borderTop: "1px solid #2a3040",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: 30, height: 3, borderRadius: 2, background: "#334155" }} />
      </div>

      <style>{`
        [data-placeholder]:empty::before {
          content: attr(data-placeholder);
          color: #4a5568;
          pointer-events: none;
        }
        [contenteditable] ul, [contenteditable] ol { padding-left: 18px; margin: 3px 0; }
        [contenteditable] li { margin: 1px 0; }
      `}</style>
    </div>
  );
}
```

**Step: Commit**

```bash
git add src/components/ui/RichEditor.tsx
git commit -m "feat: add RichEditor component with resize handle"
```

---

## Task 7: CardFitPreview

**Files:**
- Create: `src/components/CardFitPreview.tsx`

Erstelle `src/components/CardFitPreview.tsx`:
```tsx
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
const PREVIEW_H = Math.round(PREVIEW_W / 1.41); // A6 landscape ratio 148:105

export function CardFitPreview({ card, catColor, catName }: CardFitPreviewProps) {
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const [frontFits, setFrontFits] = useState(true);
  const [backFits, setBackFits] = useState(true);
  const [activeSide, setActiveSide] = useState<"front" | "back">("front");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (frontRef.current)
        setFrontFits(frontRef.current.scrollHeight <= frontRef.current.clientHeight);
      if (backRef.current)
        setBackFits(backRef.current.scrollHeight <= backRef.current.clientHeight);
    }, 200);
    return () => clearTimeout(timer);
  }, [card.question, card.answer, card.hint, card.detail]);

  const hasExtra = Boolean(card.hint || card.detail);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ color: "#94a3b8", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>
          Live-Vorschau (A6)
        </span>
        <div style={{ display: "flex", gap: 4 }}>
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
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
        <StatusBadge ok={frontFits} label="Frage" />
        <StatusBadge ok={backFits} label="Antwort" />
      </div>

      <div
        style={{
          width: PREVIEW_W,
          height: PREVIEW_H,
          borderRadius: 4,
          overflow: "hidden",
          border: "1px solid #2a3040",
          background: "white",
          position: "relative",
          fontSize: 0,
        }}
      >
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
```

**Step: Commit**

```bash
git add src/components/CardFitPreview.tsx
git commit -m "feat: add CardFitPreview with A6 live preview"
```

---

## Task 8: CardModal

**Files:**
- Create: `src/components/CardModal.tsx`

Erstelle `src/components/CardModal.tsx`:
```tsx
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

  const selectedCat =
    categories.find((c) => c.id === formData.categoryId) || categories[0] || DEFAULT_CAT;

  const canSave = Boolean(stripHtml(formData.question) && stripHtml(formData.answer));

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ color: "#f1f5f9", fontSize: 17, fontWeight: 700 }}>
            {!card.id ? "Neue Karte" : "Karte bearbeiten"}
          </h3>
          <button style={S.iBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
          {/* Linke Spalte: Editoren */}
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
              <div style={{ flex: 1, minWidth: 130 }}>
                <label style={S.label}>Kategorie</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => set("categoryId", e.target.value)}
                  style={S.sel}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <label style={S.chkL}>
                <input
                  type="checkbox"
                  checked={formData.isImportant}
                  onChange={(e) => set("isImportant", e.target.checked)}
                  style={S.chk}
                />
                <Star size={13} color="#f59e0b" /> Wichtig
              </label>
              <label style={S.chkL}>
                <input
                  type="checkbox"
                  checked={formData.isExam}
                  onChange={(e) => set("isExam", e.target.checked)}
                  style={S.chk}
                />
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

          {/* Rechte Spalte: Live-Vorschau */}
          <div style={{ flexShrink: 0, position: "sticky", top: 0 }}>
            <CardFitPreview card={formData} catColor={selectedCat.color} catName={selectedCat.name} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
          <button style={S.sec} className="btn" onClick={onClose}>Abbrechen</button>
          <button
            style={{ ...S.pri, opacity: canSave ? 1 : 0.5 }}
            className="btn"
            disabled={!canSave}
            onClick={() => onSave(formData)}
          >
            <Save size={15} /> Speichern
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Step: Commit**

```bash
git add src/components/CardModal.tsx
git commit -m "feat: add CardModal with live A6 preview"
```

---

## Task 9: Dashboard

**Files:**
- Create: `src/components/Dashboard.tsx`

Erstelle `src/components/Dashboard.tsx`:
```tsx
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
          <p style={{ color: "#64748b", fontSize: 13, marginTop: 2 }}>
            {decks.length} {decks.length === 1 ? "Deck" : "Decks"}
          </p>
        </div>
        <button style={S.pri} className="btn" onClick={onCreate}>
          <FolderPlus size={16} /> Neues Deck
        </button>
      </div>

      {decks.length === 0 ? (
        <div style={S.empty}>
          <BookOpen size={44} color="#334155" />
          <h3 style={{ color: "#94a3b8", fontSize: 17, fontWeight: 600 }}>Noch keine Decks</h3>
          <p style={{ color: "#64748b", fontSize: 13, maxWidth: 300, textAlign: "center", lineHeight: 1.6 }}>
            Erstelle dein erstes Kartendeck.
          </p>
          <button style={{ ...S.pri, marginTop: 12 }} className="btn" onClick={onCreate}>
            <Plus size={16} /> Erstes Deck
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
          {decks.map((deck, index) => (
            <div
              key={deck.id}
              className="deck-card"
              style={{ ...S.dCard, animationDelay: `${index * 50}ms` }}
              onClick={() => onOpen(deck.id)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ background: deck.categories?.[1]?.color || "#f59e0b", width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Layers size={18} color="white" />
                </div>
                <div style={{ display: "flex", gap: 3 }} onClick={(e) => e.stopPropagation()}>
                  <button style={S.iBtn} className="btn" onClick={() => onDuplicate(deck.id)} title="Duplizieren">
                    <Copy size={13} />
                  </button>
                  <button style={{ ...S.iBtn, color: "#ef4444" }} className="btn" onClick={() => onDelete(deck.id)}>
                    <Trash2 size={13} />
                  </button>
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
```

**Step: Commit**

```bash
git add src/components/Dashboard.tsx
git commit -m "feat: add Dashboard component"
```

---

## Task 10: CategoryRow & CategoryManager

**Files:**
- Create: `src/components/CategoryRow.tsx`
- Create: `src/components/CategoryManager.tsx`

### CategoryRow.tsx

Erstelle `src/components/CategoryRow.tsx`:
```tsx
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

  useEffect(() => {
    if (isEditing && inputRef.current) inputRef.current.focus();
  }, [isEditing]);

  useEffect(() => {
    setName(category.name);
  }, [category.name]);

  const handleSave = () => {
    if (name.trim()) {
      onSave({ name: name.trim() });
      setIsEditing(false);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "#111621", borderRadius: 7, marginBottom: 4, border: "1px solid #1e293b" }}>
      <div style={{ position: "relative" }}>
        <div
          style={{ width: 22, height: 22, borderRadius: 5, background: category.color, cursor: "pointer", border: "2px solid #2a3040" }}
          onClick={() => setShowColorPicker((v) => !v)}
        />
        {showColorPicker && (
          <div style={{ position: "absolute", top: 28, left: 0, background: "#1a1f2b", border: "1px solid #2a3040", borderRadius: 8, padding: 5, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 3, zIndex: 20 }}>
            {COLORS.map((color) => (
              <div
                key={color}
                onClick={() => { onSave({ color }); setShowColorPicker(false); }}
                style={{ width: 22, height: 22, borderRadius: 4, background: color, cursor: "pointer", border: color === category.color ? "2px solid white" : "2px solid transparent" }}
              />
            ))}
          </div>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} style={{ flex: 1, display: "flex", gap: 4 }}>
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleSave}
            style={{ ...S.inlInput, flex: 1, fontSize: 13, padding: "3px 8px" }}
          />
          <button type="submit" style={{ ...S.iBtn, color: "#22c55e" }}>
            <Check size={14} />
          </button>
        </form>
      ) : (
        <span
          style={{ flex: 1, color: "#e2e8f0", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
          onClick={() => setIsEditing(true)}
        >
          {category.name}
        </span>
      )}

      {!isLocked && (
        <button
          style={{ ...S.iBtn, color: "#ef4444" }}
          onClick={() => { if (confirm("Kategorie löschen?")) onDelete(); }}
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );
}
```

### CategoryManager.tsx

Erstelle `src/components/CategoryManager.tsx`:
```tsx
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
        <p style={{ color: "#64748b", fontSize: 12 }}>
          Farbe anklicken zum Ändern. Name anklicken zum Bearbeiten.
        </p>
        <button style={S.sec} className="btn" onClick={onAdd}>
          <Plus size={14} /> Kategorie
        </button>
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
```

**Step: Commit**

```bash
git add src/components/CategoryRow.tsx src/components/CategoryManager.tsx
git commit -m "feat: add CategoryRow and CategoryManager components"
```

---

## Task 11: DeckEditor

**Files:**
- Create: `src/components/DeckEditor.tsx`

Erstelle `src/components/DeckEditor.tsx`:
```tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Edit3, Eye, Printer, Plus, Check, X, HelpCircle, Star, AlertTriangle, Lightbulb, Trash2 } from "lucide-react";
import type { Card, Category, Deck } from "@/types";
import { DEFAULT_CAT } from "@/constants/colors";
import { S } from "@/constants/styles";
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

export function DeckEditor({
  deck,
  onUpdateDeck,
  onNewCard,
  onEditCard,
  onDeleteCard,
  getCat,
  onPreview,
  onPrint,
}: DeckEditorProps) {
  const [activeTab, setActiveTab] = useState<"cards" | "categories">("cards");
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(deck.name);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) nameInputRef.current.focus();
  }, [isEditingName]);

  // Karten nach Kategorie gruppieren
  const grouped: Record<string, { cat: Category; cards: Card[] }> = {};
  deck.cards.forEach((card) => {
    const cat = getCat(card.categoryId);
    if (!grouped[cat.id]) grouped[cat.id] = { cat, cards: [] };
    grouped[cat.id].cards.push(card);
  });

  const addCategory = () => {
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: "Neue Kategorie",
      color: "#2563eb",
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
          <h2
            style={{ color: "#f1f5f9", fontSize: 20, fontWeight: 700, cursor: "pointer" }}
            onClick={() => { setNameValue(deck.name); setIsEditingName(true); }}
          >
            {deck.name} <Edit3 size={13} style={{ opacity: 0.3 }} />
          </h2>
        )}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button style={S.sec} className="btn" onClick={onPreview} disabled={!deck.cards.length}><Eye size={15} /> Vorschau</button>
          <button style={S.sec} className="btn" onClick={onPrint} disabled={!deck.cards.length}><Printer size={15} /> PDF</button>
          <button style={S.pri} className="btn" onClick={onNewCard}><Plus size={15} /> Neue Karte</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 3, marginBottom: 14, borderBottom: "1px solid #1e293b" }}>
        {([["cards", `Karten (${deck.cards.length})`], ["categories", "Kategorien"]] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{ ...S.tabB, borderBottom: activeTab === key ? "2px solid #f59e0b" : "2px solid transparent", color: activeTab === key ? "#f59e0b" : "#64748b" }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Karten-Tab */}
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
                  <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
                    {card.hint && <Lightbulb size={12} color="#f59e0b" style={{ opacity: 0.5 }} />}
                    <button style={S.iBtn} className="btn" onClick={() => onEditCard(card)}><Edit3 size={13} /></button>
                    <button style={{ ...S.iBtn, color: "#ef4444" }} className="btn" onClick={() => { if (confirm("Karte löschen?")) onDeleteCard(card.id); }}><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          ))
        )
      )}

      {/* Kategorien-Tab */}
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
```

**Step: Commit**

```bash
git add src/components/DeckEditor.tsx
git commit -m "feat: add DeckEditor with card list and category tabs"
```

---

## Task 12: PreviewMode & PrintA6

**Files:**
- Create: `src/components/PreviewMode.tsx`
- Create: `src/components/PrintA6.tsx`

### PreviewMode.tsx

Erstelle `src/components/PreviewMode.tsx`:
```tsx
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

          <p style={{ color: "#475569", fontSize: 10, marginTop: 14, textAlign: "center" }}>
            Klicke zum {isFlipped ? "Zurückdrehen" : "Umdrehen"}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 18 }}>
        <button style={{ ...S.sec, opacity: currentIndex === 0 ? 0.4 : 1 }} className="btn" onClick={onPrev} disabled={currentIndex === 0}>
          <ChevronLeft size={15} />
        </button>
        <button style={S.pri} className="btn" onClick={onFlip}><RotateCcw size={15} /> Umdrehen</button>
        <button style={{ ...S.sec, opacity: currentIndex === total - 1 ? 0.4 : 1 }} className="btn" onClick={onNext} disabled={currentIndex === total - 1}>
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
```

### PrintA6.tsx (Bug-Fix: key={card.id})

Erstelle `src/components/PrintA6.tsx`:
```tsx
"use client";

import { ChevronLeft, Printer } from "lucide-react";
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

  return (
    <div>
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, paddingBottom: 12, borderBottom: "1px solid #1e293b", flexWrap: "wrap", gap: 8 }}>
        <button style={S.sec} className="btn" onClick={onBack}><ChevronLeft size={15} /> Zurück</button>
        <p style={{ color: "#94a3b8", fontSize: 11, textAlign: "center", flex: 1 }}>
          DIN A6 quer (148x105mm) — Beidseitig, kurze Kante
        </p>
        <button style={S.pri} className="btn" onClick={() => window.print()}>
          <Printer size={15} /> Drucken / PDF
        </button>
      </div>

      <style>{`
        @media print {
          @page { size: 148mm 105mm; margin: 0; }
          body { background: white !important; margin: 0; }
          .no-print { display: none !important; }
          .a6p { page-break-after: always; width: 148mm; height: 105mm; margin: 0; box-shadow: none !important; border-radius: 0 !important; }
          .a6p:last-child { page-break-after: auto; }
        }
        @media screen {
          .a6p { margin: 6px auto; box-shadow: 0 2px 10px #0003; }
        }
      `}</style>

      {/* Bug-Fix: key={card.id} statt key={i} (Array-Index) */}
      {deck.cards.map((card, index) => {
        const cat = getCat(card.categoryId);
        const hasExtra = Boolean(card.hint || card.detail);

        return (
          <div key={card.id}>
            {/* Vorderseite (Frage) */}
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

            {/* Rückseite (Antwort) */}
            <div className="a6p" style={{ width: "148mm", height: "105mm", background: `${cat.color}08`, borderRadius: 4, overflow: "hidden", display: "flex", flexDirection: "column" }}>
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
          </div>
        );
      })}
    </div>
  );
}
```

**Step: Commit**

```bash
git add src/components/PreviewMode.tsx src/components/PrintA6.tsx
git commit -m "feat: add PreviewMode and PrintA6 (fix: card.id as key)"
```

---

## Task 13: App-Komponente

**Files:**
- Create: `src/components/App.tsx`

Erstelle `src/components/App.tsx`:
```tsx
"use client";

import { useState, useEffect } from "react";
import { Layers, ChevronLeft } from "lucide-react";
import type { Deck, Card, ViewType } from "@/types";
import { DEFAULT_CAT, COLORS, FONT_FAMILY } from "@/constants/colors";
import { S, GLOBAL_CSS } from "@/constants/styles";
import { load, save } from "@/lib/storage";
import { uid } from "@/lib/helpers";
import { Toast } from "./ui/Toast";
import { Dashboard } from "./Dashboard";
import { DeckEditor } from "./DeckEditor";
import { PreviewMode } from "./PreviewMode";
import { PrintA6 } from "./PrintA6";
import { CardModal } from "./CardModal";

const STORAGE_KEY = "fc-decks";

export function App() {
  const [view, setView] = useState<ViewType>("dashboard");
  const [decks, setDecks] = useState<Deck[]>([]);
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const activeDeck = decks.find((d) => d.id === activeDeckId) ?? null;
  const getCat = (catId: string) =>
    activeDeck?.categories.find((c) => c.id === catId) ?? DEFAULT_CAT;

  // Daten laden
  useEffect(() => {
    load<Deck[]>(STORAGE_KEY, []).then((data) => {
      setDecks(data);
      setIsLoading(false);
    });
  }, []);

  const persist = async (updated: Deck[]) => {
    setDecks(updated);
    await save(STORAGE_KEY, updated);
  };

  const updateDeck = async (id: string, updates: Partial<Deck>) =>
    persist(decks.map((d) => (d.id === id ? { ...d, ...updates } : d)));

  // Deck-Operationen
  const createDeck = async () => {
    const deck: Deck = {
      id: uid(),
      name: "Neues Kartendeck",
      categories: [{ ...DEFAULT_CAT }],
      cards: [],
      createdAt: Date.now(),
    };
    await persist([...decks, deck]);
    setActiveDeckId(deck.id);
    setView("editor");
    showToast("Deck erstellt");
  };

  const deleteDeck = async (id: string) => {
    if (!confirm("Deck löschen?")) return;
    await persist(decks.filter((d) => d.id !== id));
    if (activeDeckId === id) {
      setActiveDeckId(null);
      setView("dashboard");
    }
    showToast("Gelöscht");
  };

  const duplicateDeck = async (id: string) => {
    const source = decks.find((d) => d.id === id);
    if (!source) return;
    const copy: Deck = {
      ...JSON.parse(JSON.stringify(source)),
      id: uid(),
      name: `${source.name} (Kopie)`,
      createdAt: Date.now(),
    };
    copy.cards = copy.cards.map((c) => ({ ...c, id: uid() }));
    await persist([...decks, copy]);
    showToast("Dupliziert");
  };

  // Karten-Operationen
  const saveCard = async (card: Card) => {
    if (!activeDeck) return;
    const existing = activeDeck.cards.find((c) => c.id === card.id);
    const updatedCards = existing
      ? activeDeck.cards.map((c) => (c.id === card.id ? card : c))
      : [...activeDeck.cards, { ...card, id: uid() }];
    await updateDeck(activeDeckId!, { cards: updatedCards });
    setEditingCard(null);
    showToast("Gespeichert");
  };

  const deleteCard = async (cardId: string) => {
    if (!activeDeck) return;
    await updateDeck(activeDeckId!, {
      cards: activeDeck.cards.filter((c) => c.id !== cardId),
    });
    showToast("Gelöscht");
  };

  const startNewCard = () => {
    if (!activeDeck) return;
    setEditingCard({
      id: "",
      question: "",
      answer: "",
      hint: "",
      detail: "",
      categoryId: activeDeck.categories[0]?.id || "allgemein",
      isImportant: false,
      isExam: false,
    });
  };

  if (isLoading) {
    return (
      <div style={S.center}>
        <div style={S.spinner} />
      </div>
    );
  }

  return (
    <div style={S.app}>
      <style>{GLOBAL_CSS}</style>

      {toast && <Toast message={toast} />}

      {/* Header */}
      <header style={S.header} className="no-print">
        <div style={S.hInner}>
          <div
            style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
            onClick={() => { setView("dashboard"); setActiveDeckId(null); }}
          >
            <div style={S.logo}><Layers size={18} color="#f59e0b" /></div>
            <div>
              <h1 style={{ color: "#f1f5f9", fontSize: 17, fontWeight: 700, fontFamily: FONT_FAMILY }}>
                Karteikarten<span style={{ color: "#f59e0b" }}> Studio</span>
              </h1>
              <p style={{ color: "#475569", fontSize: 10 }}>Erstelle & drucke deine Lernkarten</p>
            </div>
          </div>

          {activeDeck && view !== "dashboard" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button style={S.ghost} onClick={() => { setView("dashboard"); setActiveDeckId(null); }}>
                <ChevronLeft size={14} /> Decks
              </button>
              <span style={{ color: "#334155" }}>/</span>
              <span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>{activeDeck.name}</span>
              <span style={S.badge}>{activeDeck.cards.length}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      <main style={S.main}>
        {view === "dashboard" && (
          <Dashboard
            decks={decks}
            onCreate={createDeck}
            onOpen={(id) => { setActiveDeckId(id); setView("editor"); }}
            onDelete={deleteDeck}
            onDuplicate={duplicateDeck}
          />
        )}

        {view === "editor" && activeDeck && (
          <DeckEditor
            deck={activeDeck}
            onUpdateDeck={(updates) => updateDeck(activeDeckId!, updates)}
            onNewCard={startNewCard}
            onEditCard={(card) => setEditingCard({ ...card })}
            onDeleteCard={deleteCard}
            getCat={getCat}
            onPreview={() => { setPreviewIndex(0); setIsFlipped(false); setView("preview"); }}
            onPrint={() => setView("print")}
          />
        )}

        {view === "preview" && activeDeck && (
          <PreviewMode
            cards={activeDeck.cards}
            currentIndex={previewIndex}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped((f) => !f)}
            onNext={() => { setPreviewIndex((i) => Math.min(i + 1, activeDeck.cards.length - 1)); setIsFlipped(false); }}
            onPrev={() => { setPreviewIndex((i) => Math.max(i - 1, 0)); setIsFlipped(false); }}
            onBack={() => setView("editor")}
            getCat={getCat}
            total={activeDeck.cards.length}
          />
        )}

        {view === "print" && activeDeck && (
          <PrintA6 deck={activeDeck} getCat={getCat} onBack={() => setView("editor")} />
        )}
      </main>

      {/* Card Modal */}
      {editingCard && activeDeck && (
        <CardModal
          card={editingCard}
          categories={activeDeck.categories}
          onSave={saveCard}
          onClose={() => setEditingCard(null)}
        />
      )}
    </div>
  );
}
```

**Step: Commit**

```bash
git add src/components/App.tsx
git commit -m "feat: add main App component with full state management"
```

---

## Task 14: Next.js App-Dateien

**Files:**
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`

### layout.tsx

Erstelle `src/app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Karteikarten Studio",
  description: "Erstelle und drucke deine Lernkarten",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### page.tsx

Erstelle `src/app/page.tsx`:
```tsx
import { App } from "@/components/App";

export default function Page() {
  return <App />;
}
```

### globals.css

Erstelle `src/app/globals.css`:
```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: #0c0f14;
}
```

**Step: Commit**

```bash
git add src/app/
git commit -m "feat: add Next.js App Router layout and page entry points"
```

---

## Task 15: Smoke-Test & Aufräumen

**Step 1: Development Server starten**

```bash
npm run dev
```

Expected: Server läuft auf http://localhost:3000, keine Build-Fehler in der Konsole.

**Step 2: Originaldatei entfernen**

```bash
rm "karteikarten-studio.jsx"
```

**Step 3: TypeScript-Fehler prüfen**

```bash
npx tsc --noEmit
```
Expected: Keine Fehler

**Step 4: Alle Tests ausführen**

```bash
npx jest
```
Expected: Alle Tests PASS

**Step 5: Production Build testen**

```bash
npm run build
```
Expected: Erfolgreicher Build ohne Fehler oder Warnings.

**Step 6: Finaler Commit**

```bash
git add -A
git commit -m "chore: remove original monolithic JSX, project fully restructured"
```

---

## Zusammenfassung der Bug-Fixes

| # | Bug | Datei | Fix |
|---|-----|-------|-----|
| 1 | XSS via `dangerouslySetInnerHTML` | `src/components/ui/Fmt.tsx` | `sanitizeHtml()` vor Render |
| 2 | `window.storage` ohne Fallback | `src/lib/storage.ts` | `localStorage`-Fallback |
| 3 | `key={i}` statt `key={card.id}` | `src/components/PrintA6.tsx` | `key={card.id}` |
| 4 | F/S/CSS nach Verwendung definiert | `src/constants/` | Saubere Imports |
| 5 | Cryptische Variablennamen | Alle Komponenten | Lesbare Namen |
| 6 | `"use client"` fehlend | Alle interaktiven Komponenten | Direktive hinzugefügt |
| 7 | `window.storage` SSR-Fehler | `src/lib/storage.ts` | `typeof window` Guard |
