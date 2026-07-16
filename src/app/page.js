"use client";
import { useState, useEffect } from "react";
import ConnectWhatsApp from "@/components/ConnectWhatsApp";
const fmt = (n) => "$" + Math.round(n || 0).toLocaleString("es-AR");
const TONE_COLOR = { alerta: "#F2545B", aviso: "#F6A609", tip: "#6D4AFF", ok: "#1FBF6B" };

function buildRecomendaciones(d) {
  const r = [];
  const u = d.uso;
  if (u?.overage > 0) {
    r.push({ tono: "alerta", texto: `Superaste tu paquete de mensajes (excedente: ${fmt(u.overage_costo_ars)}). Subí el tope o revisá tu plan.`, href: "/reactivador", cta: "Ir a Reactivador" });
  } else if (u?.alerta_80) {
    r.push({ tono: "aviso", texto: "Estás cerca del límite de mensajes incluidos en tu plan este mes.", href: "/reactivador", cta: "Ver consumo" });
  }
  if (d.inactivas > 0) {
    r.push({ tono: "tip", texto: `Tenés ${d.inactivas} clientas inactivas. Lanzá una campaña para recuperarlas.`, href: "/reactivador", cta: "Reactivar clientas" });
  }
  if (d.turnos === 0) {
    r.push({ tono: "tip", texto: "Todavía no se agendó ningún turno. Probá el asistente y revisá que tus servicios y precios estén bien cargados.", href: "/probador", cta: "Abrir Probador" });
  }
  if (d.reactivadas > 0) {
    r.push({ tono: "ok", texto: `¡Bien! Ya recuperaste ${d.reactivadas} clienta(s) este mes gracias al Reactivador.` });
  }
  if (r.length === 0) {
    r.push({ tono: "tip", texto: "Cargá más Preguntas frecuentes para que el asistente responda con más precisión.", href: "/faqs", cta: "Ir a Preguntas frecuentes" });
  }
  return r;
}

export default function Home() {
  const [d, setD] = useState(null);
  useEffect(() => {
    fetch("/api/informes").then(r => r.json()).then(setD).catch(() => setD({ error: "No se pudo conectar con el servidor." }));
  }, []);
  const u = d?.uso;
  const recomendaciones = d && !d.error ? buildRecomendaciones(d) : [];

  return (
    <>
      <h1>Hola 👋</h1>
      <p className="lead">Así viene funcionando tu negocio con IA.</p>
      <div style={{ marginBottom: 20 }}><ConnectWhatsApp /></div>
      {!d ? <p className="muted">Cargando…</p> : d.error ? <p className="err">{d.error}</p> : (
        <>
          <div className="kpis">
            <div className="card kpi"><div className="lbl">Turnos agendados</div><div className="val">{d.turnos}</div></div>
            <div className="card kpi"><div className="lbl">Ingresos atribuidos</div><div className="val" style={{ color: "#1FBF6B" }}>{fmt(d.ingresos)}</div></div>
            <div className="card kpi"><div className="lbl">Clientas reactivadas</div><div className="val" style={{ color: "#6D4AFF" }}>{d.reactivadas}</div></div>
            <div className="card kpi"><div className="lbl">Inactivas pendientes</div><div className="val" style={{ color: "#F6A609" }}>{d.inactivas}</div></div>
          </div>

          {u && (
            <div className="card" style={{ marginTop: 16 }}>
              <b>Consumo de mensajes del mes</b>
              <div className="muted" style={{ fontSize: 13, margin: "4px 0 8px" }}>Plan: {u.plan} · paquete incluido: {u.limit} mensajes de campaña</div>
              <div className="bar" style={{ height: 12 }}><i style={{ width: `${u.pct}%`, background: u.overage ? "#F2545B" : undefined }} /></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 14, fontWeight: 600 }}>
                <span>{u.used} / {u.limit} usados</span>
                <span className={u.overage ? "err" : "muted"}>{u.overage ? `Excedente: ${u.overage} msj · ${fmt(u.overage_costo_ars)}` : (u.alerta_80 ? "⚠ cerca del límite" : "dentro del paquete")}</span>
              </div>
            </div>
          )}

          <div className="card" style={{ marginTop: 16 }}>
            <b>Recomendaciones</b>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
              {recomendaciones.map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, paddingBottom: 12, borderBottom: i < recomendaciones.length - 1 ? "1px solid #EDEBF6" : "none" }}>
                  <span style={{ fontSize: 14 }}><span style={{ color: TONE_COLOR[r.tono], marginRight: 6 }}>●</span>{r.texto}</span>
                  {r.href && <a href={r.href} className="btn btn-ghost" style={{ padding: "6px 14px", flexShrink: 0, whiteSpace: "nowrap" }}>{r.cta}</a>}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
