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
      {ok ? <CheckCircle size={10} color="#22c55e" /> : <AlertCircle size={10} color="#ef4444" />}
      <span style={{ fontSize: 9, fontWeight: 600, color: ok ? "#4ade80" : "#f87171" }}>
        {label}{ok ? " passt" : " zu lang!"}
      </span>
    </div>
  );
}
