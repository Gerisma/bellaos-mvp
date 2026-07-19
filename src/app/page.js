const PRODUCTOS = [
  { nombre: "BellaOS", desc: "Automatización con IA para estéticas, peluquerías y centros de bienestar: atiende WhatsApp, agenda turnos y fideliza clientas.", disponible: true },
  { nombre: "Próximamente", desc: "Estamos preparando soluciones para inmobiliarias, concesionarias y más rubros.", disponible: false },
];

export default function LandingConectaIA() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 36px", maxWidth: 1040, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 13, background: "var(--grad)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1.25rem", color: "#fff" }}>C</div>
          <b style={{ fontSize: "1.3rem" }}>Conectaia PRO</b>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <a href="/login" className="btn btn-ghost">Iniciar sesión</a>
          <a href="/signup" className="btn">Empezar gratis</a>
        </div>
      </header>

      <main style={{ maxWidth: 1040, margin: "0 auto", padding: "40px 36px 80px" }}>
        <h1 style={{ fontSize: "2.2rem", maxWidth: 640 }}>Soluciones de inteligencia artificial para que tu negocio atienda solo</h1>
        <p className="lead" style={{ fontSize: "1.05rem", maxWidth: 560, marginTop: 12 }}>
          Conectaia PRO desarrolla productos con IA para distintos rubros. Nuestro primer producto,
          BellaOS, ya atiende por WhatsApp a estéticas y peluquerías las 24 horas.
        </p>

        <div className="grid2" style={{ marginTop: 40 }}>
          {PRODUCTOS.map((p) => (
            <div key={p.nombre} className="card" style={{ opacity: p.disponible ? 1 : 0.6 }}>
              <b style={{ fontSize: "1.15rem" }}>{p.nombre}</b>
              <p className="muted" style={{ marginTop: 8, fontSize: 14 }}>{p.desc}</p>
              {p.disponible && (
                <a href="/signup" className="btn" style={{ marginTop: 16, display: "inline-block" }}>Probar BellaOS →</a>
              )}
            </div>
          ))}
        </div>
      </main>

      <footer style={{ maxWidth: 1040, margin: "0 auto", padding: "24px 36px", display: "flex", justifyContent: "space-between", color: "var(--suave)", fontSize: 13 }}>
        <span>Conectaia PRO — info@conectaiapro.com</span>
        <span><a href="/privacidad">Privacidad</a> · <a href="/terminos">Términos</a></span>
      </footer>
    </div>
  );
}
