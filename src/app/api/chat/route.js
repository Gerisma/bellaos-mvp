import { supabaseServer } from "@/lib/supabaseServer";
import { getCurrentTenantId } from "@/lib/auth";
import { loadTenantContext, generateReply } from "@/lib/responder";
import { persistInbound, persistOutbound } from "@/lib/conversations";
import { errorResponse } from "@/lib/apiError";

export async function POST(req) {
  try {
    const sb = await supabaseServer();
    const tenant_id = await getCurrentTenantId(sb);
    const { message } = await req.json();
    const ctx = await loadTenantContext({ tenantId: tenant_id });
    if (!ctx) return Response.json({ error: "Negocio no encontrado" }, { status: 404 });
    const res = await generateReply(ctx, message || "");
    try {
      // Conversación fija "probador" por tenant, para no mezclar las pruebas con contactos reales.
      const { conversation_id } = await persistInbound(sb, { tenant_id, phone: "probador", canal: "web", texto: message || "", intent: res.intent });
      await persistOutbound(sb, { tenant_id, conversation_id, texto: res.reply, handoff: res.handoff });
    } catch (e) { /* no frenar la respuesta del probador si falla el guardado */ }
    return Response.json(res);
  } catch (e) {
    return errorResponse(e);
  }
}
