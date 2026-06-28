"use client";
import { useState, useEffect } from "react";
import { useTenants } from "@/hooks/useTenants";
const fmt = (n) => "$" + Math.round(n || 0).toLocaleString("es-AR");
export default function Reactivador() {
  const { tenants, tenantId, setTenantId, error: tenantsError } = useTenants();
  const [inactivas, setInactivas] = useState([]); const [campaigns, setCampaigns] = useState([]);
  const [uso, setUso] = useState(null); const [tope, setTope] = useState(""); const [msg, setMsg] = useState(null);
  useEffect(() => { if (tenantId) refresh(); }, [tenantId]);
  function refresh() {
    fetch(`/api/campaigns?tenant_id=${tenantId}&inactivas=1`).then(r => r.json()).then(d => setInactivas(d.inactivas || []))
      .catch(() => setMsg({ ok: false, text: "No se pudieron cargar las inactivas." }));
    fetch(`/api/campaigns?tenant_id=${tenantId}`).then(r => r.json()).then(d => setCampaigns(d.campaigns || []))
      .catch(() => setMsg({ ok: false, text: "No se pudieron cargar las campañas." }));
    fetch(`/api/usage?tenant_id=${tenantId}`).then(r => r.json()).then(u => { setUso(u); setTope(u.tope ?? ""); })
      .catch(() => setMsg({ ok: false, text: "No se pudo cargar el consumo." }));
  }
  async function crear() {
    try {
      const res = await fetch("/api/campaigns", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tenant_id: tenantId }) });
      const d = await res.json(); setMsg(d.ok ? { ok: true, text: `Campaña creada con ${d.total} inactivas.` } : { ok: false, text: d.error }); refresh();
    } catch { setMsg({ ok: false, text: "No se pudo conectar con el servidor." }); }
  }
  async function enviar(id) {
    try {
      const res = await fetch("/api/campaigns", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ campaign_id: id, tanda: 100 }) });
      const d = await res.json();
      if (d.ok && d.frenado && d.enviados === 0) setMsg({ ok: false, text: "Tope mensual alcanzado: no se enviaron mensajes." });
      else if (d.ok) setMsg({ ok: true, text: `Tanda enviada: ${d.enviados} mensajes.${d.frenado ? " (se alcanzó el tope)" : ""}` });
      else setMsg({ ok: false, text: d.error });
      if (d.uso) setUso(d.uso); refresh();
    } catch { setMsg({ ok: false, text: "No se pudo conectar con el servidor." }); }
  }
  async function guardarTope() {
    try {
      const res = await fetch("/api/usage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tenant_id: tenantId, tope_marketing: tope }) });
      const d = await res.json();
      if (d.ok) { setUso(d.uso); setMsg({ ok: true, text: "Tope guardado." }); } else setMsg({ ok: false, text: d.error });
    } catch { setMsg({ ok: false, text: "No se pudo conectar con el servidor." }); }
  }
  return (
    <>
      <h1>Reactivador de inactivas</h1>
      <p className="lead">Detecta clientas dormidas y les manda una campaña por tandas, sin pasarte del presupuesto.</p>
      {tenantsError && <p className="err">{tenantsError}</p>}
      {tenants.length === 0 && !tenantsError ? (
        <p className="muted">No hay negocios todavía. Creá uno en /onboarding.</p>
      ) : (
        <>
      <select className="selw" value={tenantId} onChange={e => setTenantId(e.target.value)}>{tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select>

      {uso && (
        <div className="card" style={{ margin: "16px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <b>Consumo de mensajes del mes</b>
            <span className="muted" style={{ fontSize: 13 }}>Plan {uso.plan} · incluidos {uso.limit}</span>
          </div>
          <div className="bar" style={{ height: 12, marginTop: 8 }}><i style={{ width: `${uso.pct}%`, background: uso.overage ? "#F2545B" : (uso.alerta_80 ? "#F6A609" : undefined) }} /></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 14, fontWeight: 600 }}>
            <span>{uso.used} / {uso.limit} usados</span>
            <span className={uso.overage ? "err" : (uso.alerta_80 ? "" : "muted")} style={uso.alerta_80 && !uso.overage ? { color: "#9a6a04" } : {}}>
              {uso.overage ? `Excedente: ${uso.overage} msj · ${fmt(uso.overage_costo_ars)} a facturar` : (uso.alerta_80 ? "⚠ llegaste al 80% del paquete" : "dentro del paquete")}
            </span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13 }} className="muted">Tope mensual (opcional, frena envíos):</span>
            <input style={{ width: 120, marginTop: 0 }} type="number" placeholder="sin tope" value={tope} onChange={e => setTope(e.target.value)} />
            <button className="btn btn-ghost" style={{ padding: "8px 16px" }} onClick={guardarTope}>Guardar tope</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 16, alignItems: "center", margin: "16px 0", flexWrap: "wrap" }}>
        <div className="card" style={{ padding: 16 }}><div className="muted" style={{ fontSize: 13 }}>Inactivas detectadas</div><div style={{ fontSize: 28, fontWeight: 800 }}>{inactivas.length}</div></div>
        <button className="btn" onClick={crear}>Crear campaña con las inactivas</button>
      </div>
      {msg && <p className={msg.ok ? "ok" : "err"}>{msg.text}</p>}
      <div className="card">
        <table>
          <thead><tr><th>Nombre</th><th>Estado</th><th>Creada</th><th></th></tr></thead>
          <tbody>
            {campaigns.map(c => <tr key={c.id}><td><b>{c.nombre}</b></td><td><span className="pill lead">{c.estado}</span></td><td>{new Date(c.created_at).toLocaleDateString("es-AR")}</td><td><button className="btn btn-ghost" style={{ padding: "6px 14px" }} onClick={() => enviar(c.id)}>Enviar tanda</button></td></tr>)}
            {campaigns.length === 0 && <tr><td colSpan="4" className="muted">Sin campañas todavía.</td></tr>}
          </tbody>
        </table>
      </div>
        </>
      )}
    </>
  );
}
