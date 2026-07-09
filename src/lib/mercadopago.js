const MP_API = "https://api.mercadopago.com";

// Crea un link de pago (Checkout Pro) para cobrar la seña de un turno.
// token: mp_access_token propio del tenant si lo conectó; si no, cae al
// MP_ACCESS_TOKEN global de la plataforma (mismo patrón que WhatsApp).
// external_reference lleva tenant_id + appointment_id para que el webhook
// sepa a qué turno acreditar el pago sin depender de datos del cliente.
export async function createPaymentPreference({ token, title, amount, externalReference, notificationUrl, backUrl }) {
  // MercadoPago exige que back_urls sea una URL https absoluta para poder
  // usar auto_return; en desarrollo local (http://localhost) la rechaza. Si
  // no es https, se manda la preferencia sin auto_return en vez de romper.
  const backUrlHttps = backUrl?.startsWith("https://") ? backUrl : null;
  const res = await fetch(`${MP_API}/checkout/preferences`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token || process.env.MP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [{ title, quantity: 1, unit_price: Number(amount), currency_id: "ARS" }],
      external_reference: externalReference,
      notification_url: notificationUrl,
      back_urls: backUrlHttps ? { success: backUrlHttps, pending: backUrlHttps, failure: backUrlHttps } : undefined,
      auto_return: backUrlHttps ? "approved" : undefined,
    }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    console.error("MercadoPago createPaymentPreference falló:", res.status, data);
    throw new Error("No se pudo generar el link de pago");
  }
  return { id: data.id, initPoint: data.init_point };
}

// Consulta un pago por id para confirmar su estado real (nunca confiar
// ciegamente en el payload del webhook, que puede ser spoofeado).
export async function getPayment({ token, paymentId }) {
  const res = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${token || process.env.MP_ACCESS_TOKEN}` },
  });
  if (!res.ok) {
    console.error("MercadoPago getPayment falló:", res.status, await res.text().catch(() => ""));
    return null;
  }
  return res.json();
}
