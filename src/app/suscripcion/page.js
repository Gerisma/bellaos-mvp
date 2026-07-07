"use client";
import { useEffect, useState } from "react";
import CardCapture from "@/components/CardCapture";
import ConfirmCardCVV from "@/components/ConfirmCardCVV";

const fmt = (n) => "$" + Math.round(n || 0).toLocaleString("es-AR");

export default function Suscripcion() {
  const [d, setD] = useState(null);
  const [confirmado, setConfirmado] = useState(false);

  function cargar() {
    fetch("/api/billing/status").then(r => r.json()).then(setD).catch(() => setD({ error: true }));
  }
  useEffect(cargar, []);

  if (confirmado) {
    return (
      <>
        <h1>¡Listo! 🎉</h1>
        <p className="lead">Tu suscripción quedó activa. Ya podés seguir usando BellaOS con normalidad.</p>
        <a href="/" className="btn">Ir al panel →</a>
      </>
    );
  }

  if (!d) return <p className="muted">Cargando…</p>;
  if (d.error) return <p className="err">No se pudo cargar tu información. Recargá la página.</p>;

  const vencida = d.billing_status === "bloqueado";

  return (
    <>
      <h1>{vencida ? "Tu prueba de 15 días terminó" : "Tu suscripción"}</h1>
      <p className="lead">
        {vencida
          ? "Para seguir usando BellaOS (el bot, la agenda, el reactivador y los informes), confirmá tu suscripción mensual."
          : d.dias_restantes != null
            ? `Te quedan ${d.dias_restantes} día${d.dias_restantes === 1 ? "" : "s"} de prueba gratis.`
            : "Revisá el estado de tu cuenta."}
      </p>
      <div className="card" style={{ maxWidth: 420 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          <span className="muted">Plan mensual</span>
          <b>{fmt(d.precio_mensual)}/mes</b>
        </div>
        {d.mp_card_id ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
              <span className="muted">Tarjeta</span>
              <b style={{ textTransform: "capitalize" }}>{d.mp_card_brand} •••• {d.mp_card_last4}</b>
            </div>
            <ConfirmCardCVV cardId={d.mp_card_id} onConfirmed={() => setConfirmado(true)} />
          </>
        ) : (
          <CardCapture onSaved={cargar} />
        )}
      </div>
    </>
  );
}
