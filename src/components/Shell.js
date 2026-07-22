"use client";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
const items = [
  { h: "/inicio", ic: "📊", t: "Inicio" },
  { h: "/entrenador", ic: "🎓", t: "Entrenador" },
  { h: "/conversaciones", ic: "💬", t: "Conversaciones" },
  { h: "/panel", ic: "👥", t: "Contactos" },
  { h: "/crm", ic: "🗂️", t: "CRM · Embudo" },
  { h: "/agenda", ic: "📅", t: "Agenda" },
  { h: "/reactivador", ic: "💎", t: "Reactivador" },
  { h: "/contenido", ic: "✨", t: "Contenido IA" },
  { h: "/informes", ic: "📈", t: "Informes" },
  { h: "/simulador-roi", ic: "🧮", t: "Simulador ROI" },
  { h: "/ajustes", ic: "⚙️", t: "Ajustes" },
];
const PUBLIC_PAGES = ["/", "/login", "/signup", "/terminos", "/privacidad"];

export default function Shell({ children }) {
  const p = usePathname() || "/";
  const active = (h) => p.startsWith(h);
  const [email, setEmail] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);

  useEffect(() => {
    if (PUBLIC_PAGES.includes(p)) return;
    const sb = supabaseBrowser();
    sb.auth.getUser().then(({ data }) => setEmail(data?.user?.email || null));
    // RLS ya restringe estas lecturas a la propia fila (perfil propio / tenant
    // propio), así que no hace falta filtrar por id acá.
    sb.from("profiles").select("is_platform_admin").maybeSingle().then(({ data }) => setIsAdmin(!!data?.is_platform_admin));
    sb.from("tenants").select("logo_url").maybeSingle().then(({ data }) => setLogoUrl(data?.logo_url || null));
  }, [p]);

  async function logout() {
    await supabaseBrowser().auth.signOut();
    window.location.href = "/login";
  }

  if (PUBLIC_PAGES.includes(p)) return children;

  const navItems = isAdmin ? [...items, { h: "/admin", ic: "🛠️", t: "Admin" }] : items;

  return (
    <div className="layout">
      <aside className="side">
        <div className="brand">
          {logoUrl ? <img src={logoUrl} alt="" className="dot" style={{ objectFit: "cover" }} /> : <div className="dot">B</div>}
          <div><b>BellaOS</b><small>POWERED BY CONECTAIA PRO</small></div>
        </div>
        <nav>{navItems.map((i) => (<a key={i.h} href={i.h} className={"nav-item" + (active(i.h) ? " active" : "")}><span className="ic">{i.ic}</span>{i.t}</a>))}</nav>
        <div className="promo">✨ Todo automático<br /><span>La IA atiende, agenda y fideliza por vos.</span></div>
      </aside>
      <main className="main">
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12, padding: "16px 36px 0" }}>
          {email && <span className="muted" style={{ fontSize: 13 }}>{email}</span>}
          <button className="btn btn-ghost" style={{ padding: "8px 16px" }} onClick={logout}>Cerrar sesión</button>
        </div>
        <div className="content">{children}</div>
      </main>
    </div>
  );
}
