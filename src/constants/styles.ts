import { FONT_FAMILY } from "./colors";
import type React from "react";

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
