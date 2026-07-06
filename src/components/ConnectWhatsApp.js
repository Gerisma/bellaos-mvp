"use client";
import { useEffect, useState } from "react";

// Botón de alta self-service de WhatsApp (Embedded Signup de Meta). Solo se
// activa cuando la app de Meta ya es Tech Provider y tiene un
// configuration_id de Embedded Signup (ver HANDOFF_CLAUDE_CODE.md, bloque
// "Embedded Signup"). Hasta entonces se muestra un aviso y no carga el SDK.
const APP_ID = process.env.NEXT_PUBLIC_META_APP_ID;
const CONFIG_ID = process.env.NEXT_PUBLIC_META_CONFIG_ID;

export default function ConnectWhatsApp() {
  const [sdkReady, setSdkReady] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [msg, setMsg] = useState(null);
  const [connected, setConnected] = useState(null); // null = cargando

  useEffect(() => {
    fetch("/api/whatsapp/connect").then(r => r.json()).then(d => setConnected(!!d.connected)).catch(() => setConnected(false));
  }, []);

  useEffect(() => {
    if (!APP_ID || !CONFIG_ID) return;

    window.fbAsyncInit = function () {
      window.FB.init({ appId: APP_ID, autoLogAppEvents: true, xfbml: false, version: "v20.0" });
      setSdkReady(true);
    };
    if (!document.getElementById("facebook-jssdk")) {
      const script = document.createElement("script");
      script.id = "facebook-jssdk";
      script.src = "https://connect.facebook.net/es_LA/sdk.js";
      script.async = true;
      document.body.appendChild(script);
    } else if (window.FB) {
      setSdkReady(true);
    }

    function onMessage(event) {
      if (!event.origin?.endsWith("facebook.com")) return;
      try {
        const data = JSON.parse(event.data);
        if (data.type === "WA_EMBEDDED_SIGNUP" && data.event === "FINISH") {
          completar(data.data?.waba_id, data.data?.phone_number_id);
        }
      } catch { /* mensajes que no son del Embedded Signup */ }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  async function completar(wabaId, phoneNumberId) {
    if (!wabaId || !phoneNumberId) return;
    setConnecting(true); setMsg(null);
    try {
      const res = await fetch("/api/whatsapp/connect", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ waba_id: wabaId, phone_number_id: phoneNumberId }),
      });
      const d = await res.json();
      if (d.ok) { setMsg({ ok: true, text: "¡WhatsApp conectado!" }); setConnected(true); }
      else setMsg({ ok: false, text: d.error || "No se pudo completar la conexión." });
    } catch {
      setMsg({ ok: false, text: "No se pudo conectar con el servidor." });
    } finally {
      setConnecting(false);
    }
  }

  function iniciar() {
    if (!window.FB) return;
    window.FB.login(
      (response) => {
        if (!response.authResponse) setMsg({ ok: false, text: "Se canceló la conexión con Facebook." });
        // El waba_id/phone_number_id llegan por window.message (evento FINISH);
        // el completar() de arriba se dispara solo cuando Meta los manda.
      },
      {
        config_id: CONFIG_ID,
        response_type: "code",
        override_default_response_type: true,
        extras: { feature: "whatsapp_embedded_signup", sessionInfoVersion: "3" },
      }
    );
  }

  if (connected !== false) return null; // cargando o ya conectado: no mostrar nada

  if (!APP_ID || !CONFIG_ID) {
    return (
      <div className="card" style={{ background: "#FBFAFE" }}>
        <b>Conectar WhatsApp</b>
        <p className="muted" style={{ marginTop: 6, fontSize: 13.5 }}>
          Todavía no está disponible el alta automática (falta habilitar Embedded Signup en Meta).
          Mientras tanto, escribinos a <b>info@conectaiapro.com</b> y te conectamos tu WhatsApp nosotros.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <b>Conectar WhatsApp</b>
      <p className="muted" style={{ margin: "6px 0 14px", fontSize: 13.5 }}>
        Conectá tu WhatsApp Business en un par de clics. Vas a iniciar sesión con Facebook y elegir tu número.
      </p>
      <button className="btn" disabled={!sdkReady || connecting} onClick={iniciar}>
        {connecting ? "Conectando…" : "Conectar WhatsApp"}
      </button>
      {msg && <p className={msg.ok ? "ok" : "err"} style={{ marginTop: 12 }}>{msg.text}</p>}
    </div>
  );
}
