import { supabaseAdmin } from "@/lib/supabase";
import { errorResponse } from "@/lib/apiError";
import { createPaymentPreference } from "@/lib/mercadopago";

// Tienda pública: sin login. Siempre supabaseAdmin() (bypassea RLS) y solo
// selecciona columnas seguras para mostrar/usar en el checkout — nunca
// tokens ni datos de otros negocios (ver nota en la migración de tienda).
export async function GET(_req, { params }) {
  try {
    const admin = supabaseAdmin();
    const { data: tenant } = await admin.from("tenants").select("id,name,logo_url,slug").eq("slug", params.slug).single();
    if (!tenant) return Response.json({ error: "Tienda no encontrada" }, { status: 404 });
    const { data: products } = await admin.from("products")
      .select("id,nombre,descripcion,precio,stock,imagen_url")
      .eq("tenant_id", tenant.id).eq("activo", true).gt("stock", 0)
      .order("nombre");
    return Response.json({ tenant, products: products || [] });
  } catch (e) {
    return errorResponse(e, {});
  }
}

// Checkout: recalcula todo del lado del servidor (nunca confía en precios
// que mande el navegador), crea la orden + sus items, y devuelve el link de
// pago de MercadoPago. La orden queda "pendiente" hasta que el webhook
// confirme el pago re-consultando la API de MP (mismo patrón que las señas).
export async function POST(req, { params }) {
  try {
    const admin = supabaseAdmin();
    const { data: tenant } = await admin.from("tenants").select("id,name,mp_access_token").eq("slug", params.slug).single();
    if (!tenant) return Response.json({ ok: false, error: "Tienda no encontrada" }, { status: 404 });

    const b = await req.json();
    const items = Array.isArray(b.items) ? b.items.filter((i) => i?.product_id && Number(i.cantidad) > 0) : [];
    if (!items.length) return Response.json({ ok: false, error: "El carrito está vacío" }, { status: 400 });
    if (!tenant?.mp_access_token && !process.env.MP_ACCESS_TOKEN) {
      return Response.json({ ok: false, error: "Esta tienda todavía no tiene MercadoPago configurado." }, { status: 400 });
    }

    const ids = items.map((i) => i.product_id);
    const { data: products } = await admin.from("products").select("id,nombre,precio,stock,activo").in("id", ids).eq("tenant_id", tenant.id);
    const porId = Object.fromEntries((products || []).map((p) => [p.id, p]));

    const orderItems = [];
    let total = 0;
    for (const it of items) {
      const p = porId[it.product_id];
      const cantidad = Math.max(1, Math.trunc(Number(it.cantidad)));
      if (!p || !p.activo) return Response.json({ ok: false, error: `Un producto del carrito ya no está disponible.` }, { status: 400 });
      if (p.stock < cantidad) return Response.json({ ok: false, error: `No hay stock suficiente de "${p.nombre}".` }, { status: 400 });
      orderItems.push({ product_id: p.id, nombre: p.nombre, cantidad, precio_unitario: p.precio });
      total += p.precio * cantidad;
    }

    const { data: order, error: orderErr } = await admin.from("orders").insert({
      tenant_id: tenant.id, contact_nombre: (b.nombre || "").slice(0, 120), contact_telefono: (b.telefono || "").slice(0, 40),
      estado: "pendiente", total,
    }).select("id").single();
    if (orderErr) throw orderErr;
    await admin.from("order_items").insert(orderItems.map((i) => ({ ...i, order_id: order.id })));

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
    const pref = await createPaymentPreference({
      token: tenant.mp_access_token,
      title: `Pedido · ${tenant.name}`,
      amount: total,
      externalReference: `order:${tenant.id}:${order.id}`,
      notificationUrl: `${baseUrl}/api/webhook/mercadopago`,
      backUrl: `${baseUrl}/tienda/${params.slug}`,
    });
    await admin.from("orders").update({ mp_preference_id: pref.id }).eq("id", order.id);

    return Response.json({ ok: true, init_point: pref.initPoint, order_id: order.id });
  } catch (e) {
    return errorResponse(e, { ok: false });
  }
}
