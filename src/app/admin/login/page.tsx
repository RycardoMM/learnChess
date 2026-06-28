"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push("/admin");
    } else {
      setError("Password incorrecto");
    }
  }

  return (
    <main className="login-shell">
      <h1>Admin Login</h1>
      <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button type="submit" style={{ width: "100%" }}>
          Entrar
        </button>
      </form>
      {error && <p style={{ color: "var(--danger)", marginTop: 8 }}>{error}</p>}
    </main>
  );
}
