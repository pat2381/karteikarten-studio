import type { Card, Deck, Category } from "../index";

describe("Types", () => {
  it("Card has all required fields", () => {
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

  it("Deck has categories and cards arrays", () => {
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
