"use client";
import { useState, useEffect } from "react";
import { useTenants } from "@/hooks/useTenants";
const CH = { whatsapp: ["WA", "#25D366"], instagram: ["IG", "#C13584"], facebook: ["FB", "#1877F2"], web: ["WEB", "#16C0AC"] };
export default function Conversaciones() {
  const { tenants, tenantId, setTenantId, error: tenantsError } = useTenants();
  const [convs, setConvs] = useState([]); const [sel, setSel] = useState(null); const [msgs, setMsgs] = useState([]);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!tenantId) return;
    fetch(`/api/conversations?tenant_id=${tenantId}`).then(r => r.json()).then(d => setConvs(d.conversations || []))
      .catch(() => setError("No se pudieron cargar las conversaciones."));
  }, [tenantId]);
  useEffect(() => {
    if (!sel) return;
    fetch(`/api/conversations?conversation_id=${sel}`).then(r => r.json()).then(d => setMsgs(d.messages || []))
      .catch(() => setError("No se pudieron cargar los mensajes."));
  }, [sel]);
  return (
    <>
      <h1>Conversaciones</h1>
      <p className="lead">Todo lo que entra por WhatsApp, Instagram, Facebook y web, en un solo lugar.</p>
      {(tenantsError || error) && <p className="err">{tenantsError || error}</p>}
      <select className="selw" value={tenantId} onChange={e => { setTenantId(e.target.value); setSel(null); setMsgs([]); }}>{tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
      <div className="grid2" style={{ marginTop: 16, gridTemplateColumns: "320px 1fr", alignItems: "start" }}>
        <div className="card" style={{ padding: 0, maxHeight: 480, overflowY: "auto" }}>
          {convs.length === 0 && <p className="muted" style={{ padding: 16 }}>Sin conversaciones todavía. Cuando el bot reciba mensajes reales, aparecen acá.</p>}
          {convs.map(c => { const ch = CH[c.canal] || ["·", "#8E89A6"]; return (
            <div key={c.id} onClick={() => setSel(c.id)} style={{ display: "flex", gap: 10, alignItems: "center", padding: 13, borderBottom: "1px solid #EDEBF6", cursor: "pointer", background: sel === c.id ? "#FAF8FF" : "transparent" }}>
              <span style={{ width: 26, height: 26, borderRadius: 7, background: ch[1], color: "#fff", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{ch[0]}</span>
              <div><div style={{ fontWeight: 700, fontSize: 14 }}>{c.contacts?.nombre || c.contacts?.telefono || "Contacto"}</div><div className="muted" style={{ fontSize: 12 }}>{c.estado}</div></div>
            </div>); })}
        </div>
        <div className="card" style={{ minHeight: 300 }}>
          {!sel ? <p className="muted">Elegí una conversación para verla.</p> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {msgs.map((m, i) => <div key={i} className={"msg " + (m.rol === "in" ? "in" : "out")}>{m.texto}<div style={{ fontSize: 10, color: "#8E89A6", marginTop: 3 }}>{m.rol}</div></div>)}
              {msgs.length === 0 && <p className="muted">Sin mensajes.</p>}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
