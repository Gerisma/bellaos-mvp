import { supabaseServer } from "@/lib/supabaseServer";
import { getCurrentTenantId } from "@/lib/auth";
import { errorResponse } from "@/lib/apiError";
import { isUuid } from "@/lib/validate";

export async function GET() {
  try {
    const sb = await supabaseServer();
    const tenant_id = await getCurrentTenantId(sb);
    const { data } = await sb.from("products").select("*").eq("tenant_id", tenant_id).order("created_at", { ascending: false });
    return Response.json({ products: data || [] });
  } catch (e) {
    return errorResponse(e, { products: [] });
  }
}

export async function POST(req) {
  try {
    const sb = await supabaseServer();
    const tenant_id = await getCurrentTenantId(sb);
    const b = await req.json();
    const nombre = (b.nombre || "").trim();
    const precio = Number(b.precio);
    if (!nombre) return Response.json({ ok: false, error: "Falta el nombre" }, { status: 400 });
    if (!Number.isFinite(precio) || precio <= 0) return Response.json({ ok: false, error: "Precio inválido" }, { status: 400 });
    const stock = Number.isFinite(Number(b.stock)) ? Math.max(0, Math.trunc(Number(b.stock))) : 0;

    const { data, error } = await sb.from("products").insert({
      tenant_id, nombre, precio, stock, descripcion: b.descripcion || null, activo: true,
    }).select().single();
    if (error) throw error;
    return Response.json({ ok: true, product: data });
  } catch (e) {
    return errorResponse(e, { ok: false });
  }
}

export async function PATCH(req) {
  try {
    const sb = await supabaseServer();
    const tenant_id = await getCurrentTenantId(sb);
    const b = await req.json();
    if (!isUuid(b.id)) return Response.json({ ok: false, error: "id inválido" }, { status: 400 });
    const patch = {};
    if (b.nombre !== undefined) patch.nombre = String(b.nombre).trim();
    if (b.descripcion !== undefined) patch.descripcion = b.descripcion || null;
    if (b.precio !== undefined) patch.precio = Number(b.precio);
    if (b.stock !== undefined) patch.stock = Math.max(0, Math.trunc(Number(b.stock) || 0));
    if (b.activo !== undefined) patch.activo = !!b.activo;
    const { error } = await sb.from("products").update(patch).eq("id", b.id).eq("tenant_id", tenant_id);
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e, { ok: false });
  }
}

export async function DELETE(req) {
  try {
    const sb = await supabaseServer();
    const tenant_id = await getCurrentTenantId(sb);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!isUuid(id)) return Response.json({ ok: false, error: "id inválido" }, { status: 400 });
    const { error } = await sb.from("products").delete().eq("id", id).eq("tenant_id", tenant_id);
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e, { ok: false });
  }
}
