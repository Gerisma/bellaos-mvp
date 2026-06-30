import { TEMPLATE_LANG } from "./templates";

// Enviar un mensaje de texto libre por la WhatsApp Cloud API. Solo válido
// como RESPUESTA dentro de la ventana de 24h de un mensaje del cliente
// (lo usa el webhook al contestar). Para mensajes que inicia el negocio
// (recordatorios, campañas, confirmaciones manuales) usar sendWhatsAppTemplate.
// phoneId/token: credenciales del tenant (su propio número WABA); si no se pasan,
// cae a las variables de entorno globales (cuenta única de la plataforma).
export async function sendWhatsApp(to, text, { phoneId, token } = {}) {
  const url = `https://graph.facebook.com/v20.0/${phoneId || process.env.WHATSAPP_PHONE_ID}/messages`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token || process.env.WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    }),
  });
  if (!res.ok) console.error("WhatsApp sendWhatsApp falló:", res.status, await res.text().catch(() => ""));
  return res.ok;
}

// Enviar una plantilla aprobada por Meta (type: "template"). Obligatorio
// para cualquier mensaje que el negocio inicia fuera de la ventana de 24h
// de conversación con el cliente (Meta rechaza texto libre en ese caso).
// template: nombre exacto de la plantilla aprobada (ver src/lib/templates.js).
// params: valores en orden para las variables {{1}}, {{2}}, ... del cuerpo.
export async function sendWhatsAppTemplate(to, { phoneId, token, template, params = [], lang } = {}) {
  const url = `https://graph.facebook.com/v20.0/${phoneId || process.env.WHATSAPP_PHONE_ID}/messages`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token || process.env.WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: template,
        language: { code: lang || TEMPLATE_LANG },
        ...(params.length ? { components: [{ type: "body", parameters: params.map((p) => ({ type: "text", text: String(p) })) }] } : {}),
      },
    }),
  });
  if (!res.ok) console.error("WhatsApp sendWhatsAppTemplate falló:", template, res.status, await res.text().catch(() => ""));
  return res.ok;
}
