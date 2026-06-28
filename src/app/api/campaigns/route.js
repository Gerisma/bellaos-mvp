import { supabaseServer } from "@/lib/supabaseServer";
import { getCurrentTenantId } from "@/lib/auth";
import { incUsage, getUsage } from "@/lib/usage";
import { errorResponse } from "@/lib/apiError";

export async function GET(req) {
  try {
    const sb = await supabaseServer();
    const tenant_id = await getCurrentTenantId(sb);
    const { searchParams } = new URL(req.url);
    if (searchParams.get("inactivas")) {
      const cutoff = new Date(Date.now() - 90 * 864e5).toISOString().slice(0, 10);
      const { data } = await sb.from("contacts").select("id,nombre,ultima_visita,stage")
        .eq("tenant_id", tenant_id).or(`ultima_visita.lt.${cutoff},stage.in.(en_riesgo,inactiva)`);
      return Response.json({ inactivas: data || [] });
    }
    const { data } = await sb.from("campaigns").select("*").eq("tenant_id", tenant_id).order("created_at", { ascending: false });
    return Response.json({ campaigns: data || [] });
  } catch (e) { return errorResponse(e); }
}

export async function POST(req) {
  try {
    const sb = await supabaseServer();
    const tenant_id = await getCurrentTenantId(sb);
    const b = await req.json();
    const cutoff = new Date(Date.now() - 90 * 864e5).toISOString().slice(0, 10);
    const { data: inactivas } = await sb.from("contacts").select("id")
      .eq("tenant_id", tenant_id).or(`ultima_visita.lt.${cutoff},stage.in.(en_riesgo,inactiva)`);
    const { data: camp, error } = await sb.from("campaigns").insert({
      tenant_id, nombre: b.nombre || "Te extrañamos 💕",
      plantilla: b.plantilla || "Hola {{nombre}}! Hace un tiempo que no te vemos. Te dejamos 20% off esta semana 💕",
      estado: "borrador",
    }).select().single();
    if (error) throw error;
    if (inactivas?.length) await sb.from("campaign_targets").insert(inactivas.map(c => ({ campaign_id: camp.id, contact_id: c.id })));
    return Response.json({ ok: true, campaign_id: camp.id, total: inactivas?.length || 0 });
  } catch (e) { return errorResponse(e, { ok: false }); }
}

// Enviar tanda respetando el tope mensual (si está configurado) y contando el consumo.
export async function PATCH(req) {
  try {
    const sb = await supabaseServer();
    await getCurrentTenantId(sb); // exige sesión + negocio; RLS scoping queda en la query de campaña
    const { campaign_id, tanda = 100 } = await req.json();
    const { data: camp } = await sb.from("campaigns").select("tenant_id").eq("id", campaign_id).single();
    if (!camp) return Response.json({ ok: false, error: "Campaña no encontrada" }, { status: 404 });

    let uso = await getUsage(sb, camp.tenant_id);
    // cuánto se puede enviar sin pasar el tope (si hay tope)
    let permitido = tanda;
    if (uso.tope != null) permitido = Math.max(0, Math.min(tanda, uso.tope - uso.used));
    if (permitido <= 0) {
      return Response.json({ ok: true, enviados: 0, frenado: true, motivo: "Tope mensual alcanzado", uso });
    }

    const { data: targets } = await sb.from("campaign_targets")
      .select("id").eq("campaign_id", campaign_id).eq("estado", "pendiente").limit(permitido);
    let enviados = 0;
    for (const t of targets || []) {
      await sb.from("campaign_targets").update({ estado: "enviado", enviado_at: new Date().toISOString() }).eq("id", t.id);
      enviados++;
    }
    if (enviados) await incUsage(sb, camp.tenant_id, "mensajes_marketing", enviados);
    await sb.from("campaigns").update({ estado: "enviando" }).eq("id", campaign_id);
    uso = await getUsage(sb, camp.tenant_id);
    const { count: pendientes } = await sb.from("campaign_targets")
      .select("id", { count: "exact", head: true }).eq("campaign_id", campaign_id).eq("estado", "pendiente");
    const frenado = uso.tope != null && uso.used >= uso.tope && (pendientes || 0) > 0;
    return Response.json({ ok: true, enviados, frenado, uso });
  } catch (e) { return errorResponse(e, { ok: false }); }
}
