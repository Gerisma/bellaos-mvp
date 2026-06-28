import { supabaseAdmin } from "@/lib/supabase";
export const dynamic = "force-dynamic";
const pill = (s) => {
  const m = { activa: "act", reactivada: "act", inactiva: "inact", en_riesgo: "riesgo", lead_nuevo: "lead", turno_agendado: "lead" };
  return <span className={"pill " + (m[s] || "lead")}>{s}</span>;
};
export default async function Panel() {
  let contacts = [], error = null;
  try { const sb = supabaseAdmin(); const { data } = await sb.from("contacts").select("nombre,canal,stage,ticket_prom").order("nombre").limit(50); contacts = data || []; }
  catch (e) { error = "Configurá las credenciales de Supabase en .env.local"; }
  return (
    <>
      <h1>Contactos</h1>
      <p className="lead">Clientas del negocio, leídas en vivo desde Supabase.</p>
      {error && <p className="err">{error}</p>}
      <div className="card">
        <table>
          <thead><tr><th>Clienta</th><th>Canal</th><th>Etapa</th><th>Ticket</th></tr></thead>
          <tbody>
            {contacts.map((c, i) => (<tr key={i}><td><b>{c.nombre}</b></td><td style={{ textTransform: "capitalize" }}>{c.canal}</td><td>{pill(c.stage)}</td><td>{c.ticket_prom ? "$" + Number(c.ticket_prom).toLocaleString("es-AR") : "—"}</td></tr>))}
            {contacts.length === 0 && !error && <tr><td colSpan="4" className="muted">Sin contactos todavía.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
