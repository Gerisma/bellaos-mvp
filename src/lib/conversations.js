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
  // Reutiliza la conversación más reciente del contacto sin importar su estado:
  // si solo mirábamos "abierta", una conversación derivada a un humano (handoff)
  // dejaba de encontrarse y cada mensaje siguiente creaba una conversación nueva
  // (se vio disparar 25 conversaciones para un mismo número en un bucle bot-a-bot).
  let { data: convs } = await sb.from("conversations").select("id").eq("tenant_id", tenant_id).eq("contact_id", contact.id).order("created_at", { ascending: false }).limit(1);
  let conv = convs?.[0];
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

// Detecta un bucle bot-a-bot: cuando el número del otro lado es en realidad
// otro sistema automatizado, ambos asistentes pueden quedar respondiéndose
// entre sí en cadena. Si el mismo contacto ya mandó demasiados mensajes en
// muy poco tiempo, dejamos de contestar (el mensaje se sigue guardando).
export async function isMessageStorm(sb, { tenant_id, phone, windowSeconds = 30, maxMessages = 5 }) {
  const { data: contact } = await sb.from("contacts").select("id").eq("tenant_id", tenant_id).eq("telefono", phone).maybeSingle();
  if (!contact) return false;
  const { data: convs } = await sb.from("conversations").select("id").eq("tenant_id", tenant_id).eq("contact_id", contact.id).order("created_at", { ascending: false }).limit(1);
  const conv = convs?.[0];
  if (!conv) return false;
  const since = new Date(Date.now() - windowSeconds * 1000).toISOString();
  const { count } = await sb.from("messages").select("id", { count: "exact", head: true })
    .eq("conversation_id", conv.id).eq("rol", "in").gte("created_at", since);
  return (count || 0) >= maxMessages;
}
