import { randomInt } from "crypto";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentTenantId } from "@/lib/auth";
import { errorResponse } from "@/lib/apiError";
import { isNonEmptyString } from "@/lib/validate";
import { subscribeWaba, registerPhoneNumber } from "@/lib/metaGraph";

// Estado de la conexión de WhatsApp del negocio (para mostrar u ocultar el
// botón "Conectar WhatsApp" en el panel).
export async function GET() {
  try {
    const sb = await supabaseServer();
    const tenant_id = await getCurrentTenantId(sb);
    const { data } = await sb.from("tenants").select("whatsapp_phone_id").eq("id", tenant_id).single();
    return Response.json({ connected: !!data?.whatsapp_phone_id });
  } catch (e) {
    return errorResponse(e, { connected: false });
  }
}

// Recibe el resultado del WhatsApp Embedded Signup (waba_id + phone_number_id
// que entrega el SDK de Meta al terminar el flujo) y completa el alta:
// suscribe la WABA a los webhooks y registra el número. Requiere que la app
// de Meta esté aprobada como Tech Provider con un configuration_id de
// Embedded Signup (ver HANDOFF_CLAUDE_CODE.md) — hasta entonces esta ruta
// funciona, pero nadie puede llegar a llamarla porque el botón del frontend
// no se muestra sin NEXT_PUBLIC_META_APP_ID/NEXT_PUBLIC_META_CONFIG_ID.
export async function POST(req) {
  try {
    const sb = await supabaseServer();
    const tenant_id = await getCurrentTenantId(sb);
    const b = await req.json();
    if (!isNonEmptyString(b.waba_id) || !isNonEmptyString(b.phone_number_id)) {
      return Response.json({ ok: false, error: "Faltan waba_id o phone_number_id" }, { status: 400 });
    }

    await subscribeWaba(b.waba_id);
    const pin = String(randomInt(0, 999999)).padStart(6, "0");
    await registerPhoneNumber(b.phone_number_id, pin);

    const admin = supabaseAdmin();
    const { error } = await admin.from("tenants")
      .update({ whatsapp_phone_id: b.phone_number_id, waba_id: b.waba_id })
      .eq("id", tenant_id);
    if (error) throw error;

    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e, { ok: false });
  }
}
