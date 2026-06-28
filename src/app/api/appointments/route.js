import { supabaseServer } from "@/lib/supabaseServer";
import { getCurrentTenantId } from "@/lib/auth";
import { errorResponse } from "@/lib/apiError";
import { isUuid, isValidDate } from "@/lib/validate";

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
    if (b.contact_id) {
      await sb.from("contacts").update({ stage: "turno_agendado" }).eq("id", b.contact_id);
    }
    return Response.json({ ok: true, appointment: data });
  } catch (e) {
    return errorResponse(e, { ok: false });
  }
}
