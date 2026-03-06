import { sanitizeHtml } from "../sanitize";

describe("sanitizeHtml()", () => {
  it("allows safe tags", () => {
    const result = sanitizeHtml("<b>Fett</b> und <i>kursiv</i>");
    expect(result).toContain("<b>Fett</b>");
  });

  it("removes script tags", () => {
    const result = sanitizeHtml('<script>alert("xss")</script>Text');
    expect(result).not.toContain("<script>");
    expect(result).toContain("Text");
  });

  it("removes onclick attributes", () => {
    const result = sanitizeHtml('<b onclick="evil()">Text</b>');
    expect(result).not.toContain("onclick");
    expect(result).toContain("Text");
  });

  it("handles empty string", () => {
    expect(sanitizeHtml("")).toBe("");
  });
});
