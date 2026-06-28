import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const tenant_id = searchParams.get("tenant_id");
    const sb = supabaseAdmin();
    let q = sb.from("appointments")
      .select("id,inicio,estado,sena_pagada,contact_id,service_id")
      .order("inicio", { ascending: true });
    if (tenant_id) q = q.eq("tenant_id", tenant_id);
    const { data } = await q;
    return Response.json({ appointments: data || [] });
  } catch (e) {
    return Response.json({ appointments: [], error: String(e.message || e) });
  }
}

export async function POST(req) {
  try {
    const b = await req.json();
    const sb = supabaseAdmin();
    const { data, error } = await sb.from("appointments").insert({
      tenant_id: b.tenant_id, contact_id: b.contact_id || null,
      service_id: b.service_id || null, inicio: b.inicio, estado: "agendado",
    }).select().single();
    if (error) throw error;
    if (b.contact_id) {
      await sb.from("contacts").update({ stage: "turno_agendado" }).eq("id", b.contact_id);
    }
    return Response.json({ ok: true, appointment: data });
  } catch (e) {
    return Response.json({ ok: false, error: String(e.message || e) }, { status: 500 });
  }
}
