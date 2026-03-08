"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthLayout, authInput } from "./AuthLayout";
import { FONT_FAMILY } from "@/constants/colors";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }
    if (password !== confirm) {
      setError("Passwörter stimmen nicht überein.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password, name: name.trim() || undefined }),
    });

    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      setError(data.error ?? "Registrierung fehlgeschlagen.");
      return;
    }

    // Auto-login after registration
    const result = await signIn("credentials", {
      email: email.trim(),
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      router.push("/auth/login");
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <AuthLayout title="Konto erstellen">
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4, display: "block", marginBottom: 5 }}>
            Name <span style={{ color: "#475569", fontWeight: 400 }}>(optional)</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Max Mustermann"
            autoFocus
            style={authInput}
          />
        </div>

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
            placeholder="Mindestens 8 Zeichen"
            required
            style={authInput}
          />
        </div>

        <div>
          <label style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4, display: "block", marginBottom: 5 }}>
            Passwort bestätigen
          </label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
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
          {loading ? "Wird registriert…" : "Konto erstellen"}
        </button>

        <p style={{ textAlign: "center", color: "#475569", fontSize: 13, marginTop: 4 }}>
          Bereits registriert?{" "}
          <Link href="/auth/login" style={{ color: "#f59e0b", textDecoration: "none", fontWeight: 600 }}>
            Anmelden
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
