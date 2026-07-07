import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentTenantId } from "@/lib/auth";
import { errorResponse } from "@/lib/apiError";

const MAX_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

export async function POST(req) {
  try {
    const sb = await supabaseServer();
    const tenant_id = await getCurrentTenantId(sb);
    const form = await req.formData();
    const file = form.get("logo");
    if (!file || typeof file === "string") return Response.json({ ok: false, error: "Falta el archivo" }, { status: 400 });
    if (!ALLOWED.includes(file.type)) return Response.json({ ok: false, error: "Formato no permitido (usá PNG, JPG, WEBP o SVG)" }, { status: 400 });
    if (file.size > MAX_BYTES) return Response.json({ ok: false, error: "El archivo pesa demasiado (máximo 2MB)" }, { status: 400 });

    const admin = supabaseAdmin();
    const ext = file.name.split(".").pop() || "png";
    const path = `${tenant_id}/logo.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: upErr } = await admin.storage.from("logos").upload(path, buffer, { contentType: file.type, upsert: true });
    if (upErr) throw upErr;

    const { data: pub } = admin.storage.from("logos").getPublicUrl(path);
    const logo_url = `${pub.publicUrl}?v=${Date.now()}`; // cache-bust al reemplazar el logo
    const { error } = await admin.from("tenants").update({ logo_url }).eq("id", tenant_id);
    if (error) throw error;

    return Response.json({ ok: true, logo_url });
  } catch (e) {
    return errorResponse(e, { ok: false });
  }
}
