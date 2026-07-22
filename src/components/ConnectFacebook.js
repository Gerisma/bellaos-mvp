"use client";
import { useEffect, useState } from "react";

const APP_ID = process.env.NEXT_PUBLIC_META_APP_ID;
// Permisos que hacen falta para leer Páginas, DMs y comentarios de IG/FB.
// Requieren aprobación de Meta (App Review) para usarse con negocios que no
// sean administradores de la app — mientras tanto funciona para vos mismo
// (modo desarrollo). Ver TAREAS_PENDIENTES.md.
const SCOPE = "pages_show_list,pages_messaging,instagram_basic,instagram_manage_messages,pages_manage_metadata,business_management";

export default function ConnectFacebook() {
  const [sdkReady, setSdkReady] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [msg, setMsg] = useState(null);
  const [status, setStatus] = useState(null); // null = cargando

  useEffect(() => {
    fetch("/api/facebook/connect").then(r => r.json()).then(setStatus).catch(() => setStatus({ connected: false }));
  }, []);

  useEffect(() => {
    if (!APP_ID) return;
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
  }, []);

  function iniciar() {
    if (!window.FB) return;
    setConnecting(true); setMsg(null);
    window.FB.login(async (response) => {
      if (!response.authResponse) {
        setMsg({ ok: false, text: "Se canceló la conexión con Facebook." });
        setConnecting(false);
        return;
      }
      try {
        const res = await fetch("/api/facebook/connect", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userAccessToken: response.authResponse.accessToken }),
        });
        const d = await res.json();
        if (d.ok) {
          setMsg({ ok: true, text: `¡Conectado! Página: ${d.page_name}${d.ig_connected ? " (con Instagram vinculado)" : " — sin Instagram Business vinculado a esa Página"}` });
          setStatus({ connected: true, ig_connected: d.ig_connected });
        } else setMsg({ ok: false, text: d.error || "No se pudo completar la conexión." });
      } catch {
        setMsg({ ok: false, text: "No se pudo conectar con el servidor." });
      } finally {
        setConnecting(false);
      }
    }, { scope: SCOPE });
  }

  if (status?.connected) {
    return (
      <div className="card">
        <b>Facebook e Instagram</b>
        <p className="ok" style={{ marginTop: 6, fontSize: 13.5 }}>
          Página conectada{status.ig_connected ? " · Instagram Business vinculado ✓" : " · sin Instagram Business vinculado"}.
        </p>
        <p className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>
          La bandeja de Conversaciones todavía no recibe estos mensajes automáticamente — falta el adapter (ver Tareas Pendientes).
        </p>
      </div>
    );
  }

  if (!APP_ID) {
    return (
      <div className="card" style={{ background: "#FBFAFE" }}>
        <b>Facebook e Instagram</b>
        <p className="muted" style={{ marginTop: 6, fontSize: 13.5 }}>
          Todavía no está disponible (falta configurar la app de Meta). Escribinos a <b>info@conectaiapro.com</b> mientras tanto.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <b>Facebook e Instagram</b>
      <p className="muted" style={{ margin: "6px 0 14px", fontSize: 13.5 }}>
        Conectá tu Página de Facebook (y tu Instagram Business si está vinculado) para más adelante recibir DMs y comentarios acá mismo.
      </p>
      <button className="btn" disabled={!sdkReady || connecting} onClick={iniciar}>
        {connecting ? "Conectando…" : "Conectar Facebook / Instagram"}
      </button>
      {msg && <p className={msg.ok ? "ok" : "err"} style={{ marginTop: 12 }}>{msg.text}</p>}
    </div>
  );
}
