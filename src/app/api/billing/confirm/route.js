import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentUserId, getCurrentTenantId } from "@/lib/auth";
import { errorResponse } from "@/lib/apiError";
import { isNonEmptyString } from "@/lib/validate";
import { createPreapproval } from "@/lib/mpSubscription";

// El cliente confirmó "sí, quiero seguir": acá (y solo acá) se crea la
// suscripción real, que es lo que dispara el cobro mensual automático de
// ahí en más. Antes de esto nunca se le debitó nada.
export async function POST(req) {
  try {
    const sb = await supabaseServer();
    const userId = await getCurrentUserId(sb);
    const tenant_id = await getCurrentTenantId(sb);
    const b = await req.json();
    if (!isNonEmptyString(b.card_token)) return Response.json({ ok: false, error: "Falta el token de la tarjeta" }, { status: 400 });

    const admin = supabaseAdmin();
    const { data: tenant } = await admin.from("tenants").select("name,precio_mensual,billing_status").eq("id", tenant_id).single();
    if (tenant?.billing_status === "activo") return Response.json({ ok: true }); // ya confirmado, no duplicar
    const { data: profile } = await admin.from("profiles").select("email").eq("id", userId).single();

    const preapproval = await createPreapproval({
      payerEmail: profile?.email,
      cardTokenId: b.card_token,
      amount: tenant?.precio_mensual || 0,
      reason: `BellaOS - ${tenant?.name || "suscripción mensual"}`,
      externalReference: tenant_id,
    });

    const { error } = await admin.from("tenants").update({
      billing_status: "activo", mp_preapproval_id: preapproval.id,
    }).eq("id", tenant_id);
    if (error) throw error;

    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e, { ok: false });
  }
}
