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

// Extend window object for custom storage API
declare global {
  interface Window {
    storage?: {
      get(key: string): Promise<{ value: string } | null>;
      set(key: string, value: string): Promise<void>;
    };
  }
}
