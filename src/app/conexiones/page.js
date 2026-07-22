"use client";
import { useState, useEffect } from "react";
import ConnectWhatsApp from "@/components/ConnectWhatsApp";
import ConnectFacebook from "@/components/ConnectFacebook";

const GOOGLE_MSG = {
  ok: { ok: true, text: "¡Google Calendar conectado! Los turnos nuevos van a reflejarse ahí." },
  error: { ok: false, text: "No se pudo conectar Google Calendar. Probá de nuevo." },
  sin_refresh_token: { ok: false, text: "Google no dio permiso permanente. Desconectá el acceso en tu cuenta de Google y probá de nuevo." },
};

export default function Conexiones() {
  const [d, setD] = useState(null);
  const [form, setForm] = useState({ notif_whatsapp_telefono: "", notif_email: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [googleMsg, setGoogleMsg] = useState(null);

  useEffect(() => {
    fetch("/api/settings/conexiones").then(r => r.json()).then((data) => {
      setD(data);
      setForm({ notif_whatsapp_telefono: data.notif_whatsapp_telefono || "", notif_email: data.notif_email || "" });
    }).catch(() => setD({}));

    const params = new URLSearchParams(window.location.search);
    const g = params.get("google");
    if (g && GOOGLE_MSG[g]) setGoogleMsg(GOOGLE_MSG[g]);
  }, []);

  async function guardar(e) {
    e.preventDefault(); setSaving(true); setMsg(null);
    try {
      const res = await fetch("/api/settings/conexiones", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.ok) setMsg({ ok: true, text: "Guardado ✓" });
      else setMsg({ ok: false, text: data.error || "No se pudo guardar." });
    } catch {
      setMsg({ ok: false, text: "No se pudo conectar con el servidor." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <h1>Conexiones</h1>
      <p className="lead">Conectá tus canales, a dónde te llegan los avisos y tu Google Calendar.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
        <ConnectWhatsApp />
        <ConnectFacebook />

        <div className="card">
          <b>Google Calendar</b>
          <p className="muted" style={{ margin: "6px 0 14px", fontSize: 13.5 }}>
            Los turnos que agenda BellaOS se reflejan en tu Google Calendar (de solo lectura para vos — BellaOS sigue siendo donde se maneja todo).
          </p>
          {googleMsg && <p className={googleMsg.ok ? "ok" : "err"} style={{ marginBottom: 10 }}>{googleMsg.text}</p>}
          {d?.google_calendar_connected ? (
            <p className="ok" style={{ fontSize: 13.5 }}>Conectado ✓</p>
          ) : (
            <a className="btn" href="/api/google/connect">Conectar Google Calendar</a>
          )}
        </div>

        <form onSubmit={guardar} className="card">
          <b>Notificaciones para vos</b>
          <p className="muted" style={{ margin: "6px 0 14px", fontSize: 13.5 }}>
            Te avisamos por WhatsApp cuando el asistente agenda un turno solo, o cuando una clienta necesita que la atienda una persona.
          </p>
          <label>Tu WhatsApp (con código de país, ej. 549362...)
            <input value={form.notif_whatsapp_telefono} onChange={(e) => setForm({ ...form, notif_whatsapp_telefono: e.target.value })} placeholder="549362XXXXXXX" />
          </label>
          <label>Tu email (para más adelante)
            <input type="email" value={form.notif_email} onChange={(e) => setForm({ ...form, notif_email: e.target.value })} placeholder="vos@tunegocio.com" />
          </label>
          {msg && <p className={msg.ok ? "ok" : "err"} style={{ marginTop: 10 }}>{msg.text}</p>}
          <button className="btn" style={{ marginTop: 14 }} disabled={saving}>{saving ? "Guardando…" : "Guardar"}</button>
        </form>
      </div>
    </>
  );
}
