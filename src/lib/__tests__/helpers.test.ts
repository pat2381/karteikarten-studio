import { uid, stripHtml } from "../helpers";

describe("uid()", () => {
  it("returns a non-empty string", () => {
    expect(uid()).toBeTruthy();
  });
  it("generates unique values", () => {
    expect(uid()).not.toBe(uid());
  });
});

describe("stripHtml()", () => {
  it("removes HTML tags", () => {
    expect(stripHtml("<p>Hallo</p>")).toBe("Hallo");
  });
  it("returns empty string for empty input", () => {
    expect(stripHtml("")).toBe("");
  });
  it("keeps plain text", () => {
    expect(stripHtml("Kein HTML")).toBe("Kein HTML");
  });
  it("handles nested tags", () => {
    expect(stripHtml("<b><i>Text</i></b>")).toBe("Text");
  });
});
