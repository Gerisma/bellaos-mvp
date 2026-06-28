"use client";
import { useState, useEffect } from "react";
import { useTenants } from "@/hooks/useTenants";
export default function Agenda() {
  const { tenants, tenantId, setTenantId, error: tenantsError } = useTenants();
  const [appts, setAppts] = useState([]); const [contacts, setContacts] = useState([]); const [services, setServices] = useState([]);
  const [form, setForm] = useState({ contact_id: "", service_id: "", inicio: "" }); const [msg, setMsg] = useState(null);
  useEffect(() => {
    if (!tenantId) return;
    load();
    fetch(`/api/tenant-data?tenant_id=${tenantId}`).then(r => r.json()).then(d => { setContacts(d.contacts || []); setServices(d.services || []); })
      .catch(() => setMsg({ ok: false, text: "No se pudieron cargar clientas/servicios." }));
  }, [tenantId]);
  function load() {
    fetch(`/api/appointments?tenant_id=${tenantId}`).then(r => r.json()).then(d => setAppts(d.appointments || []))
      .catch(() => setMsg({ ok: false, text: "No se pudieron cargar los turnos." }));
  }
  async function crear(e) {
    e.preventDefault(); setMsg(null);
    try {
      const res = await fetch("/api/appointments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tenant_id: tenantId, ...form }) });
      const d = await res.json();
      if (d.ok) { setMsg({ ok: true, text: "Turno agendado ✓" }); setForm({ contact_id: "", service_id: "", inicio: "" }); load(); } else setMsg({ ok: false, text: d.error });
    } catch {
      setMsg({ ok: false, text: "No se pudo conectar con el servidor." });
    }
  }
  const nm = id => contacts.find(c => c.id === id)?.nombre || "—";
  const sv = id => services.find(s => s.id === id)?.nombre || "—";
  return (
    <>
      <h1>Agenda</h1>
      <p className="lead">Turnos del negocio. Cada uno se guarda en la base.</p>
      {tenantsError && <p className="err">{tenantsError}</p>}
      {tenants.length === 0 && !tenantsError ? (
        <p className="muted">No hay negocios todavía. Creá uno en /onboarding.</p>
      ) : (
        <>
          <select className="selw" value={tenantId} onChange={e => setTenantId(e.target.value)}>{tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
          <form onSubmit={crear} className="card" style={{ display: "grid", gridTemplateColumns: "1.4fr 1.4fr 1.4fr auto", gap: 8, margin: "16px 0", alignItems: "end" }}>
            <label style={{ margin: 0 }}>Clienta<select required value={form.contact_id} onChange={e => setForm({ ...form, contact_id: e.target.value })}><option value="">…</option>{contacts.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select></label>
            <label style={{ margin: 0 }}>Servicio<select required value={form.service_id} onChange={e => setForm({ ...form, service_id: e.target.value })}><option value="">…</option>{services.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}</select></label>
            <label style={{ margin: 0 }}>Cuándo<input required type="datetime-local" value={form.inicio} onChange={e => setForm({ ...form, inicio: e.target.value })} /></label>
            <button className="btn">+ Turno</button>
          </form>
          {msg && <p className={msg.ok ? "ok" : "err"}>{msg.text}</p>}
          <div className="card">
            <table>
              <thead><tr><th>Cuándo</th><th>Clienta</th><th>Servicio</th><th>Estado</th></tr></thead>
              <tbody>
                {appts.map(a => <tr key={a.id}><td>{new Date(a.inicio).toLocaleString("es-AR")}</td><td>{nm(a.contact_id)}</td><td>{sv(a.service_id)}</td><td><span className="pill lead">{a.estado}</span></td></tr>)}
                {appts.length === 0 && <tr><td colSpan="4" className="muted">Sin turnos todavía.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
