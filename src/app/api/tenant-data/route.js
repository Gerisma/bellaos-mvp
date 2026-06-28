import { supabaseAdmin } from "@/lib/supabase";
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const tenant_id = searchParams.get("tenant_id");
    const sb = supabaseAdmin();
    const [{ data: contacts }, { data: services }] = await Promise.all([
      sb.from("contacts").select("id,nombre,stage,canal,ultima_visita,ticket_prom").eq("tenant_id", tenant_id).order("nombre"),
      sb.from("services").select("id,nombre,precio").eq("tenant_id", tenant_id).eq("activo", true),
    ]);
    return Response.json({ contacts: contacts || [], services: services || [] });
  } catch (e) {
    return Response.json({ contacts: [], services: [], error: String(e.message || e) });
  }
}
