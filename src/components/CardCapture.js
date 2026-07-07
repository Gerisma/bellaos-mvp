"use client";
import { useEffect, useRef, useState } from "react";

// Captura de tarjeta para la prueba de 15 días, usando MercadoPago Secure
// Fields (SDK v2): el número de tarjeta viaja directo del navegador del
// cliente a MercadoPago y se convierte en un "token" — este componente y
// nuestro servidor NUNCA ven ni guardan el número real. Se manda ese token
// a /api/billing/save-card, que lo adjunta a un Customer de MercadoPago.
//
// Nota para quien retome esto: la integración de Secure Fields de MP se
// probó siguiendo su documentación (https://www.mercadopago.com.ar/developers
// → Suscripciones → Tarjetas), pero no se pudo testear contra una cuenta
// real (no había NEXT_PUBLIC_MP_PUBLIC_KEY configurada al escribir esto).
// Antes de ir a producción, probar el flujo completo con una tarjeta de
// prueba de MercadoPago.
const PUBLIC_KEY = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;

export default function CardCapture({ email, onSaved }) {
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const mpRef = useRef(null);

  useEffect(() => {
    if (!PUBLIC_KEY) return;
    function init() {
      mpRef.current = new window.MercadoPago(PUBLIC_KEY, { locale: "es-AR" });
      setReady(true);
    }
    if (window.MercadoPago) { init(); return; }
    if (!document.getElementById("mp-sdk")) {
      const s = document.createElement("script");
      s.id = "mp-sdk";
      s.src = "https://sdk.mercadopago.com/js/v2";
      s.onload = init;
      document.body.appendChild(s);
    }
  }, []);

  async function guardar(e) {
    e.preventDefault();
    if (!mpRef.current) return;
    setSaving(true); setMsg(null);
    try {
      const form = e.target;
      const token = await mpRef.current.fields.createCardToken({
        cardNumber: form.cardNumber.value.replace(/\s/g, ""),
        cardholderName: form.cardholderName.value,
        cardExpirationMonth: form.expMonth.value,
        cardExpirationYear: form.expYear.value,
        securityCode: form.securityCode.value,
        identificationType: "DNI",
        identificationNumber: form.dni.value,
      });
      const res = await fetch("/api/billing/save-card", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.id, email }),
      });
      const d = await res.json();
      if (d.ok) { setMsg({ ok: true, text: "Tarjeta guardada. No se te cobra nada todavía." }); onSaved?.(); }
      else setMsg({ ok: false, text: d.error || "No se pudo guardar la tarjeta." });
    } catch (err) {
      setMsg({ ok: false, text: "No se pudo procesar la tarjeta. Revisá los datos e intentá de nuevo." });
    } finally {
      setSaving(false);
    }
  }

  if (!PUBLIC_KEY) {
    return (
      <div className="card" style={{ background: "#FBFAFE" }}>
        <b>Tarjeta de crédito</b>
        <p className="muted" style={{ marginTop: 6, fontSize: 13.5 }}>
          Todavía no está habilitado el cobro automático. Por ahora podés seguir sin
          cargar una tarjeta — te avisamos apenas esté disponible.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <b>Tarjeta de crédito</b>
      <p className="muted" style={{ margin: "6px 0 14px", fontSize: 13.5 }}>
        Tenés 15 días de prueba gratis. No se te cobra nada hasta que vos confirmes que
        querés seguir.
      </p>
      <form onSubmit={guardar}>
        <label>Número de tarjeta<input name="cardNumber" required inputMode="numeric" placeholder="4509 9535 6623 3704" /></label>
        <div className="row">
          <label style={{ flex: 1 }}>Mes<input name="expMonth" required maxLength={2} placeholder="MM" /></label>
          <label style={{ flex: 1 }}>Año<input name="expYear" required maxLength={2} placeholder="AA" /></label>
          <label style={{ flex: 1 }}>CVV<input name="securityCode" required maxLength={4} placeholder="123" /></label>
        </div>
        <label>Titular (como figura en la tarjeta)<input name="cardholderName" required placeholder="APELLIDO Nombre" /></label>
        <label>DNI del titular<input name="dni" required inputMode="numeric" placeholder="12345678" /></label>
        {msg && <p className={msg.ok ? "ok" : "err"} style={{ marginTop: 10 }}>{msg.text}</p>}
        <button className="btn" style={{ marginTop: 14 }} disabled={!ready || saving}>{saving ? "Guardando…" : "Guardar tarjeta"}</button>
      </form>
    </div>
  );
}
