"use client";
import { useState, useEffect } from "react";
export default function Agenda() {
  const [appts, setAppts] = useState([]); const [contacts, setContacts] = useState([]); const [services, setServices] = useState([]);
  const [form, setForm] = useState({ contact_id: "", service_id: "", inicio: "" }); const [msg, setMsg] = useState(null);
  useEffect(() => {
    load();
    fetch("/api/tenant-data").then(r => r.json()).then(d => { setContacts(d.contacts || []); setServices(d.services || []); })
      .catch(() => setMsg({ ok: false, text: "No se pudieron cargar clientas/servicios." }));
  }, []);
  function load() {
    fetch("/api/appointments").then(r => r.json()).then(d => setAppts(d.appointments || []))
      .catch(() => setMsg({ ok: false, text: "No se pudieron cargar los turnos." }));
  }
  async function crear(e) {
    e.preventDefault(); setMsg(null);
    try {
      const res = await fetch("/api/appointments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const d = await res.json();
      if (d.ok) { setMsg({ ok: true, text: "Turno agendado ✓" }); setForm({ contact_id: "", service_id: "", inicio: "" }); load(); } else setMsg({ ok: false, text: d.error });
    } catch {
      setMsg({ ok: false, text: "No se pudo conectar con el servidor." });
    }
  }
  const nm = id => contacts.find(c => c.id === id)?.nombre || "—";
  const sv = id => services.find(s => s.id === id)?.nombre || "—";
  const precio = id => services.find(s => s.id === id)?.precio;

  async function cobrarSena(appt) {
    const sugerido = precio(appt.service_id);
    const monto = window.prompt("Monto de la seña (ARS):", sugerido ? Math.round(sugerido * 0.3) : "");
    if (!monto || Number(monto) <= 0) return;
    try {
      const res = await fetch("/api/payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ appointment_id: appt.id, amount: Number(monto) }) });
      const d = await res.json();
      if (d.ok && d.init_point) { window.open(d.init_point, "_blank"); setMsg({ ok: true, text: "Link de pago generado. Se abrió en una pestaña nueva." }); }
      else setMsg({ ok: false, text: d.error || "No se pudo generar el link de pago." });
    } catch {
      setMsg({ ok: false, text: "No se pudo conectar con el servidor." });
    }
  }

  return (
    <>
      <h1>Agenda</h1>
      <p className="lead">Turnos del negocio. Cada uno se guarda en la base.</p>
      <form onSubmit={crear} className="card" style={{ display: "grid", gridTemplateColumns: "1.4fr 1.4fr 1.4fr auto", gap: 8, margin: "16px 0", alignItems: "end" }}>
        <label style={{ margin: 0 }}>Clienta<select required value={form.contact_id} onChange={e => setForm({ ...form, contact_id: e.target.value })}><option value="">…</option>{contacts.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select></label>
        <label style={{ margin: 0 }}>Servicio<select required value={form.service_id} onChange={e => setForm({ ...form, service_id: e.target.value })}><option value="">…</option>{services.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}</select></label>
        <label style={{ margin: 0 }}>Cuándo<input required type="datetime-local" value={form.inicio} onChange={e => setForm({ ...form, inicio: e.target.value })} /></label>
        <button className="btn">+ Turno</button>
      </form>
      {msg && <p className={msg.ok ? "ok" : "err"}>{msg.text}</p>}
      <div className="card">
        <table>
          <thead><tr><th>Cuándo</th><th>Clienta</th><th>Servicio</th><th>Estado</th><th>Seña</th><th></th></tr></thead>
          <tbody>
            {appts.map(a => (
              <tr key={a.id}>
                <td>{new Date(a.inicio).toLocaleString("es-AR")}</td>
                <td>{nm(a.contact_id)}</td>
                <td>{sv(a.service_id)}</td>
                <td><span className="pill lead">{a.estado}</span></td>
                <td>{a.sena_pagada ? <span className="pill act">Pagada</span> : <span className="pill inact">Pendiente</span>}</td>
                <td>{!a.sena_pagada && <button className="btn btn-ghost" style={{ padding: "6px 14px" }} onClick={() => cobrarSena(a)}>Cobrar seña</button>}</td>
              </tr>
            ))}
            {appts.length === 0 && <tr><td colSpan="6" className="muted">Sin turnos todavía.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
