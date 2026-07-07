import { supabaseServer } from "@/lib/supabaseServer";
import { getCurrentTenantId } from "@/lib/auth";
import { errorResponse } from "@/lib/apiError";
import { isUuid } from "@/lib/validate";
import { createPaymentPreference } from "@/lib/mercadopago";

// Genera un link de MercadoPago para cobrar la seña de un turno propio del
// tenant autenticado. El monto lo decide quien cobra (no viene de un precio
// fijo), porque la seña suele ser una fracción del servicio.
export async function POST(req) {
  try {
    const sb = await supabaseServer();
    const tenant_id = await getCurrentTenantId(sb);
    const b = await req.json();
    if (!isUuid(b.appointment_id)) return Response.json({ ok: false, error: "appointment_id inválido" }, { status: 400 });
    const amount = Number(b.amount);
    if (!Number.isFinite(amount) || amount <= 0) return Response.json({ ok: false, error: "Monto inválido" }, { status: 400 });

    const { data: appt } = await sb.from("appointments")
      .select("id,tenant_id,service_id,services(nombre)")
      .eq("id", b.appointment_id).eq("tenant_id", tenant_id).single();
    if (!appt) return Response.json({ ok: false, error: "Turno no encontrado" }, { status: 404 });

    const { data: tenant } = await sb.from("tenants").select("name,mp_access_token").eq("id", tenant_id).single();
    // Guard claro: sin token de MercadoPago (ni del tenant ni global) no hay
    // forma de cobrar — mejor un mensaje accionable que un 500 genérico.
    if (!tenant?.mp_access_token && !process.env.MP_ACCESS_TOKEN) {
      return Response.json(
        { ok: false, error: "MercadoPago no está configurado todavía. Cargá MP_ACCESS_TOKEN en las variables de entorno (o el token del negocio) para cobrar señas." },
        { status: 400 }
      );
    }
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
    const pref = await createPaymentPreference({
      token: tenant?.mp_access_token,
      title: `Seña · ${appt.services?.nombre || "turno"} · ${tenant?.name || ""}`,
      amount,
      externalReference: `${tenant_id}:${appt.id}`,
      notificationUrl: `${baseUrl}/api/webhook/mercadopago`,
      backUrl: `${baseUrl}/agenda`,
    });

    await sb.from("appointments").update({ sena_monto: amount }).eq("id", appt.id);
    return Response.json({ ok: true, init_point: pref.initPoint });
  } catch (e) {
    return errorResponse(e, { ok: false });
  }
}
