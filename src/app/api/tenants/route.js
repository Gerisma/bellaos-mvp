import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const sb = supabaseAdmin();
    const { data } = await sb.from("tenants").select("id,name,plan,status").order("name");
    return Response.json({ tenants: data || [] });
  } catch (e) {
    return Response.json({ tenants: [], error: "Sin conexión a Supabase" });
  }
}

export async function POST(req) {
  try {
    const b = await req.json();
    const sb = supabaseAdmin();
    const { data: tenant, error } = await sb
      .from("tenants")
      .insert({ name: b.name, plan: b.plan || "recepcion_ia", status: "active", whatsapp_phone_id: b.whatsapp_phone_id || null })
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
    return Response.json({ ok: true, tenant_id: tenant.id });
  } catch (e) {
    return Response.json({ ok: false, error: String(e.message || e) }, { status: 500 });
  }
}
