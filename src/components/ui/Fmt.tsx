"use client";

import { sanitizeHtml } from "@/lib/sanitize";

interface FmtProps {
  html: string;
  style?: React.CSSProperties;
}

export function Fmt({ html, style = {} }: FmtProps) {
  if (!html) return null;
  return (
    <div
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
      style={{ lineHeight: 1.6, wordBreak: "break-word", ...style }}
    />
  );
}
