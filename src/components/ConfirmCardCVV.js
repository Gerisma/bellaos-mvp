"use client";
import { useEffect, useRef, useState } from "react";

// Re-confirma la tarjeta ya guardada pidiendo solo el CVV (no hace falta
// cargar el número de nuevo). Genera un token fresco de MercadoPago — los
// tokens vencen en minutos, por eso no se puede reusar el de hace 15 días.
const PUBLIC_KEY = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;

export default function ConfirmCardCVV({ cardId, onConfirmed }) {
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const mpRef = useRef(null);

  useEffect(() => {
    if (!PUBLIC_KEY) return;
    function init() { mpRef.current = new window.MercadoPago(PUBLIC_KEY, { locale: "es-AR" }); }
    if (window.MercadoPago) { init(); return; }
    if (!document.getElementById("mp-sdk")) {
      const s = document.createElement("script");
      s.id = "mp-sdk"; s.src = "https://sdk.mercadopago.com/js/v2"; s.onload = init;
      document.body.appendChild(s);
    } else { init(); }
  }, []);

  async function confirmar(e) {
    e.preventDefault();
    if (!mpRef.current) return;
    setLoading(true); setMsg(null);
    try {
      const token = await mpRef.current.fields.createCardToken({ cardId, securityCode: cvv });
      const res = await fetch("/api/billing/confirm", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ card_token: token.id }),
      });
      const d = await res.json();
      if (d.ok) onConfirmed?.();
      else setMsg({ ok: false, text: d.error || "No se pudo confirmar." });
    } catch {
      setMsg({ ok: false, text: "El código de seguridad no es válido. Probá de nuevo." });
    } finally {
      setLoading(false);
    }
  }

  if (!PUBLIC_KEY) return <p className="err">MercadoPago no está configurado todavía. Escribinos a info@conectaiapro.com.</p>;

  return (
    <form onSubmit={confirmar} style={{ maxWidth: 260 }}>
      <label>Código de seguridad (CVV)<input required maxLength={4} inputMode="numeric" value={cvv} onChange={e => setCvv(e.target.value)} placeholder="123" /></label>
      {msg && <p className="err" style={{ marginTop: 10 }}>{msg.text}</p>}
      <button className="btn" style={{ marginTop: 14, width: "100%" }} disabled={loading}>{loading ? "Confirmando…" : "Sí, quiero seguir"}</button>
    </form>
  );
}
