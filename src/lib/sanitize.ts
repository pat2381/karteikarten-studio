// Bug-Fix: Original code used dangerouslySetInnerHTML without sanitization (XSS risk).
// This sanitizer allows only safe HTML tags and attributes.

const ALLOWED_TAGS = new Set([
  "b", "i", "em", "strong", "u", "s",
  "ul", "ol", "li", "br", "p",
  "span", "font",
]);

const ALLOWED_ATTRS = new Set(["style", "color", "face", "size"]);

function sanitizeNode(node: Element): void {
  Array.from(node.children).forEach((child) => {
    const tag = child.tagName.toLowerCase();

    if (!ALLOWED_TAGS.has(tag)) {
      const fragment = document.createDocumentFragment();
      Array.from(child.childNodes).forEach((n) =>
        fragment.appendChild(n.cloneNode(true))
      );
      child.replaceWith(fragment);
      return;
    }

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
