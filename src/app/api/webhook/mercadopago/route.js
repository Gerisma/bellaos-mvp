import { supabaseAdmin } from "@/lib/supabase";
import { getPayment } from "@/lib/mercadopago";
import { getPreapproval } from "@/lib/mpSubscription";

// MercadoPago manda la notificación por query params (IPN clásico:
// ?topic=payment&id=X) o por body JSON (webhooks nuevos: {type,data:{id}}).
// Nunca confiamos en el status que venga en el payload: siempre volvemos a
// consultar el pago a la API de MP con un token válido antes de acreditar.
function extractPaymentId(searchParams, body) {
  if (searchParams.get("type") === "payment" || searchParams.get("topic") === "payment") {
    return searchParams.get("data.id") || searchParams.get("id");
  }
  if (body?.type === "payment" || body?.action?.startsWith("payment.")) {
    return body?.data?.id;
  }
  return null;
}

// Sin OAuth Marketplace, no sabemos de antemano con qué cuenta de MP se
// cobró el pago. Probamos primero la cuenta global de la plataforma y, si
// no responde, probamos con el token propio de cada tenant que tenga uno
// cargado (son pocos negocios en esta etapa; más adelante esto se resuelve
// con Marketplace OAuth, igual que el Embedded Signup de WhatsApp).
async function resolvePayment(sb, paymentId) {
  const viaGlobal = await getPayment({ paymentId });
  if (viaGlobal) return viaGlobal;
  const { data: tenants } = await sb.from("tenants").select("id,mp_access_token").not("mp_access_token", "is", null);
  for (const t of tenants || []) {
    const p = await getPayment({ token: t.mp_access_token, paymentId });
    if (p) return p;
  }
  return null;
}

// Suscripciones mensuales de la plataforma: si MercadoPago cancela o pausa
// una (tarjeta rechazada varias veces, el cliente la cancela desde su
// cuenta de MP, etc.), el negocio vuelve a quedar bloqueado hasta que
// confirme de nuevo en /suscripcion.
function extractPreapprovalId(searchParams, body) {
  if (searchParams.get("type") === "subscription_preapproval") return searchParams.get("data.id") || searchParams.get("id");
  if (body?.type === "subscription_preapproval") return body?.data?.id;
  return null;
}

async function handlePreapproval(sb, preapprovalId) {
  const preapproval = await getPreapproval(preapprovalId);
  if (!preapproval) return;
  if (["cancelled", "paused"].includes(preapproval.status)) {
    await sb.from("tenants").update({ billing_status: "bloqueado" }).eq("mp_preapproval_id", String(preapprovalId));
  } else if (preapproval.status === "authorized") {
    await sb.from("tenants").update({ billing_status: "activo" }).eq("mp_preapproval_id", String(preapprovalId));
  }
}

async function handle(req) {
  const { searchParams } = new URL(req.url);
  let body = null;
  if (req.method === "POST") {
    try { body = await req.json(); } catch { body = null; }
  }

  const preapprovalId = extractPreapprovalId(searchParams, body);
  if (preapprovalId) {
    await handlePreapproval(supabaseAdmin(), preapprovalId);
    return Response.json({ ok: true });
  }

  const paymentId = extractPaymentId(searchParams, body);
  if (!paymentId) return Response.json({ ok: true });

  const sb = supabaseAdmin();
  const payment = await resolvePayment(sb, paymentId);
  if (!payment || payment.status !== "approved") return Response.json({ ok: true });

  const [tenantId, appointmentId] = String(payment.external_reference || "").split(":");
  if (!tenantId || !appointmentId) return Response.json({ ok: true });

  const { data: appt } = await sb.from("appointments").select("id,mp_payment_id").eq("id", appointmentId).eq("tenant_id", tenantId).single();
  if (!appt || appt.mp_payment_id === String(payment.id)) return Response.json({ ok: true }); // ya procesado

  await sb.from("appointments").update({ sena_pagada: true, mp_payment_id: String(payment.id) }).eq("id", appointmentId);
  return Response.json({ ok: true });
}

export async function GET(req) { return handle(req); }
export async function POST(req) { return handle(req); }
