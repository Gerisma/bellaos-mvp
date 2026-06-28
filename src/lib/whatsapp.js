// Enviar un mensaje de texto por la WhatsApp Cloud API.
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
  return res.ok;
}
