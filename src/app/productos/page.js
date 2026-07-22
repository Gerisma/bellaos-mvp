"use client";
import { useState, useEffect } from "react";

const fmt = (n) => "$" + Math.round(n || 0).toLocaleString("es-AR");

export default function Productos() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ nombre: "", precio: "", stock: "", descripcion: "" });
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);
  const [slug, setSlug] = useState(null);

  function load() {
    fetch("/api/products").then((r) => r.json()).then((d) => setProducts(d.products || []))
      .catch(() => setMsg({ ok: false, text: "No se pudieron cargar los productos." }));
  }
  useEffect(() => {
    load();
    fetch("/api/settings/conexiones").then((r) => r.json()).then((d) => setSlug(d.slug)).catch(() => {});
  }, []);

  async function crear(e) {
    e.preventDefault(); setSaving(true); setMsg(null);
    try {
      const res = await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const d = await res.json();
      if (d.ok) { setForm({ nombre: "", precio: "", stock: "", descripcion: "" }); load(); }
      else setMsg({ ok: false, text: d.error });
    } catch {
      setMsg({ ok: false, text: "No se pudo conectar con el servidor." });
    } finally {
      setSaving(false);
    }
  }

  async function subirImagen(productId, file) {
    const fd = new FormData();
    fd.append("imagen", file);
    fd.append("product_id", productId);
    const res = await fetch("/api/products/imagen", { method: "POST", body: fd });
    const d = await res.json();
    if (d.ok) load(); else setMsg({ ok: false, text: d.error });
  }

  async function toggleActivo(p) {
    await fetch("/api/products", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: p.id, activo: !p.activo }) });
    load();
  }

  async function borrar(id) {
    if (!window.confirm("¿Eliminar este producto?")) return;
    await fetch(`/api/products?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <>
      <h1>Productos</h1>
      <p className="lead">
        Cargá lo que vendés en tu tienda online (perfumes, maquillaje, lo que sea tangible).
        {slug && <> Tu tienda pública: <a href={`/tienda/${slug}`} target="_blank" rel="noreferrer">/tienda/{slug}</a></>}
      </p>

      <form onSubmit={crear} className="card" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 2fr auto", gap: 8, margin: "16px 0", alignItems: "end" }}>
        <label style={{ margin: 0 }}>Nombre<input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></label>
        <label style={{ margin: 0 }}>Precio<input required type="number" min="0" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} /></label>
        <label style={{ margin: 0 }}>Stock<input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></label>
        <label style={{ margin: 0 }}>Descripción<input value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} /></label>
        <button className="btn" disabled={saving}>{saving ? "Guardando…" : "+ Producto"}</button>
      </form>
      {msg && <p className={msg.ok ? "ok" : "err"}>{msg.text}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
        {products.map((p) => (
          <div key={p.id} className="card" style={{ opacity: p.activo ? 1 : 0.55 }}>
            <div style={{ width: "100%", height: 120, borderRadius: 10, background: "#F4F3FB", overflow: "hidden", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {p.imagen_url ? <img src={p.imagen_url} alt={p.nombre} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span className="muted" style={{ fontSize: 12 }}>Sin foto</span>}
            </div>
            <b>{p.nombre}</b>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span>{fmt(p.precio)}</span>
              <span className="muted" style={{ fontSize: 12.5 }}>Stock: {p.stock}</span>
            </div>
            <label className="btn btn-ghost" style={{ display: "block", textAlign: "center", marginTop: 10, padding: "6px 0", cursor: "pointer" }}>
              Subir foto
              <input type="file" accept="image/png,image/jpeg,image/webp" style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && subirImagen(p.id, e.target.files[0])} />
            </label>
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              <button className="btn btn-ghost" style={{ flex: 1, padding: "6px 0", fontSize: 12.5 }} onClick={() => toggleActivo(p)}>{p.activo ? "Ocultar" : "Publicar"}</button>
              <button className="btn btn-ghost" style={{ flex: 1, padding: "6px 0", fontSize: 12.5 }} onClick={() => borrar(p.id)}>Eliminar</button>
            </div>
          </div>
        ))}
        {products.length === 0 && <p className="muted">Todavía no cargaste productos.</p>}
      </div>
    </>
  );
}
