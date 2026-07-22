// Llamadas a la Graph API de Meta para terminar el alta de un número que
// completó el WhatsApp Embedded Signup. Usan el token permanente del System
// User de la plataforma (WHATSAPP_TOKEN): el mismo modelo de "cuenta
// compartida" que ya usa src/lib/whatsapp.js para enviar mensajes, donde
// cada tenant se distingue por su whatsapp_phone_id, no por un token propio.
const GRAPH = "https://graph.facebook.com/v20.0";

// Suscribe la app de BellaOS a los webhooks de la WABA del cliente. Sin este
// paso, Meta nunca nos manda los mensajes entrantes de ese número.
export async function subscribeWaba(wabaId) {
  const res = await fetch(`${GRAPH}/${wabaId}/subscribed_apps`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    console.error("subscribeWaba falló:", res.status, data);
    throw new Error("No se pudo suscribir la WABA a los webhooks");
  }
  return data;
}

// Registra el número para poder operar por Cloud API. En modo Coexistencia
// (el cliente ya usaba WhatsApp Business app) Meta suele dejarlo registrado
// automáticamente durante el propio Embedded Signup, así que este paso puede
// fallar como "ya registrado" — no es motivo para frenar el alta.
export async function registerPhoneNumber(phoneNumberId, pin) {
  const res = await fetch(`${GRAPH}/${phoneNumberId}/register`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", pin }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    console.error("registerPhoneNumber falló (puede ser normal en coexistencia):", res.status, data);
    return { ok: false, data };
  }
  return { ok: true, data };
}

// --- Instagram / Facebook (Conexiones) -------------------------------------
// Intercambia el token corto de usuario (que devuelve el FB.login del SDK
// JS) por uno de larga duración (~60 días), y de ahí saca la Página y la
// cuenta de Instagram Business vinculada. Requiere que la app de Meta tenga
// aprobados pages_show_list / pages_messaging / instagram_basic /
// instagram_manage_messages — mismo trámite que el Embedded Signup de
// WhatsApp (ver TAREAS_PENDIENTES.md). Sin esa aprobación, funciona igual
// para el dueño/administrador de la app de Meta (modo desarrollo), pero no
// para negocios externos.
export async function exchangeLongLivedUserToken(shortLivedToken) {
  const params = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: process.env.NEXT_PUBLIC_META_APP_ID,
    // Mismo App Secret que ya se usa para validar la firma HMAC del webhook
    // de WhatsApp (misma app de Meta) — no hace falta cargar una clave nueva.
    client_secret: process.env.META_APP_SECRET || process.env.WHATSAPP_APP_SECRET,
    fb_exchange_token: shortLivedToken,
  });
  const res = await fetch(`${GRAPH}/oauth/access_token?${params.toString()}`);
  const data = await res.json().catch(() => null);
  if (!res.ok) { console.error("exchangeLongLivedUserToken falló:", res.status, data); throw new Error("No se pudo validar la sesión de Facebook"); }
  return data.access_token;
}

export async function getPaginasDelUsuario(userAccessToken) {
  const res = await fetch(`${GRAPH}/me/accounts?fields=id,name,access_token&access_token=${encodeURIComponent(userAccessToken)}`);
  const data = await res.json().catch(() => null);
  if (!res.ok) { console.error("getPaginasDelUsuario falló:", res.status, data); throw new Error("No se pudieron leer tus Páginas de Facebook"); }
  return data.data || [];
}

export async function getInstagramBusinessId(pageId, pageAccessToken) {
  const res = await fetch(`${GRAPH}/${pageId}?fields=instagram_business_account&access_token=${encodeURIComponent(pageAccessToken)}`);
  const data = await res.json().catch(() => null);
  if (!res.ok) { console.error("getInstagramBusinessId falló:", res.status, data); return null; }
  return data.instagram_business_account?.id || null;
}

// Suscribe la Página a los webhooks de mensajería (para recibir DMs y
// comentarios en /api/webhook/whatsapp o un webhook dedicado, según se
// implemente el adapter de IG/FB — ver TAREAS_PENDIENTES.md).
export async function subscribePageWebhooks(pageId, pageAccessToken) {
  const res = await fetch(`${GRAPH}/${pageId}/subscribed_apps?subscribed_fields=messages,messaging_postbacks,feed&access_token=${encodeURIComponent(pageAccessToken)}`, { method: "POST" });
  const data = await res.json().catch(() => null);
  if (!res.ok) { console.error("subscribePageWebhooks falló:", res.status, data); return false; }
  return true;
}
