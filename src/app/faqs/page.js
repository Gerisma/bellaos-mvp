"use client";
import { useState, useEffect } from "react";
export default function Faqs() {
  const [faqs, setFaqs] = useState([]); const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ pregunta: "", respuesta: "" }); const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  function load() {
    fetch("/api/knowledge").then(r => r.json()).then(d => setFaqs(d.faqs || []))
      .catch(() => setMsg({ ok: false, text: "No se pudieron cargar las FAQs." }))
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function crear(e) {
    e.preventDefault(); setMsg(null); setSaving(true);
    try {
      const res = await fetch("/api/knowledge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const d = await res.json();
      if (d.ok) { setForm({ pregunta: "", respuesta: "" }); load(); } else setMsg({ ok: false, text: d.error });
    } catch {
      setMsg({ ok: false, text: "No se pudo conectar con el servidor." });
    } finally {
      setSaving(false);
    }
  }

  async function borrar(id) {
    try {
      await fetch(`/api/knowledge?id=${id}`, { method: "DELETE" });
      load();
    } catch {
      setMsg({ ok: false, text: "No se pudo borrar." });
    }
  }

  const sinEmbedding = faqs.some(f => !f.embedded);

  return (
    <>
      <h1>Preguntas frecuentes</h1>
      <p className="lead">Cargá las dudas más comunes de tus clientas — el asistente las usa para responder mejor.</p>
      {sinEmbedding && (
        <p className="muted" style={{ fontSize: 13 }}>
          Para que el asistente las use de forma más flexible con inteligencia artificial, activá el modo IA de tu plan. Mientras tanto, igual quedan guardadas y el bot responde con reglas simples.
        </p>
      )}
      <form onSubmit={crear} className="card" style={{ margin: "16px 0" }}>
        <label>Pregunta<input required value={form.pregunta} onChange={e => setForm({ ...form, pregunta: e.target.value })} placeholder="¿Tienen estacionamiento?" /></label>
        <label>Respuesta<textarea required value={form.respuesta} onChange={e => setForm({ ...form, respuesta: e.target.value })} placeholder="Sí, tenemos cochera propia a metros del local." rows={3} /></label>
        {msg && <p className={msg.ok ? "ok" : "err"} style={{ marginTop: 10 }}>{msg.text}</p>}
        <button className="btn" style={{ marginTop: 14 }} disabled={saving}>{saving ? "Guardando…" : "+ Agregar FAQ"}</button>
      </form>
      <div className="card">
        {loading && <p className="muted">Cargando…</p>}
        {!loading && faqs.length === 0 && <p className="muted">Sin FAQs todavía.</p>}
        {faqs.map(f => (
          <div key={f.id} style={{ padding: "12px 0", borderBottom: "1px solid #EDEBF6", display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
            <div>
              <b>{f.pregunta}</b>
              <p className="muted" style={{ marginTop: 4, fontSize: 13.5 }}>{f.respuesta}</p>
            </div>
            <button className="btn btn-ghost" style={{ padding: "6px 14px", flexShrink: 0 }} onClick={() => borrar(f.id)}>Borrar</button>
          </div>
        ))}
      </div>
    </>
  );
}
