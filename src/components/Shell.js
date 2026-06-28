"use client";
import { usePathname } from "next/navigation";
const items = [
  { h: "/", ic: "📊", t: "Inicio" },
  { h: "/onboarding", ic: "➕", t: "Alta de negocio" },
  { h: "/probador", ic: "🤖", t: "Probador" },
  { h: "/conversaciones", ic: "💬", t: "Conversaciones" },
  { h: "/panel", ic: "👥", t: "Contactos" },
  { h: "/agenda", ic: "📅", t: "Agenda" },
  { h: "/reactivador", ic: "💎", t: "Reactivador" },
  { h: "/informes", ic: "📈", t: "Informes" },
];
export default function Shell({ children }) {
  const p = usePathname() || "/";
  const active = (h) => (h === "/" ? p === "/" : p.startsWith(h));
  return (
    <div className="layout">
      <aside className="side">
        <div className="brand"><div className="dot">B</div><div><b>BellaOS</b><small>POWERED BY CONECTAIA</small></div></div>
        <nav>{items.map((i) => (<a key={i.h} href={i.h} className={"nav-item" + (active(i.h) ? " active" : "")}><span className="ic">{i.ic}</span>{i.t}</a>))}</nav>
        <div className="promo">✨ Todo automático<br /><span>La IA atiende, agenda y fideliza por vos.</span></div>
      </aside>
      <main className="main"><div className="content">{children}</div></main>
    </div>
  );
}
