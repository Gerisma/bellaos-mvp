"use client";
import { useState } from "react";

const TIPOS = [
  ["promo", "Promoción / descuento"],
  ["tip", "Tip o consejo"],
  ["testimonio", "Testimonio / antes-después"],
  ["novedad", "Novedad / servicio nuevo"],
  ["fecha_especial", "Fecha especial"],
];

export default function Contenido() {
  const [tipo, setTipo] = useState("promo");
  const [instrucciones, setInstrucciones] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [copiadoIdx, setCopiadoIdx] = useState(null);

  async function generar(e) {
    e.preventDefault();
    setLoading(true); setMsg(null);
    try {
      const res = await fetch("/api/contenido", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tipo, instrucciones }) });
      const d = await res.json();
      if (d.ok) setPosts((p) => [{ tipo, texto: d.texto }, ...p]);
      else setMsg({ ok: false, text: d.error || "No se pudo generar el posteo." });
    } catch {
      setMsg({ ok: false, text: "No se pudo conectar con el servidor." });
    } finally {
      setLoading(false);
    }
  }

  function copiar(texto, idx) {
    navigator.clipboard?.writeText(texto).then(() => {
      setCopiadoIdx(idx);
      setTimeout(() => setCopiadoIdx(null), 1500);
    });
  }

  return (
    <>
      <h1>Contenido IA</h1>
      <p className="lead">Generá texto para Instagram/Facebook con un clic. Por ahora se publica a mano (copiás y pegás) — la publicación automática depende de un permiso de Meta que todavía está en trámite.</p>

      <form onSubmit={generar} className="card" style={{ display: "grid", gridTemplateColumns: "1.2fr 2fr auto", gap: 8, margin: "16px 0", alignItems: "end" }}>
        <label style={{ margin: 0 }}>Tipo de posteo
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            {TIPOS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
        <label style={{ margin: 0 }}>Instrucciones extra (opcional)
          <input placeholder="Ej: mencionar que es solo esta semana" value={instrucciones} onChange={(e) => setInstrucciones(e.target.value)} />
        </label>
        <button className="btn" disabled={loading}>{loading ? "Generando…" : "✨ Generar"}</button>
      </form>
      {msg && <p className="err">{msg.text}</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {posts.map((p, i) => (
          <div key={i} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span className="pill lead">{TIPOS.find((t) => t[0] === p.tipo)?.[1] || p.tipo}</span>
              <button className="btn btn-ghost" style={{ padding: "6px 14px" }} onClick={() => copiar(p.texto, i)}>{copiadoIdx === i ? "¡Copiado! ✓" : "Copiar texto"}</button>
            </div>
            <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{p.texto}</p>
          </div>
        ))}
        {posts.length === 0 && <p className="muted">Todavía no generaste ningún posteo. Elegí un tipo y tocá Generar.</p>}
      </div>
    </>
  );
}
