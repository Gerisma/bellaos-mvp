import { supabaseServer } from "@/lib/supabaseServer";
import { getCurrentTenantId } from "@/lib/auth";
import { loadTenantContext, generateReply } from "@/lib/responder";
import { persistInbound, persistOutbound, updateInboundIntent } from "@/lib/conversations";
import { errorResponse } from "@/lib/apiError";

export async function POST(req) {
  try {
    const sb = await supabaseServer();
    const tenant_id = await getCurrentTenantId(sb);
    const { message } = await req.json();
    const ctx = await loadTenantContext({ tenantId: tenant_id });
    if (!ctx) return Response.json({ error: "Negocio no encontrado" }, { status: 404 });
    // Conversación fija "probador" por tenant (contacto de prueba), para no
    // mezclar las pruebas con contactos reales. Se persiste antes de generar
    // la respuesta para que Agenda v2 (auto-agendar) tenga contact_id.
    let conversation_id = null, contact_id = null, message_id = null;
    try {
      const persisted = await persistInbound(sb, { tenant_id, phone: "probador", canal: "web", texto: message || "", intent: null });
      conversation_id = persisted.conversation_id; contact_id = persisted.contact_id; message_id = persisted.message_id;
    } catch (e) { /* no frenar la respuesta del probador si falla el guardado */ }
    const res = await generateReply(ctx, message || "", { sb, contactId: contact_id });
    try {
      await updateInboundIntent(sb, { message_id, intent: res.intent });
      if (conversation_id) await persistOutbound(sb, { tenant_id, conversation_id, texto: res.reply, handoff: res.handoff });
    } catch (e) { /* no frenar la respuesta del probador si falla el guardado */ }
    return Response.json(res);
  } catch (e) {
    return errorResponse(e);
  }
}
