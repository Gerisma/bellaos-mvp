import { supabaseAdmin } from "./supabase";
import { composeSystemPrompt, classifyIntent, ruleBasedReply } from "./brain";
import { askLLM } from "./llm";
import { searchFAQs } from "./knowledge";

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

export async function generateReply(ctx, text, { sb } = {}) {
  const intent = classifyIntent(text);
  if (intent === "queja") {
    return { intent, reply: ruleBasedReply(intent, text, ctx), handoff: true };
  }
  if (process.env.OPENROUTER_API_KEY) {
    const faqs = await searchFAQs(sb || supabaseAdmin(), ctx.tenant.id, text);
    const sys = composeSystemPrompt(ctx, faqs);
    const reply = await askLLM(sys, [{ role: "user", content: text }]);
    return { intent, reply, engine: "llm" };
  }
  return { intent, reply: ruleBasedReply(intent, text, ctx), engine: "reglas" };
}
