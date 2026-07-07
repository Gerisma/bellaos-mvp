import { supabaseServer } from "@/lib/supabaseServer";
import { getCurrentTenantId } from "@/lib/auth";
import { errorResponse } from "@/lib/apiError";

export async function GET() {
  try {
    const sb = await supabaseServer();
    const tenant_id = await getCurrentTenantId(sb);
    const { data: t } = await sb.from("tenants")
      .select("billing_status,trial_ends_at,precio_mensual,mp_card_id,mp_card_last4,mp_card_brand")
      .eq("id", tenant_id).single();
    const diasRestantes = t?.trial_ends_at
      ? Math.max(0, Math.ceil((new Date(t.trial_ends_at).getTime() - Date.now()) / 86_400_000))
      : null;
    return Response.json({ ...t, dias_restantes: diasRestantes });
  } catch (e) {
    return errorResponse(e, {});
  }
}
