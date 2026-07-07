import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentUserId, getCurrentTenantId } from "@/lib/auth";
import { errorResponse } from "@/lib/apiError";
import { isNonEmptyString } from "@/lib/validate";
import { createCustomer, attachCard } from "@/lib/mpSubscription";

// Guarda la tarjeta de la prueba de 15 días: crea (o reusa) un Customer de
// MercadoPago para el negocio y le adjunta la tarjeta ya tokenizada en el
// navegador (nunca vemos el número real acá). No cobra nada.
export async function POST(req) {
  try {
    const sb = await supabaseServer();
    const userId = await getCurrentUserId(sb);
    const tenant_id = await getCurrentTenantId(sb);
    const b = await req.json();
    if (!isNonEmptyString(b.token)) return Response.json({ ok: false, error: "Falta el token de la tarjeta" }, { status: 400 });

    const admin = supabaseAdmin();
    const { data: tenant } = await admin.from("tenants").select("mp_customer_id").eq("id", tenant_id).single();
    const { data: profile } = await admin.from("profiles").select("email").eq("id", userId).single();

    let customerId = tenant?.mp_customer_id;
    if (!customerId) {
      const customer = await createCustomer(b.email || profile?.email);
      customerId = customer.id;
    }
    const card = await attachCard(customerId, b.token);

    const { error } = await admin.from("tenants").update({
      mp_customer_id: customerId, mp_card_id: card.id, mp_card_last4: card.last4, mp_card_brand: card.brand,
    }).eq("id", tenant_id);
    if (error) throw error;

    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e, { ok: false });
  }
}
