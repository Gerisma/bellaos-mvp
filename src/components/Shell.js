"use client";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
const items = [
  { h: "/", ic: "📊", t: "Inicio" },
  { h: "/probador", ic: "🤖", t: "Probador" },
  { h: "/conversaciones", ic: "💬", t: "Conversaciones" },
  { h: "/panel", ic: "👥", t: "Contactos" },
  { h: "/agenda", ic: "📅", t: "Agenda" },
  { h: "/reactivador", ic: "💎", t: "Reactivador" },
  { h: "/informes", ic: "📈", t: "Informes" },
];
const PUBLIC_PAGES = ["/login", "/signup"];

export default function Shell({ children }) {
  const p = usePathname() || "/";
  const active = (h) => (h === "/" ? p === "/" : p.startsWith(h));
  const [email, setEmail] = useState(null);

  useEffect(() => {
    if (PUBLIC_PAGES.includes(p)) return;
    supabaseBrowser().auth.getUser().then(({ data }) => setEmail(data?.user?.email || null));
  }, [p]);

  async function logout() {
    await supabaseBrowser().auth.signOut();
    window.location.href = "/login";
  }

  if (PUBLIC_PAGES.includes(p)) return children;

  return (
    <div className="layout">
      <aside className="side">
        <div className="brand"><div className="dot">B</div><div><b>BellaOS</b><small>POWERED BY CONECTAIA</small></div></div>
        <nav>{items.map((i) => (<a key={i.h} href={i.h} className={"nav-item" + (active(i.h) ? " active" : "")}><span className="ic">{i.ic}</span>{i.t}</a>))}</nav>
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
