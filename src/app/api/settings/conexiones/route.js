import { supabaseServer } from "@/lib/supabaseServer";
import { getCurrentTenantId } from "@/lib/auth";
import { errorResponse } from "@/lib/apiError";

export async function GET() {
  try {
    const sb = await supabaseServer();
    const tenant_id = await getCurrentTenantId(sb);
    const { data } = await sb.from("tenants")
      .select("notif_whatsapp_telefono,notif_email,fb_page_id,ig_connected,google_calendar_connected,whatsapp_phone_id,slug")
      .eq("id", tenant_id).single();
    return Response.json(data || {});
  } catch (e) {
    return errorResponse(e, {});
  }
}

// Guarda a dónde le llegan los avisos internos a la dueña (turno nuevo
// agendado solo, handoff a humano). No toca nada de Meta/Google.
export async function POST(req) {
  try {
    const sb = await supabaseServer();
    const tenant_id = await getCurrentTenantId(sb);
    const b = await req.json();
    const patch = {};
    if (typeof b.notif_whatsapp_telefono === "string") patch.notif_whatsapp_telefono = b.notif_whatsapp_telefono.trim() || null;
    if (typeof b.notif_email === "string") patch.notif_email = b.notif_email.trim() || null;
    const { error } = await sb.from("tenants").update(patch).eq("id", tenant_id);
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e, { ok: false });
  }
}
