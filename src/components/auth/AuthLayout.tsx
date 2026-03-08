"use client";

import { Layers } from "lucide-react";
import { FONT_FAMILY } from "@/constants/colors";
import { GLOBAL_CSS } from "@/constants/styles";

export const authInput: React.CSSProperties = {
  width: "100%",
  background: "#0c0f14",
  border: "1px solid #2a3040",
  borderRadius: 7,
  color: "#e2e8f0",
  fontSize: 14,
  padding: "10px 12px",
  fontFamily: FONT_FAMILY,
  outline: "none",
  boxSizing: "border-box",
};

export function AuthLayout({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0c0f14",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        fontFamily: FONT_FAMILY,
      }}
    >
      <style>{GLOBAL_CSS}</style>
      <div
        style={{
          background: "#111621",
          border: "1px solid #1e293b",
          borderRadius: 14,
          padding: "32px 28px",
          width: "100%",
          maxWidth: 420,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "#f59e0b18",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #f59e0b33",
            }}
          >
            <Layers size={20} color="#f59e0b" />
          </div>
          <div>
            <p style={{ color: "#f1f5f9", fontSize: 15, fontWeight: 700, margin: 0 }}>
              Karteikarten<span style={{ color: "#f59e0b" }}> Studio</span>
            </p>
            <p style={{ color: "#475569", fontSize: 11, margin: 0 }}>Lernkarten erstellen & drucken</p>
          </div>
        </div>

        <h2 style={{ color: "#f1f5f9", fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
          {title}
        </h2>

        {children}
      </div>
    </div>
  );
}
