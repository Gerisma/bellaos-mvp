// Suscripción mensual de la plataforma (lo que le cobrás a cada estética),
// separado de src/lib/mercadopago.js (que es el cobro puntual de señas a
// las clientas del negocio). Usa Customers + Cards + Preapproval de
// MercadoPago: la tarjeta se tokeniza en el navegador del cliente
// (MercadoPago Bricks/Secure Fields) y acá solo se maneja el token, nunca
// el número de tarjeta.
const MP_API = "https://api.mercadopago.com";
const TOKEN = () => process.env.MP_ACCESS_TOKEN;

async function mpFetch(path, opts = {}) {
  const res = await fetch(`${MP_API}${path}`, {
    ...opts,
    headers: { Authorization: `Bearer ${TOKEN()}`, "Content-Type": "application/json", ...(opts.headers || {}) },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    console.error(`MercadoPago ${path} falló:`, res.status, data);
    throw new Error(data?.message || "Error de MercadoPago");
  }
  return data;
}

export async function createCustomer(email) {
  return mpFetch("/v1/customers", { method: "POST", body: JSON.stringify({ email }) });
}

// Adjunta un token de tarjeta (generado client-side) a un customer ya
// existente. Devuelve el card_id reusable y los datos no sensibles
// (últimos 4 dígitos, marca) para mostrarlos en pantalla.
export async function attachCard(customerId, cardToken) {
  const card = await mpFetch(`/v1/customers/${customerId}/cards`, { method: "POST", body: JSON.stringify({ token: cardToken }) });
  return { id: card.id, last4: card.last_four_digits, brand: card.payment_method?.id || card.payment_method?.name };
}

// Crea la suscripción mensual real. Requiere un card_token_id FRESCO (los
// tokens de MP expiran en minutos), generado en el momento de confirmar —
// no sirve el token guardado de hace 15 días. status:"authorized" hace que
// cobre desde ahora, sin pedirle al cliente que pase por un checkout.
export async function createPreapproval({ payerEmail, cardTokenId, amount, reason, externalReference }) {
  return mpFetch("/preapproval", {
    method: "POST",
    body: JSON.stringify({
      reason,
      external_reference: externalReference,
      payer_email: payerEmail,
      card_token_id: cardTokenId,
      auto_recurring: { frequency: 1, frequency_type: "months", transaction_amount: Number(amount), currency_id: "ARS" },
      status: "authorized",
    }),
  });
}

export async function getPreapproval(id) {
  return mpFetch(`/preapproval/${id}`);
}
