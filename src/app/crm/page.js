"use client";
import { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

const STAGES = [
  ["lead_nuevo", "Lead nuevo"],
  ["en_conversacion", "En conversación"],
  ["turno_agendado", "Turno agendado"],
  ["activa", "Cliente activa"],
  ["en_riesgo", "En riesgo"],
  ["reactivada", "Reactivada"],
  ["inactiva", "Inactiva"],
];
const COLOR = { lead_nuevo: "#8E89A6", en_conversacion: "#378ADD", turno_agendado: "#6D4AFF", activa: "#1FBF6B", en_riesgo: "#F6A609", reactivada: "#FF5D93", inactiva: "#B4B2A9" };

export default function CRM() {
  const [contacts, setContacts] = useState([]);
  const [error, setError] = useState(null);
  const [dragId, setDragId] = useState(null);
  const [overStage, setOverStage] = useState(null);

  useEffect(() => {
    supabaseBrowser()
      .from("contacts")
      .select("id,nombre,stage,canal,ticket_prom,ultima_visita")
      .order("nombre")
      .then(({ data, error }) => {
        if (error) setError("No se pudieron cargar los contactos.");
        else setContacts(data || []);
      });
  }, []);

  async function moverA(id, stage) {
    setContacts((cs) => cs.map((c) => (c.id === id ? { ...c, stage } : c)));
    const { error } = await supabaseBrowser().from("contacts").update({ stage }).eq("id", id);
    if (error) setError("No se pudo mover la tarjeta. Probá de nuevo.");
  }

  function onDrop(e, stage) {
    e.preventDefault();
    setOverStage(null);
    if (dragId) moverA(dragId, stage);
    setDragId(null);
  }

  const porEtapa = (s) => contacts.filter((c) => c.stage === s);

  return (
    <>
      <h1>CRM · Embudo</h1>
      <p className="lead">Arrastrá una tarjeta de columna para mover a la clienta de etapa.</p>
      {error && <p className="err">{error}</p>}
      <div style={{ display: "flex", gap: 12, marginTop: 16, overflowX: "auto", paddingBottom: 8 }}>
        {STAGES.map(([stage, label]) => (
          <div
            key={stage}
            onDragOver={(e) => { e.preventDefault(); setOverStage(stage); }}
            onDragLeave={() => setOverStage((s) => (s === stage ? null : s))}
            onDrop={(e) => onDrop(e, stage)}
            className="card"
            style={{ minWidth: 220, flex: "0 0 220px", padding: 12, background: overStage === stage ? "#FAF8FF" : undefined, border: overStage === stage ? "1px dashed var(--violeta, #6D4AFF)" : undefined }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: COLOR[stage] }} />
              <b style={{ fontSize: 13 }}>{label}</b>
              <span className="muted" style={{ marginLeft: "auto", fontSize: 12 }}>{porEtapa(stage).length}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 40 }}>
              {porEtapa(stage).map((c) => (
                <div
                  key={c.id}
                  draggable
                  onDragStart={() => setDragId(c.id)}
                  onDragEnd={() => setDragId(null)}
                  style={{ background: "#fff", border: "1px solid #EDEBF6", borderRadius: 10, padding: "8px 10px", cursor: "grab", boxShadow: "0 1px 2px rgba(46,34,112,.06)" }}
                >
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{c.nombre || "Sin nombre"}</div>
                  <div className="muted" style={{ fontSize: 11, marginTop: 2, display: "flex", justifyContent: "space-between" }}>
                    <span style={{ textTransform: "capitalize" }}>{c.canal || "—"}</span>
                    <span>{c.ticket_prom ? "$" + Number(c.ticket_prom).toLocaleString("es-AR") : ""}</span>
                  </div>
                </div>
              ))}
              {porEtapa(stage).length === 0 && <span className="muted" style={{ fontSize: 12 }}>Vacío</span>}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
