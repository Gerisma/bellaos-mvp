"use client";
import { useState } from "react";

const fmt = (n) => "$" + Math.round(n || 0).toLocaleString("es-AR");

export default function SimuladorROI() {
  const [inactivas, setInactivas] = useState(500);
  const [ticket, setTicket] = useState(25000);
  const [pctVuelve, setPctVuelve] = useState(8);
  const [ausencias, setAusencias] = useState(12);

  const reactivacion = inactivas * (pctVuelve / 100) * ticket;
  const menosAusencias = ausencias * ticket;
  const total = reactivacion + menosAusencias;

  return (
    <>
      <h1>Simulador ROI</h1>
      <p className="lead">Calculá en vivo cuánta plata puede recuperar un negocio. Ideal para mostrarlo en la reunión y cerrar la venta.</p>

      <div className="grid2" style={{ alignItems: "start" }}>
        <div className="card">
          <b>Datos del negocio</b>

          <label>Clientas inactivas: {inactivas.toLocaleString("es-AR")}</label>
          <input type="range" min={0} max={2000} step={10} value={inactivas} onChange={(e) => setInactivas(Number(e.target.value))} style={{ marginTop: 10 }} />

          <label>Ticket promedio por visita ($)</label>
          <input type="number" min={0} step={500} value={ticket} onChange={(e) => setTicket(Number(e.target.value) || 0)} />

          <label>% de inactivas que vuelve: {pctVuelve}%</label>
          <input type="range" min={0} max={30} step={1} value={pctVuelve} onChange={(e) => setPctVuelve(Number(e.target.value))} style={{ marginTop: 10 }} />

          <label>Ausencias evitadas por mes: {ausencias}</label>
          <input type="range" min={0} max={60} step={1} value={ausencias} onChange={(e) => setAusencias(Number(e.target.value))} style={{ marginTop: 10 }} />
        </div>

        <div className="card" style={{ background: "var(--grad)", color: "#fff", border: "none" }}>
          <b>Plata recuperable por mes</b>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18, fontSize: 14 }}>
            <span style={{ opacity: 0.85 }}>Reactivación de inactivas</span>
            <b>{fmt(reactivacion)}</b>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 14, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,.25)" }}>
            <span style={{ opacity: 0.85 }}>Menos ausencias</span>
            <b>{fmt(menosAusencias)}</b>
          </div>

          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 13, opacity: 0.85 }}>Total potencial / mes</div>
            <div style={{ fontSize: 36, fontWeight: 800, marginTop: 4 }}>{fmt(total)}</div>
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 8 }}>
              Con un abono desde USD 39/mes, el sistema se paga muchísimas veces.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
