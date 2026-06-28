"use client";
import { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
const pill = (s) => {
  const m = { activa: "act", reactivada: "act", inactiva: "inact", en_riesgo: "riesgo", lead_nuevo: "lead", turno_agendado: "lead" };
  return <span className={"pill " + (m[s] || "lead")}>{s}</span>;
};
export default function Panel() {
  const [contacts, setContacts] = useState([]); const [error, setError] = useState(null);
  const [q, setQ] = useState("");
  useEffect(() => {
    // Lectura directa client-side: sin pasar por una ruta API ni service_role.
    // RLS (vía profiles) garantiza que solo se ven los contactos del propio tenant.
    supabaseBrowser()
      .from("contacts")
      .select("id,nombre,stage,canal,ultima_visita,ticket_prom")
      .order("nombre")
      .then(({ data, error }) => {
        if (error) setError("No se pudieron cargar los contactos.");
        else setContacts(data || []);
      });
  }, []);
  const visibles = q.trim() ? contacts.filter(c => c.nombre?.toLowerCase().includes(q.trim().toLowerCase())) : contacts;
  return (
    <>
      <h1>Contactos</h1>
      <p className="lead">Clientas del negocio, leídas en vivo desde Supabase.</p>
      {error && <p className="err">{error}</p>}
      {contacts.length > 0 && (
        <input className="selw" placeholder="Buscar por nombre…" value={q} onChange={e => setQ(e.target.value)} />
      )}
      <div className="card">
        <table>
          <thead><tr><th>Clienta</th><th>Canal</th><th>Etapa</th><th>Ticket</th></tr></thead>
          <tbody>
            {visibles.map((c, i) => (<tr key={c.id || i}><td><b>{c.nombre}</b></td><td style={{ textTransform: "capitalize" }}>{c.canal}</td><td>{pill(c.stage)}</td><td>{c.ticket_prom ? "$" + Number(c.ticket_prom).toLocaleString("es-AR") : "—"}</td></tr>))}
            {visibles.length === 0 && !error && <tr><td colSpan="4" className="muted">{contacts.length === 0 ? "Sin contactos todavía." : "Sin resultados para esa búsqueda."}</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
