"use client";
import { useEffect, useState } from "react";

const fmt = (n) => "$" + Math.round(n || 0).toLocaleString("es-AR");
const ESTADO = { trial: "Prueba", bloqueado: "Bloqueado", activo: "Activo", cortesia: "Cortesía", cancelado: "Cancelado" };
const PILL = { trial: "lead", bloqueado: "inact", activo: "act", cortesia: "cumple", cancelado: "riesgo" };

export default function Admin() {
  const [tenants, setTenants] = useState(null);
  const [autorizado, setAutorizado] = useState(true);
  const [msg, setMsg] = useState(null);

  function cargar() {
    fetch("/api/admin/tenants").then(async (r) => {
      if (r.status === 403) { setAutorizado(false); return; }
      const d = await r.json();
      setTenants(d.tenants || []);
    }).catch(() => setMsg({ ok: false, text: "No se pudo conectar con el servidor." }));
  }
  useEffect(cargar, []);

  async function cobrar(t) {
    const sugerido = t.uso?.overage_costo_ars || 0;
    const monto = window.prompt(`Monto a cobrarle a ${t.name} (ARS):`, sugerido || "");
    if (!monto || Number(monto) <= 0) return;
    try {
      const res = await fetch("/api/admin/charge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tenant_id: t.id, amount: Number(monto) }) });
      const d = await res.json();
      if (d.ok && d.init_point) { window.open(d.init_point, "_blank"); setMsg({ ok: true, text: "Link de cobro generado en una pestaña nueva." }); }
      else setMsg({ ok: false, text: d.error || "No se pudo generar el link." });
    } catch {
      setMsg({ ok: false, text: "No se pudo conectar con el servidor." });
    }
  }

  if (!autorizado) return <p className="err">No autorizado. Esta sección es solo para el administrador de la plataforma.</p>;
  if (!tenants) return <p className="muted">Cargando…</p>;

  return (
    <>
      <h1>Panel admin</h1>
      <p className="lead">Todos los negocios de la plataforma, su estado y su consumo del mes.</p>
      {msg && <p className={msg.ok ? "ok" : "err"}>{msg.text}</p>}
      <div className="card">
        <table>
          <thead><tr><th>Negocio</th><th>Plan</th><th>Estado</th><th>Precio/mes</th><th>Consumo</th><th>A facturar</th><th></th></tr></thead>
          <tbody>
            {tenants.map((t) => (
              <tr key={t.id}>
                <td><b>{t.name}</b></td>
                <td style={{ textTransform: "capitalize" }}>{t.plan?.replace(/_/g, " ")}</td>
                <td><span className={"pill " + (PILL[t.billing_status] || "lead")}>{ESTADO[t.billing_status] || t.billing_status}</span></td>
                <td>{t.precio_mensual ? fmt(t.precio_mensual) : "—"}</td>
                <td>{t.uso ? `${t.uso.used}/${t.uso.limit}` : "—"}</td>
                <td>{t.uso?.overage_costo_ars ? fmt(t.uso.overage_costo_ars) : "—"}</td>
                <td><button className="btn btn-ghost" style={{ padding: "6px 14px" }} onClick={() => cobrar(t)}>Cobrar consumo</button></td>
              </tr>
            ))}
            {tenants.length === 0 && <tr><td colSpan="7" className="muted">Sin negocios todavía.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
