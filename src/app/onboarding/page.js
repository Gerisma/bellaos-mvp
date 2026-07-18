"use client";
import { useState } from "react";
import CardCapture from "@/components/CardCapture";

const MP_ENABLED = !!process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;

export default function Onboarding() {
  const [step, setStep] = useState("negocio"); // negocio -> tarjeta
  const [f, setF] = useState({ name: "", tono: "cercano", diferencial: "", horarios: "", direccion: "" });
  const [services, setServices] = useState([{ nombre: "", precio: "", duracion_min: "", recompra_dias: "" }]);
  const [msg, setMsg] = useState(null); const [loading, setLoading] = useState(false);
  const [cardSaved, setCardSaved] = useState(false);
  const upd = (k, v) => setF({ ...f, [k]: v });
  const updS = (i, k, v) => { const n = [...services]; n[i][k] = v; setServices(n); };
  const addS = () => setServices([...services, { nombre: "", precio: "", duracion_min: "", recompra_dias: "" }]);

  async function submit(e) {
    e.preventDefault(); setLoading(true); setMsg(null);
    try {
      const res = await fetch("/api/tenants", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, services }) });
      const data = await res.json();
      if (data.ok) setStep("tarjeta");
      else setMsg({ ok: false, text: data.error || "Error" });
    } catch {
      setMsg({ ok: false, text: "No se pudo conectar con el servidor. Probá de nuevo." });
    } finally {
      setLoading(false);
    }
  }

  if (step === "tarjeta") {
    return (
      <>
        <h1>¡Ya casi! Un último paso</h1>
        <p className="lead">
          Tenés 15 días de prueba gratis. Cargá tu tarjeta para reservar tu lugar — no se
          te cobra nada hasta que vos confirmes que querés seguir, pasados los 15 días.
        </p>
        <div style={{ maxWidth: 420 }}>
          <CardCapture onSaved={() => setCardSaved(true)} />
          {(cardSaved || !MP_ENABLED) && (
            <button className="btn" style={{ marginTop: 16, width: "100%" }} onClick={() => (window.location.href = "/inicio")}>
              {cardSaved ? "Listo, ir al panel →" : "Continuar sin tarjeta por ahora →"}
            </button>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <h1>Alta de negocio</h1>
      <p className="lead">Cargá una estética: sus datos y servicios. Se guarda en Supabase.</p>
      <form onSubmit={submit} style={{ maxWidth: 620 }}>
        <div className="card">
          <label>Nombre del negocio<input value={f.name} onChange={e => upd("name", e.target.value)} required /></label>
          <label>Tono<select value={f.tono} onChange={e => upd("tono", e.target.value)}><option value="cercano">Cercano</option><option value="formal">Formal</option><option value="divertido">Divertido</option></select></label>
          <label>Diferencial<input value={f.diferencial} onChange={e => upd("diferencial", e.target.value)} /></label>
          <label>Horarios<input value={f.horarios} onChange={e => upd("horarios", e.target.value)} placeholder="Lun a Sáb 9 a 19" /></label>
          <label>Dirección<input value={f.direccion} onChange={e => upd("direccion", e.target.value)} /></label>
        </div>
        <h3 style={{ margin: "22px 0 10px" }}>Servicios</h3>
        <div className="card">
          {services.map((s, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.2fr", gap: 8, marginBottom: 8 }}>
              <input placeholder="Servicio" value={s.nombre} onChange={e => updS(i, "nombre", e.target.value)} />
              <input placeholder="Precio" value={s.precio} onChange={e => updS(i, "precio", e.target.value)} />
              <input placeholder="Min" value={s.duracion_min} onChange={e => updS(i, "duracion_min", e.target.value)} />
              <input placeholder="Recompra días" value={s.recompra_dias} onChange={e => updS(i, "recompra_dias", e.target.value)} />
            </div>
          ))}
          <button type="button" className="btn btn-ghost" onClick={addS} style={{ marginTop: 4 }}>+ Agregar servicio</button>
        </div>
        <div style={{ marginTop: 18 }}><button className="btn" disabled={loading}>{loading ? "Creando…" : "Crear negocio"}</button></div>
      </form>
      {msg && <p className={msg.ok ? "ok" : "err"} style={{ marginTop: 14 }}>{msg.text}</p>}
    </>
  );
}
