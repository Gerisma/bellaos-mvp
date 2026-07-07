import { createHmac, timingSafeEqual } from "crypto";
import { loadTenantContext, generateReply } from "@/lib/responder";
import { ruleBasedReply, classifyIntent } from "@/lib/brain";
import { sendWhatsApp } from "@/lib/whatsapp";
import { supabaseAdmin } from "@/lib/supabase";
import { persistInbound, persistOutbound } from "@/lib/conversations";

function isValidVerifyToken(token) {
  const expected = process.env.WHATSAPP_VERIFY_TOKEN;
  if (!expected || !token) return false;
  const a = Buffer.from(expected); const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("hub.mode") === "subscribe" && isValidVerifyToken(searchParams.get("hub.verify_token")))
    return new Response(searchParams.get("hub.challenge"), { status: 200 });
  return new Response("forbidden", { status: 403 });
}

function isValidSignature(rawBody, header) {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret || !header) return false;
  const expected = "sha256=" + createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected); const b = Buffer.from(header);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req) {
  const rawBody = await req.text();
  const sigHeader = req.headers.get("x-hub-signature-256");
  if (!isValidSignature(rawBody, sigHeader)) {
    console.error("[wh] firma invalida - 401 (revisar WHATSAPP_APP_SECRET)");
    return new Response("forbidden", { status: 401 });
  }

  let body;
  try { body = JSON.parse(rawBody); } catch { return Response.json({ ok: true }); }
  const value = body?.entry?.[0]?.changes?.[0]?.value;
  const msg = value?.messages?.[0];
  const phoneId = value?.metadata?.phone_number_id;
  if (!msg) {
    return Response.json({ ok: true });
  }
  const from = msg.from; const texto = msg.text?.body || "";

  const ctx = await loadTenantContext({ phoneId });

  // Negocio con la prueba vencida sin confirmar: se guarda el mensaje para
  // que la dueña lo vea cuando reactive, pero no se le contesta a su
  // clienta (evita confundirla con algo que es un tema de facturación
  // interno, ajeno a ella).
  if (ctx?.tenant?.billing_status === "bloqueado") {
    try {
      const sb = supabaseAdmin();
      await persistInbound(sb, { tenant_id: ctx.tenant.id, phone: from, canal: "whatsapp", texto, intent: null });
    } catch (e) { console.error("[wh] persistencia fallo (bloqueado):", e?.message); }
    return Response.json({ ok: true, bloqueado: true });
  }

  let result;
  if (ctx) {
    result = await generateReply(ctx, texto);
    try {
      const sb = supabaseAdmin();
      const { conversation_id } = await persistInbound(sb, { tenant_id: ctx.tenant.id, phone: from, canal: "whatsapp", texto, intent: result.intent });
      await persistOutbound(sb, { tenant_id: ctx.tenant.id, conversation_id, texto: result.reply, handoff: result.handoff });
    } catch (e) { console.error("[wh] persistencia fallo:", e?.message); }
  } else {
    const intent = classifyIntent(texto);
    result = { intent, reply: ruleBasedReply(intent, texto, { brand: {}, services: [] }) };
  }
  const sent = await sendWhatsApp(from, result.reply, { phoneId: ctx?.tenant?.whatsapp_phone_id, token: ctx?.tenant?.whatsapp_token });
  if (!sent) console.error("[wh] no se pudo enviar la respuesta por WhatsApp");
  return Response.json({ ok: true, intent: result.intent });
}
