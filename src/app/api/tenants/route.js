import { supabaseAdmin } from "@/lib/supabase";
import { supabaseServer } from "@/lib/supabaseServer";
import { getCurrentUserId } from "@/lib/auth";
import { errorResponse } from "@/lib/apiError";
import { isNonEmptyString } from "@/lib/validate";
import { PLAN_PRECIOS_SUGERIDOS, trialEndsAt } from "@/lib/billing";

// Alta de negocio: crea el tenant y lo asigna al usuario autenticado.
// Server-side con service_role porque es una operación de setup privilegiada
// (no una lectura) — el tenant_id nunca viene del cliente, lo generamos acá.
export async function POST(req) {
  try {
    const sbSession = await supabaseServer();
    const userId = await getCurrentUserId(sbSession);
    const { data: profile } = await sbSession.from("profiles").select("tenant_id").eq("id", userId).single();
    if (profile?.tenant_id) {
      return Response.json({ ok: false, error: "Ya tenés un negocio creado" }, { status: 409 });
    }

    const b = await req.json();
    if (!isNonEmptyString(b.name)) return Response.json({ ok: false, error: "El nombre del negocio es obligatorio" }, { status: 400 });

    const sb = supabaseAdmin();
    const plan = b.plan || "recepcion_ia";
    const { data: tenant, error } = await sb
      .from("tenants")
      .insert({
        name: b.name, plan, status: "active", whatsapp_phone_id: b.whatsapp_phone_id || null,
        billing_status: "trial", trial_ends_at: trialEndsAt(), precio_mensual: PLAN_PRECIOS_SUGERIDOS[plan] || PLAN_PRECIOS_SUGERIDOS.recepcion_ia,
      })
      .select()
      .single();
    if (error) throw error;
    await sb.from("brand_profiles").insert({
      tenant_id: tenant.id, tono: b.tono, diferencial: b.diferencial,
      horarios: b.horarios, direccion: b.direccion,
    });
    const services = (b.services || []).filter((s) => s.nombre).map((s) => ({
      tenant_id: tenant.id, nombre: s.nombre, precio: Number(s.precio) || null,
      duracion_min: Number(s.duracion_min) || null, recompra_dias: Number(s.recompra_dias) || null,
    }));
    if (services.length) await sb.from("services").insert(services);
    await sb.from("profiles").update({ tenant_id: tenant.id }).eq("id", userId);
    return Response.json({ ok: true, tenant_id: tenant.id });
  } catch (e) {
    return errorResponse(e, { ok: false });
  }
}
