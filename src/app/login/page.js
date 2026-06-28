"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const sb = supabaseBrowser();
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); return; }
      window.location.href = "/";
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div className="card" style={{ width: 380 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <div style={{ width: 40, height: 40, borderRadius: 13, background: "var(--grad)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1.25rem", color: "#fff" }}>B</div>
          <b style={{ fontSize: "1.3rem" }}>BellaOS</b>
        </div>
        <h1 style={{ fontSize: "1.3rem" }}>Iniciar sesión</h1>
        <p className="lead" style={{ marginBottom: 8 }}>Entrá con tu cuenta para ver tu negocio.</p>
        <form onSubmit={submit}>
          <label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <label>Contraseña<input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
          {error && <p className="err" style={{ marginTop: 12 }}>{error}</p>}
          <button className="btn" style={{ marginTop: 18, width: "100%" }} disabled={loading}>{loading ? "Entrando…" : "Entrar"}</button>
        </form>
        <p className="muted" style={{ marginTop: 16, fontSize: 13 }}>¿No tenés cuenta? <a href="/signup" style={{ color: "var(--violeta)", fontWeight: 700 }}>Registrate</a></p>
      </div>
    </div>
  );
}
