# Design: Karteikarten Studio — Refactoring & Restrukturierung

**Datum:** 2026-03-06
**Status:** Genehmigt
**Ziel:** Einzelne 470-Zeilen JSX-Datei in wartbare Next.js App Router + TypeScript Struktur aufteilen und Bugs beheben.

---

## Ausgangssituation

Eine monolithische `karteikarten-studio.jsx` mit ~470 Zeilen enthält:
- Alle React-Komponenten (Dashboard, DeckEditor, CardModal, Preview, PrintA6)
- Styles (inline + globales CSS-Objekt `S`)
- Utility-Funktionen (uid, strip, load, save)
- Konstanten (COLORS, DEFAULT_CAT)

### Gefundene Bugs

| # | Bug | Schwere | Fix |
|---|-----|---------|-----|
| 1 | `dangerouslySetInnerHTML` ohne Sanitierung | Hoch (XSS) | DOMPurify |
| 2 | `window.storage` ohne Fallback | Mittel | localStorage-Fallback |
| 3 | `key={i}` (Index) statt `key={card.id}` in PrintA6 | Mittel | `card.id` |
| 4 | `document.execCommand` deprecated | Niedrig | Deprecation-Kommentar |
| 5 | `confirm()` blockierender Dialog | Niedrig | `window.confirm` bleibt (akzeptiert) |
| 6 | Cryptische Variablennamen (`f`, `sF`, `nv`) | Niedrig | Sprechende Namen |
| 7 | F/S/CSS nach Verwendung definiert | Info | Eigene Dateien, saubere Imports |

---

## Zielstruktur

```
karteikarten-studio/
  src/
    app/
      page.tsx              — Einstiegspunkt
      layout.tsx            — HTML-Wrapper, Google Fonts
      globals.css           — CSS-Animationen, Print-Styles, :root Variablen
    components/
      ui/
        RichEditor.tsx      — ContentEditable-Editor mit Toolbar
        Fmt.tsx             — HTML-Renderer (sanitiert)
        StatusBadge.tsx     — OK/Fehler-Badge
        Toast.tsx           — Toast-Benachrichtigung
      CardFitPreview.tsx    — Live A6-Vorschau
      CardModal.tsx         — Karte erstellen/bearbeiten Modal
      Dashboard.tsx         — Deck-Übersicht
      DeckEditor.tsx        — Karten-Liste + Tab-Navigation
      CategoryManager.tsx   — Kategorie-Verwaltung
      CategoryRow.tsx       — Einzelne Kategorie-Zeile
      PreviewMode.tsx       — Karteikarten-Lernmodus
      PrintA6.tsx           — PDF/Druck-Ansicht
    lib/
      storage.ts            — window.storage + localStorage-Fallback
      helpers.ts            — uid(), stripHtml()
      sanitize.ts           — HTML-Sanitierung
    constants/
      colors.ts             — COLORS[], DEFAULT_CAT, TEXT_COLORS
      styles.ts             — S-Objekt, FONT, CSS-String
    types/
      index.ts              — Card, Deck, Category TypeScript-Interfaces
  package.json
  tsconfig.json
  next.config.ts
```

---

## Datenfluss

```
App (State: decks, deckId, view, editCard, toast)
  ├── Dashboard       ← liest decks[], Callbacks: onCreate, onOpen, onDel, onDup
  ├── DeckEditor      ← liest deck, Callbacks: updDeck, onNewCard, onEditCard, onDelCard
  │   ├── CategoryManager → CategoryRow
  │   └── [CardModal] ← per editCard State
  ├── PreviewMode     ← read-only, pIdx + flip State
  └── PrintA6         ← read-only
```

State bleibt vollständig in `App.tsx` — kein Context/Redux nötig.

---

## Entscheidungen

- **TypeScript:** Alle Interfaces in `types/index.ts`; Komponenten als `.tsx`
- **Sanitierung:** Eigene `sanitize.ts` mit `DOMPurify` für `Fmt`-Komponente
- **Storage:** `storage.ts` prüft `window.storage` zuerst, fällt auf `localStorage` zurück
- **Styles:** `S`-Objekt und CSS-String bleiben in `styles/index.ts` — Umstieg auf CSS-Module wäre ein separates Projekt
- **confirm():** Bleibt für Lösch-Dialoge (einfach, funktioniert, akzeptiert)
- **execCommand:** Bleibt mit Deprecation-Kommentar — saubere Alternative erfordert externe Rich-Text-Library
