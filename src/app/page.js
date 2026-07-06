"use client";
import ConnectWhatsApp from "@/components/ConnectWhatsApp";
const tiles = [
  { h: "/probador", ic: "🤖", t: "Probador del asistente", s: "Chateá con el cerebro" },
  { h: "/panel", ic: "👥", t: "Contactos", s: "Clientas en Supabase" },
  { h: "/agenda", ic: "📅", t: "Agenda", s: "Turnos en la base" },
  { h: "/reactivador", ic: "💎", t: "Reactivador", s: "Campañas a inactivas" },
  { h: "/informes", ic: "📈", t: "Informes", s: "Rendimiento del negocio" },
];
export default function Home() {
  return (
    <>
      <h1>Hola 👋</h1>
      <p className="lead">Tu negocio funcionando con IA. Elegí una sección para empezar.</p>
      <div style={{ marginBottom: 20 }}><ConnectWhatsApp /></div>
      <div className="tiles">
        {tiles.map((t) => (
          <a key={t.h} href={t.h} className="tile"><div style={{ fontSize: "1.6rem" }}>{t.ic}</div><b>{t.t}</b><br /><span>{t.s}</span></a>
        ))}
      </div>
    </>
  );
}
