"use client";
import { useState } from "react";
import { useTenants } from "@/hooks/useTenants";
export default function Probador() {
  const { tenants, tenantId, setTenantId, error: tenantsError } = useTenants();
  const [chat, setChat] = useState([]); const [text, setText] = useState(""); const [loading, setLoading] = useState(false);
  async function send(e) {
    e.preventDefault(); if (!text.trim() || !tenantId) return;
    const userMsg = text; setText(""); setChat(c => [...c, { rol: "in", texto: userMsg }]); setLoading(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tenant_id: tenantId, message: userMsg }) });
      const data = await res.json();
      setChat(c => [...c, { rol: "out", texto: data.reply || data.error, intent: data.intent, engine: data.engine }]);
    } catch {
      setChat(c => [...c, { rol: "out", texto: "No se pudo conectar con el servidor." }]);
    } finally {
      setLoading(false);
    }
  }
  return (
    <>
      <h1>Probador del asistente</h1>
      <p className="lead">Escribí como si fueras una clienta y mirá cómo responde el cerebro.</p>
      {tenantsError && <p className="err">{tenantsError}</p>}
      <select className="selw" value={tenantId} onChange={e => { setTenantId(e.target.value); setChat([]); }}>{tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
      <div className="chatbox">
        {chat.length === 0 && <p className="muted">Probá: "¿cuánto sale el facial?", "quiero un turno", "¿atienden sábados?"</p>}
        {chat.map((m, i) => (<div key={i} className={"msg " + (m.rol === "in" ? "in" : "out")}>{m.texto}{m.intent && <div style={{ fontSize: 10, color: "#8E89A6", marginTop: 4 }}>intent: {m.intent} · {m.engine}</div>}</div>))}
        {loading && <div className="muted" style={{ fontSize: 13 }}>escribiendo…</div>}
      </div>
      <form onSubmit={send} className="row">
        <input style={{ flex: 1, marginTop: 0 }} value={text} onChange={e => setText(e.target.value)} placeholder="Escribí un mensaje…" />
        <button className="btn">Enviar</button>
      </form>
      <p className="muted" style={{ fontSize: 13, marginTop: 12 }}>Sin clave de OpenRouter responde con reglas; al cargar OPENROUTER_API_KEY usa el LLM.</p>
    </>
  );
}
