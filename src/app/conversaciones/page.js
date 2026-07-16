"use client";
import { useState, useEffect } from "react";
const CH = { whatsapp: ["WA", "#25D366"], instagram: ["IG", "#C13584"], facebook: ["FB", "#1877F2"], web: ["WEB", "#16C0AC"] };
const ESTADO_LABEL = { abierta: null, handoff: "Derivado a un humano" };

function fmtHora(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const hoy = new Date();
  const mismodia = d.toDateString() === hoy.toDateString();
  return mismodia
    ? d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
}

export default function Conversaciones() {
  const [convs, setConvs] = useState([]); const [sel, setSel] = useState(null); const [msgs, setMsgs] = useState([]);
  const [error, setError] = useState(null); const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/conversations").then(r => r.json()).then(d => {
      const list = d.conversations || [];
      setConvs(list);
      if (list.length) setSel((cur) => cur || list[0].id);
    })
      .catch(() => setError("No se pudieron cargar las conversaciones."))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (!sel) return;
    fetch(`/api/conversations?conversation_id=${sel}`).then(r => r.json()).then(d => setMsgs(d.messages || []))
      .catch(() => setError("No se pudieron cargar los mensajes."));
  }, [sel]);
  const activa = convs.find(c => c.id === sel);
  return (
    <>
      <h1>Conversaciones</h1>
      <p className="lead">Todo lo que entra por WhatsApp, Instagram, Facebook y web, en un solo lugar.</p>
      {error && <p className="err">{error}</p>}
      <div className="grid2" style={{ marginTop: 16, gridTemplateColumns: "340px 1fr", alignItems: "stretch" }}>
        <div className="card" style={{ padding: 0, height: 640, overflowY: "auto" }}>
          {loading && <p className="muted" style={{ padding: 16 }}>Cargando…</p>}
          {!loading && convs.length === 0 && <p className="muted" style={{ padding: 16 }}>Sin conversaciones todavía. Cuando el bot reciba mensajes reales, aparecen acá.</p>}
          {convs.map(c => {
            const ch = CH[c.canal] || ["·", "#8E89A6"];
            const nombre = c.contacts?.nombre || c.contacts?.telefono || "Contacto";
            const preview = c.ultimo?.texto || "Sin mensajes";
            return (
              <div key={c.id} onClick={() => setSel(c.id)} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: 13, borderBottom: "1px solid #EDEBF6", cursor: "pointer", background: sel === c.id ? "#FAF8FF" : "transparent" }}>
                <span style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 8, background: ch[1], color: "#fff", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{ch[0]}</span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{nombre}</span>
                    <span className="muted" style={{ fontSize: 11, flexShrink: 0 }}>{fmtHora(c.ultimo?.created_at || c.created_at)}</span>
                  </div>
                  <div className="muted" style={{ fontSize: 12.5, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{preview}</div>
                  {ESTADO_LABEL[c.estado] && <span className="pill riesgo" style={{ marginTop: 4, display: "inline-block" }}>{ESTADO_LABEL[c.estado]}</span>}
                </div>
              </div>
            );
          })}
        </div>
        <div className="card" style={{ height: 640, display: "flex", flexDirection: "column" }}>
          {!activa ? <p className="muted">Elegí una conversación para verla.</p> : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 12, marginBottom: 12, borderBottom: "1px solid #EDEBF6", flexShrink: 0 }}>
                <span style={{ width: 30, height: 30, borderRadius: 8, background: (CH[activa.canal] || ["·", "#8E89A6"])[1], color: "#fff", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{(CH[activa.canal] || ["·"])[0]}</span>
                <b>{activa.contacts?.nombre || activa.contacts?.telefono || "Contacto"}</b>
                {ESTADO_LABEL[activa.estado] && <span className="pill riesgo">{ESTADO_LABEL[activa.estado]}</span>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, overflowY: "auto", minHeight: 0, flex: 1 }}>
                {msgs.map((m, i) => (
                  <div key={i} className={"msg " + (m.rol === "in" ? "in" : "out")}>
                    {m.texto}
                    <div style={{ fontSize: 10, color: "#8E89A6", marginTop: 3 }}>{fmtHora(m.created_at)}</div>
                  </div>
                ))}
                {msgs.length === 0 && <p className="muted">Sin mensajes.</p>}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
