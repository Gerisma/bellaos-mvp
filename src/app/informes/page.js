"use client";
import { useState, useEffect } from "react";
const fmt = (n) => "$" + Math.round(n || 0).toLocaleString("es-AR");
const STAGES = { lead_nuevo: "Lead nuevo", en_conversacion: "En conversación", turno_agendado: "Turno agendado", activa: "Cliente activa", en_riesgo: "En riesgo", reactivada: "Reactivada", inactiva: "Inactiva" };
export default function Informes() {
  const [d, setD] = useState(null);
  useEffect(() => {
    fetch("/api/informes").then(r => r.json()).then(setD)
      .catch(() => setD({ error: "No se pudo conectar con el servidor." }));
  }, []);
  const max = d ? Math.max(1, ...Object.values(d.embudo || {})) : 1;
  const u = d?.uso;
  return (
    <>
      <h1>Informes</h1>
      <p className="lead">Todo el rendimiento dentro del sistema. Sin envíos por WhatsApp.</p>
      {!d ? <p className="muted" style={{ marginTop: 20 }}>Cargando…</p> : d.error ? <p className="err">{d.error}</p> : (
        <div style={{ marginTop: 16 }}>
          <div className="kpis">
            <div className="card kpi"><div className="lbl">Turnos agendados</div><div className="val">{d.turnos}</div></div>
            <div className="card kpi"><div className="lbl">Ingresos atribuidos</div><div className="val" style={{ color: "#1FBF6B" }}>{fmt(d.ingresos)}</div></div>
            <div className="card kpi"><div className="lbl">Clientas reactivadas</div><div className="val" style={{ color: "#6D4AFF" }}>{d.reactivadas}</div></div>
            <div className="card kpi"><div className="lbl">Inactivas pendientes</div><div className="val" style={{ color: "#F6A609" }}>{d.inactivas}</div></div>
          </div>
          {u && (
            <div className="card" style={{ marginBottom: 18 }}>
              <b>Consumo de mensajes del mes</b>
              <div className="muted" style={{ fontSize: 13, margin: "4px 0 8px" }}>Plan: {u.plan} · paquete incluido: {u.limit} mensajes de campaña</div>
              <div className="bar" style={{ height: 12 }}><i style={{ width: `${u.pct}%`, background: u.overage ? "#F2545B" : undefined }} /></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 14, fontWeight: 600 }}>
                <span>{u.used} / {u.limit} usados</span>
                <span className={u.overage ? "err" : "muted"}>{u.overage ? `Excedente: ${u.overage} msj · ${fmt(u.overage_costo_ars)}` : (u.alerta_80 ? "⚠ cerca del límite" : "dentro del paquete")}</span>
              </div>
            </div>
          )}
          <div className="grid2">
            <div className="card">
              <b>Embudo de clientas</b>
              <div style={{ marginTop: 12 }}>
                {Object.keys(STAGES).map(s => (<div key={s} className="bar-row"><span className="nm">{STAGES[s]}</span><span className="bar"><i style={{ width: `${((d.embudo?.[s] || 0) / max) * 100}%` }} /></span><b style={{ width: 24, textAlign: "right" }}>{d.embudo?.[s] || 0}</b></div>))}
              </div>
            </div>
            <div className="card">
              <b>Turnos por canal</b>
              <div style={{ marginTop: 12 }}>
                {Object.keys(d.porCanal || {}).length === 0 && <span className="muted">Sin turnos todavía.</span>}
                {Object.entries(d.porCanal || {}).map(([k, v]) => (<div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #EDEBF6" }}><span style={{ textTransform: "capitalize" }}>{k}</span><b>{v}</b></div>))}
              </div>
              <div style={{ marginTop: 16 }}><b>Campaña</b><div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}><span>Mensajes de reactivación enviados</span><b>{d.campana_enviados}</b></div></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
