// Guarda mensajes entrantes/salientes en conversations + messages.
export async function persistInbound(sb, { tenant_id, phone, canal, texto, intent }) {
  let { data: contact } = await sb.from("contacts").select("id").eq("tenant_id", tenant_id).eq("telefono", phone).maybeSingle();
  if (!contact) {
    // insert directo; si dos mensajes casi simultáneos del mismo teléfono chocan contra el
    // unique(tenant_id, telefono) (reintentos de Meta), se recupera el contacto ya creado
    // por la otra request en vez de duplicarlo.
    const { data, error } = await sb.from("contacts").insert({ tenant_id, telefono: phone, canal, nombre: phone, stage: "en_conversacion" }).select("id").single();
    if (error) {
      const { data: existing } = await sb.from("contacts").select("id").eq("tenant_id", tenant_id).eq("telefono", phone).single();
      contact = existing;
    } else {
      contact = data;
    }
  }
  let { data: conv } = await sb.from("conversations").select("id").eq("tenant_id", tenant_id).eq("contact_id", contact.id).eq("estado", "abierta").maybeSingle();
  if (!conv) {
    const { data } = await sb.from("conversations").insert({ tenant_id, contact_id: contact.id, canal, estado: "abierta" }).select("id").single();
    conv = data;
  }
  await sb.from("messages").insert({ tenant_id, conversation_id: conv.id, rol: "in", texto, intent });
  return { contact_id: contact.id, conversation_id: conv.id };
}
export async function persistOutbound(sb, { tenant_id, conversation_id, texto, handoff }) {
  await sb.from("messages").insert({ tenant_id, conversation_id, rol: handoff ? "out_humano" : "out_ia", texto });
  if (handoff) await sb.from("conversations").update({ estado: "handoff" }).eq("id", conversation_id);
}
