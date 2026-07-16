"use client";
import { useState } from "react";
export default function Probador() {
  const [chat, setChat] = useState([]); const [text, setText] = useState(""); const [loading, setLoading] = useState(false);
  async function send(e) {
    e.preventDefault(); if (!text.trim()) return;
    const userMsg = text; setText(""); setChat(c => [...c, { rol: "in", texto: userMsg }]); setLoading(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: userMsg }) });
      const data = await res.json();
      setChat(c => [...c, { rol: "out", texto: data.reply || data.error }]);
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
      <div className="card" style={{ marginBottom: 16, fontSize: 13.5 }}>
        💡 Así entrenás a tu asistente: probalo acá con preguntas reales. Si en algún momento no supo
        responder algo, cargá esa pregunta en <a href="/faqs">Preguntas frecuentes</a> para que la aprenda.
      </div>
      <div className="chatbox">
        {chat.length === 0 && <p className="muted">Probá: "¿cuánto sale el facial?", "quiero un turno", "¿atienden sábados?"</p>}
        {chat.map((m, i) => (<div key={i} className={"msg " + (m.rol === "in" ? "in" : "out")}>{m.texto}</div>))}
        {loading && <div className="muted" style={{ fontSize: 13 }}>escribiendo…</div>}
      </div>
      <form onSubmit={send} className="row">
        <input style={{ flex: 1, marginTop: 0 }} value={text} onChange={e => setText(e.target.value)} placeholder="Escribí un mensaje…" />
        <button className="btn">Enviar</button>
      </form>
    </>
  );
}
