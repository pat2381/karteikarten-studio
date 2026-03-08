"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthLayout, authInput } from "./AuthLayout";
import { FONT_FAMILY } from "@/constants/colors";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email: email.trim(),
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("E-Mail oder Passwort falsch.");
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <AuthLayout title="Anmelden">
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4, display: "block", marginBottom: 5 }}>
            E-Mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="deine@email.de"
            required
            autoFocus
            style={authInput}
          />
        </div>

        <div>
          <label style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4, display: "block", marginBottom: 5 }}>
            Passwort
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            style={authInput}
          />
        </div>

        {error && (
          <div style={{ background: "#ef44441a", border: "1px solid #ef444433", borderRadius: 7, padding: "8px 12px", color: "#ef4444", fontSize: 13 }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            background: "#f59e0b",
            color: "#000",
            border: "none",
            borderRadius: 7,
            padding: "10px 16px",
            fontSize: 14,
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            fontFamily: FONT_FAMILY,
            marginTop: 4,
          }}
        >
          {loading ? "Wird angemeldet…" : "Anmelden"}
        </button>

        <p style={{ textAlign: "center", color: "#475569", fontSize: 13, marginTop: 4 }}>
          Noch kein Konto?{" "}
          <Link href="/auth/register" style={{ color: "#f59e0b", textDecoration: "none", fontWeight: 600 }}>
            Registrieren
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
