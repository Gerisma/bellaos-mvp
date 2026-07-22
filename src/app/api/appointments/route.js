import { supabaseServer } from "@/lib/supabaseServer";
import { getCurrentTenantId } from "@/lib/auth";
import { errorResponse } from "@/lib/apiError";
import { isUuid, isValidDate } from "@/lib/validate";
import { sendWhatsAppTemplate } from "@/lib/whatsapp";
import { TEMPLATES } from "@/lib/templates";
import { crearEventoEspejo } from "@/lib/googleCalendar";

export async function GET() {
  try {
    const sb = await supabaseServer();
    const tenant_id = await getCurrentTenantId(sb);
    const { data } = await sb.from("appointments")
      .select("id,inicio,estado,sena_pagada,contact_id,service_id")
      .eq("tenant_id", tenant_id)
      .order("inicio", { ascending: true });
    return Response.json({ appointments: data || [] });
  } catch (e) {
    return errorResponse(e, { appointments: [] });
  }
}

export async function POST(req) {
  try {
    const sb = await supabaseServer();
    const tenant_id = await getCurrentTenantId(sb);
    const b = await req.json();
    if (!isValidDate(b.inicio)) return Response.json({ ok: false, error: "inicio inválido" }, { status: 400 });
    if (b.contact_id && !isUuid(b.contact_id)) return Response.json({ ok: false, error: "contact_id inválido" }, { status: 400 });
    if (b.service_id && !isUuid(b.service_id)) return Response.json({ ok: false, error: "service_id inválido" }, { status: 400 });
    const { data, error } = await sb.from("appointments").insert({
      tenant_id, contact_id: b.contact_id || null,
      service_id: b.service_id || null, inicio: b.inicio, estado: "agendado",
    }).select().single();
    if (error) throw error;
    const [{ data: contact }, { data: tenant }, { data: service }] = await Promise.all([
      b.contact_id ? sb.from("contacts").select("nombre,telefono").eq("id", b.contact_id).single() : Promise.resolve({ data: null }),
      sb.from("tenants").select("name,whatsapp_phone_id,whatsapp_token,google_calendar_connected,google_refresh_token,google_calendar_id").eq("id", tenant_id).single(),
      b.service_id ? sb.from("services").select("nombre,duracion_min").eq("id", b.service_id).single() : Promise.resolve({ data: null }),
    ]);
    if (b.contact_id) {
      await sb.from("contacts").update({ stage: "turno_agendado" }).eq("id", b.contact_id);
      // Confirmación de turno: mensaje iniciado por el negocio (lo agenda el
      // staff desde /agenda, no necesariamente respondiendo un mensaje
      // reciente del cliente), así que tiene que ser plantilla aprobada.
      try {
        if (contact?.telefono) {
          await sendWhatsAppTemplate(contact.telefono, {
            phoneId: tenant?.whatsapp_phone_id,
            token: tenant?.whatsapp_token,
            template: TEMPLATES.confirmacionTurno,
            params: [contact.nombre || "", new Date(b.inicio).toLocaleString("es-AR"), service?.nombre || "tu turno"],
          });
        }
      } catch (e) { /* no frenar la creación del turno si falla el envío */ }
    }
    if (tenant?.google_calendar_connected && tenant?.google_refresh_token) {
      try {
        const googleEventId = await crearEventoEspejo({
          refreshToken: tenant.google_refresh_token, calendarId: tenant.google_calendar_id,
          titulo: `${service?.nombre || "Turno"} · ${contact?.nombre || "Clienta"}`,
          descripcion: `Agendado desde BellaOS (${tenant.name || ""}).`,
          inicioIso: b.inicio, duracionMin: service?.duracion_min,
        });
        if (googleEventId) await sb.from("appointments").update({ google_event_id: googleEventId }).eq("id", data.id);
      } catch (e) { /* el espejo de Google nunca frena el turno real */ }
    }
    return Response.json({ ok: true, appointment: data });
  } catch (e) {
    return errorResponse(e, { ok: false });
  }
}
