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
