"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

const fmt = (n) => "$" + Math.round(n || 0).toLocaleString("es-AR");

export default function Tienda() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [cart, setCart] = useState({}); // product_id -> cantidad
  const [datos, setDatos] = useState({ nombre: "", telefono: "" });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/tienda/${slug}`).then((r) => r.json()).then(setData).catch(() => setData({ error: true }));
  }, [slug]);

  function sumar(id, delta, stock) {
    setCart((c) => {
      const actual = c[id] || 0;
      const next = Math.max(0, Math.min(stock, actual + delta));
      return { ...c, [id]: next };
    });
  }

  const productos = data?.products || [];
  const items = Object.entries(cart).filter(([, c]) => c > 0);
  const total = items.reduce((acc, [id, c]) => {
    const p = productos.find((x) => x.id === id);
    return acc + (p ? p.precio * c : 0);
  }, 0);

  async function comprar() {
    setLoading(true); setMsg(null);
    try {
      const res = await fetch(`/api/tienda/${slug}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.map(([product_id, cantidad]) => ({ product_id, cantidad })), nombre: datos.nombre, telefono: datos.telefono }),
      });
      const d = await res.json();
      if (d.ok && d.init_point) window.location.href = d.init_point;
      else setMsg({ ok: false, text: d.error || "No se pudo iniciar el pago." });
    } catch {
      setMsg({ ok: false, text: "No se pudo conectar con el servidor." });
    } finally {
      setLoading(false);
    }
  }

  if (!data) return <div style={{ maxWidth: 900, margin: "40px auto", padding: 24 }}>Cargando…</div>;
  if (data.error || !data.tenant) return <div style={{ maxWidth: 900, margin: "40px auto", padding: 24 }}>Tienda no encontrada.</div>;

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        {data.tenant.logo_url && <img src={data.tenant.logo_url} alt="" style={{ width: 44, height: 44, borderRadius: 12, objectFit: "cover" }} />}
        <h1 style={{ fontSize: 24, margin: 0 }}>{data.tenant.name}</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, alignItems: "start" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
          {productos.map((p) => (
            <div key={p.id} style={{ border: "1px solid #EDEBF6", borderRadius: 14, padding: 12 }}>
              <div style={{ width: "100%", height: 120, borderRadius: 10, background: "#F4F3FB", overflow: "hidden", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {p.imagen_url ? <img src={p.imagen_url} alt={p.nombre} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ color: "#8E89A6", fontSize: 12 }}>Sin foto</span>}
              </div>
              <b style={{ fontSize: 14 }}>{p.nombre}</b>
              {p.descripcion && <p style={{ fontSize: 12.5, color: "#6b6b8a", margin: "4px 0" }}>{p.descripcion}</p>}
              <div style={{ fontWeight: 700, marginTop: 6 }}>{fmt(p.precio)}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                <button onClick={() => sumar(p.id, -1, p.stock)} style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid #EDEBF6", background: "#fff" }}>−</button>
                <span style={{ minWidth: 18, textAlign: "center" }}>{cart[p.id] || 0}</span>
                <button onClick={() => sumar(p.id, 1, p.stock)} style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid #EDEBF6", background: "#fff" }}>+</button>
              </div>
            </div>
          ))}
          {productos.length === 0 && <p style={{ color: "#6b6b8a" }}>Todavía no hay productos publicados.</p>}
        </div>

        <div style={{ border: "1px solid #EDEBF6", borderRadius: 14, padding: 16, position: "sticky", top: 24 }}>
          <b>Tu pedido</b>
          <div style={{ margin: "12px 0" }}>
            {items.length === 0 && <span style={{ color: "#6b6b8a", fontSize: 13 }}>Vacío</span>}
            {items.map(([id, c]) => {
              const p = productos.find((x) => x.id === id);
              if (!p) return null;
              return <div key={id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0" }}><span>{c}× {p.nombre}</span><b>{fmt(p.precio * c)}</b></div>;
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, borderTop: "1px solid #EDEBF6", paddingTop: 10 }}>
            <span>Total</span><span>{fmt(total)}</span>
          </div>
          {items.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <input placeholder="Tu nombre" value={datos.nombre} onChange={(e) => setDatos({ ...datos, nombre: e.target.value })} style={{ width: "100%", marginBottom: 8, padding: 8, borderRadius: 8, border: "1px solid #EDEBF6" }} />
              <input placeholder="Tu WhatsApp" value={datos.telefono} onChange={(e) => setDatos({ ...datos, telefono: e.target.value })} style={{ width: "100%", marginBottom: 10, padding: 8, borderRadius: 8, border: "1px solid #EDEBF6" }} />
              <button onClick={comprar} disabled={loading || !datos.nombre || !datos.telefono} style={{ width: "100%", padding: 12, borderRadius: 10, background: "#6D4AFF", color: "#fff", border: "none", fontWeight: 700 }}>
                {loading ? "Redirigiendo…" : "Pagar con MercadoPago"}
              </button>
            </div>
          )}
          {msg && <p style={{ color: msg.ok ? "#1FBF6B" : "#F2545B", fontSize: 13, marginTop: 10 }}>{msg.text}</p>}
        </div>
      </div>
    </div>
  );
}
