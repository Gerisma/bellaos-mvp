import { supabaseServer } from "@/lib/supabaseServer";
import { getCurrentTenantId } from "@/lib/auth";
import { getUsage } from "@/lib/usage";
import { errorResponse } from "@/lib/apiError";

export async function GET() {
  try {
    const sb = await supabaseServer();
    const tenant_id = await getCurrentTenantId(sb);
    const [appts, contacts, targets, uso] = await Promise.all([
      sb.from("appointments").select("id,services(precio),contacts(canal)").eq("tenant_id", tenant_id),
      sb.from("contacts").select("stage,canal").eq("tenant_id", tenant_id),
      sb.from("campaign_targets").select("estado,campaigns!inner(tenant_id)").eq("campaigns.tenant_id", tenant_id),
      getUsage(sb, tenant_id),
    ]);
    const A = appts.data || [], C = contacts.data || [], T = targets.data || [];
    const ingresos = A.reduce((s, a) => s + (Number(a.services?.precio) || 0), 0);
    const embudo = {}; for (const c of C) embudo[c.stage] = (embudo[c.stage] || 0) + 1;
    const porCanal = {}; for (const a of A) { const ch = a.contacts?.canal || "otro"; porCanal[ch] = (porCanal[ch] || 0) + 1; }
    return Response.json({
      turnos: A.length, ingresos,
      reactivadas: embudo["reactivada"] || 0,
      inactivas: (embudo["en_riesgo"] || 0) + (embudo["inactiva"] || 0),
      embudo, porCanal,
      campana_enviados: T.filter(t => t.estado === "enviado").length,
      uso,
    });
  } catch (e) { return errorResponse(e); }
}
