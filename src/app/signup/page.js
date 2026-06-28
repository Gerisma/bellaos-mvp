"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const sb = supabaseBrowser();
      const { data, error } = await sb.auth.signUp({ email, password });
      if (error) { setError(error.message); return; }
      if (data.session) {
        window.location.href = "/onboarding";
      } else {
        setSent(true);
      }
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
        {sent ? (
          <>
            <h1 style={{ fontSize: "1.3rem" }}>Revisá tu correo</h1>
            <p className="lead">Te mandamos un email para confirmar tu cuenta. Una vez confirmada, iniciá sesión.</p>
            <a href="/login" className="btn" style={{ display: "block", textAlign: "center", marginTop: 8 }}>Ir a iniciar sesión</a>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: "1.3rem" }}>Creá tu cuenta</h1>
            <p className="lead" style={{ marginBottom: 8 }}>Registrate y dado de alta tu negocio en dos minutos.</p>
            <form onSubmit={submit}>
              <label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
              <label>Contraseña<input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></label>
              {error && <p className="err" style={{ marginTop: 12 }}>{error}</p>}
              <button className="btn" style={{ marginTop: 18, width: "100%" }} disabled={loading}>{loading ? "Creando…" : "Crear cuenta"}</button>
            </form>
            <p className="muted" style={{ marginTop: 16, fontSize: 13 }}>¿Ya tenés cuenta? <a href="/login" style={{ color: "var(--violeta)", fontWeight: 700 }}>Iniciá sesión</a></p>
          </>
        )}
      </div>
    </div>
  );
}
