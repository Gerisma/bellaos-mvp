"use client";
import { useState } from "react";

export default function Ajustes() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  function elegir(e) {
    const f = e.target.files?.[0];
    setFile(f || null);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function subir(e) {
    e.preventDefault();
    if (!file) return;
    setSaving(true); setMsg(null);
    try {
      const fd = new FormData();
      fd.append("logo", file);
      const res = await fetch("/api/settings/logo", { method: "POST", body: fd });
      const d = await res.json();
      if (d.ok) { setMsg({ ok: true, text: "¡Logo actualizado! Recargá la página para verlo en el menú." }); }
      else setMsg({ ok: false, text: d.error || "No se pudo subir el logo." });
    } catch {
      setMsg({ ok: false, text: "No se pudo conectar con el servidor." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <h1>Ajustes</h1>
      <p className="lead">Personalizá tu panel con el logo de tu negocio.</p>
      <form onSubmit={subir} className="card" style={{ maxWidth: 420 }}>
        <label>Logo del negocio<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={elegir} /></label>
        <p className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>PNG, JPG, WEBP o SVG · hasta 2MB. Se ve mejor si es cuadrado.</p>
        {preview && <img src={preview} alt="Vista previa" style={{ width: 64, height: 64, borderRadius: 13, objectFit: "cover", marginTop: 12 }} />}
        {msg && <p className={msg.ok ? "ok" : "err"} style={{ marginTop: 12 }}>{msg.text}</p>}
        <button className="btn" style={{ marginTop: 14 }} disabled={!file || saving}>{saving ? "Subiendo…" : "Guardar logo"}</button>
      </form>
    </>
  );
}
