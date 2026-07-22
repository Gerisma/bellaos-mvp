import { sendWhatsAppTemplate } from "./whatsapp";
import { TEMPLATES } from "./templates";

// Avisa a la DUEÑA del negocio (no a la clienta) por WhatsApp cuando pasa
// algo que le conviene saber ya: un turno que agendó sola la IA, o una
// conversación derivada a un humano. Usa plantilla (no texto libre) porque
// el número de la dueña normalmente no abrió una ventana de 24h con su
// propio bot — Meta exige plantilla aprobada para mensajes que inicia el
// negocio fuera de esa ventana. Nunca rompe el flujo principal si falla.
export async function notificarDuena(tenant, mensaje) {
  if (!tenant?.notif_whatsapp_telefono) return; // no configuró a dónde avisarle
  try {
    await sendWhatsAppTemplate(tenant.notif_whatsapp_telefono, {
      phoneId: tenant.whatsapp_phone_id,
      token: tenant.whatsapp_token,
      template: TEMPLATES.avisoDueno,
      params: [tenant.name || "tu negocio", mensaje],
    });
  } catch (e) {
    console.error("[notify] no se pudo avisar a la dueña:", e?.message);
  }
}
