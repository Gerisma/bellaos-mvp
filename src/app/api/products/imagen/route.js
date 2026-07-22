import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentTenantId } from "@/lib/auth";
import { errorResponse } from "@/lib/apiError";
import { isUuid } from "@/lib/validate";

const MAX_BYTES = 3 * 1024 * 1024; // 3MB
const ALLOWED = ["image/png", "image/jpeg", "image/webp"];

export async function POST(req) {
  try {
    const sb = await supabaseServer();
    const tenant_id = await getCurrentTenantId(sb);
    const form = await req.formData();
    const file = form.get("imagen");
    const productId = form.get("product_id");
    if (!isUuid(productId)) return Response.json({ ok: false, error: "product_id inválido" }, { status: 400 });
    if (!file || typeof file === "string") return Response.json({ ok: false, error: "Falta el archivo" }, { status: 400 });
    if (!ALLOWED.includes(file.type)) return Response.json({ ok: false, error: "Formato no permitido (usá PNG, JPG o WEBP)" }, { status: 400 });
    if (file.size > MAX_BYTES) return Response.json({ ok: false, error: "El archivo pesa demasiado (máximo 3MB)" }, { status: 400 });

    // Confirma que el producto sea del tenant autenticado antes de tocar Storage.
    const { data: prod } = await sb.from("products").select("id").eq("id", productId).eq("tenant_id", tenant_id).single();
    if (!prod) return Response.json({ ok: false, error: "Producto no encontrado" }, { status: 404 });

    const admin = supabaseAdmin();
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${tenant_id}/${productId}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: upErr } = await admin.storage.from("productos").upload(path, buffer, { contentType: file.type, upsert: true });
    if (upErr) throw upErr;

    const { data: pub } = admin.storage.from("productos").getPublicUrl(path);
    const imagen_url = `${pub.publicUrl}?v=${Date.now()}`;
    const { error } = await admin.from("products").update({ imagen_url }).eq("id", productId);
    if (error) throw error;

    return Response.json({ ok: true, imagen_url });
  } catch (e) {
    return errorResponse(e, { ok: false });
  }
}
