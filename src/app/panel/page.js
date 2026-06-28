"use client";
import { useState, useEffect } from "react";
import { useTenants } from "@/hooks/useTenants";
const pill = (s) => {
  const m = { activa: "act", reactivada: "act", inactiva: "inact", en_riesgo: "riesgo", lead_nuevo: "lead", turno_agendado: "lead" };
  return <span className={"pill " + (m[s] || "lead")}>{s}</span>;
};
export default function Panel() {
  const { tenants, tenantId, setTenantId, error: tenantsError } = useTenants();
  const [contacts, setContacts] = useState([]); const [error, setError] = useState(null);
  useEffect(() => {
    if (!tenantId) return;
    fetch(`/api/tenant-data?tenant_id=${tenantId}`).then(r => r.json()).then(d => { setContacts(d.contacts || []); setError(d.error || null); }).catch(() => setError("No se pudieron cargar los contactos."));
  }, [tenantId]);
  return (
    <>
      <h1>Contactos</h1>
      <p className="lead">Clientas del negocio, leídas en vivo desde Supabase.</p>
      {tenants.length === 0 && !tenantsError && <p className="muted">No hay negocios todavía. Creá uno en /onboarding.</p>}
      {tenants.length > 0 && (
        <select className="selw" value={tenantId} onChange={e => setTenantId(e.target.value)}>
          {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      )}
      {(tenantsError || error) && <p className="err">{tenantsError || error}</p>}
      <div className="card">
        <table>
          <thead><tr><th>Clienta</th><th>Canal</th><th>Etapa</th><th>Ticket</th></tr></thead>
          <tbody>
            {contacts.map((c, i) => (<tr key={c.id || i}><td><b>{c.nombre}</b></td><td style={{ textTransform: "capitalize" }}>{c.canal}</td><td>{pill(c.stage)}</td><td>{c.ticket_prom ? "$" + Number(c.ticket_prom).toLocaleString("es-AR") : "—"}</td></tr>))}
            {contacts.length === 0 && !error && <tr><td colSpan="4" className="muted">Sin contactos todavía.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
