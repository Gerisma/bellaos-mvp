import { supabaseAdmin } from "./supabase";
import { composeSystemPrompt, classifyIntent, ruleBasedReply } from "./brain";
import { askLLM } from "./llm";
import { searchFAQs } from "./knowledge";
import { tryParseBooking, fmtFechaHora } from "./booking";

export async function loadTenantContext({ tenantId, phoneId }) {
  const sb = supabaseAdmin();
  let tenant = null;
  if (tenantId) {
    const { data } = await sb.from("tenants").select("*").eq("id", tenantId).single();
    tenant = data;
  } else if (phoneId) {
    const { data } = await sb.from("tenants").select("*").eq("whatsapp_phone_id", phoneId).single();
    tenant = data;
  }
  if (!tenant) return null;
  const { data: bp } = await sb.from("brand_profiles").select("*").eq("tenant_id", tenant.id).single();
  const { data: services } = await sb.from("services").select("*").eq("tenant_id", tenant.id).eq("activo", true);
  return { tenant, brand: { name: tenant.name, ...(bp || {}) }, services: services || [] };
}

// Agenda v2: si el mensaje trae servicio + fecha + hora reconocibles
// ("agendame un corte mañana a las 15hs"), crea el turno directo en la base
// en vez de solo prometer que "va a ver disponibilidad". Devuelve null si no
// pudo agendar (falta info, o el horario ya está ocupado) para que la
// conversación siga por el camino normal (LLM o reglas) pidiendo lo que falta.
async function tryAutoAgendar(ctx, text, { sb, contactId }) {
  if (!contactId) return null; // sin contacto (ej. probador sin conversación real) no se agenda solo
  const parsed = tryParseBooking(text, ctx.services);
  if (!parsed) return null;

  const db = sb || supabaseAdmin();
  const duracionMin = parsed.service.duracion_min || 60;
  const desde = new Date(parsed.inicio.getTime() - duracionMin * 60_000).toISOString();
  const hasta = new Date(parsed.inicio.getTime() + duracionMin * 60_000).toISOString();
  const { data: conflicto } = await db.from("appointments")
    .select("id").eq("tenant_id", ctx.tenant.id).neq("estado", "cancelado")
    .gte("inicio", desde).lte("inicio", hasta).limit(1);
  if (conflicto?.length) {
    return { intent: "agendar_turno", reply: `Para ${fmtFechaHora(parsed.isoInicio)} ya tengo otro turno ocupado. ¿Te sirve otro horario cercano?`, engine: "auto-agenda" };
  }

  const { data: appt, error } = await db.from("appointments")
    .insert({ tenant_id: ctx.tenant.id, contact_id: contactId, service_id: parsed.service.id, inicio: parsed.isoInicio, estado: "agendado" })
    .select("id").single();
  if (error || !appt) return null; // si falla el insert, seguimos con la respuesta normal en vez de mentir que se agendó
  await db.from("contacts").update({ stage: "turno_agendado" }).eq("id", contactId);

  return {
    intent: "agendar_turno",
    reply: `¡Listo! Te agendé ${parsed.service.nombre} para el ${fmtFechaHora(parsed.isoInicio)} 💕 Cualquier cambio avisame por acá.`,
    engine: "auto-agenda",
    booked: true,
  };
}

export async function generateReply(ctx, text, { sb, contactId } = {}) {
  const intent = classifyIntent(text);
  if (intent === "queja") {
    return { intent, reply: ruleBasedReply(intent, text, ctx), handoff: true };
  }
  if (intent === "agendar_turno") {
    const auto = await tryAutoAgendar(ctx, text, { sb, contactId });
    if (auto) return auto;
  }
  if (process.env.OPENROUTER_API_KEY) {
    const faqs = await searchFAQs(sb || supabaseAdmin(), ctx.tenant.id, text);
    const sys = composeSystemPrompt(ctx, faqs);
    const reply = await askLLM(sys, [{ role: "user", content: text }]);
    return { intent, reply, engine: "llm" };
  }
  return { intent, reply: ruleBasedReply(intent, text, ctx), engine: "reglas" };
}
