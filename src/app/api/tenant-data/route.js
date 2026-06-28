import { supabaseServer } from "@/lib/supabaseServer";
import { getCurrentTenantId } from "@/lib/auth";
import { errorResponse } from "@/lib/apiError";

export async function GET() {
  try {
    const sb = await supabaseServer();
    const tenant_id = await getCurrentTenantId(sb);
    const [{ data: contacts }, { data: services }] = await Promise.all([
      sb.from("contacts").select("id,nombre,stage,canal,ultima_visita,ticket_prom").eq("tenant_id", tenant_id).order("nombre"),
      sb.from("services").select("id,nombre,precio").eq("tenant_id", tenant_id).eq("activo", true),
    ]);
    return Response.json({ contacts: contacts || [], services: services || [] });
  } catch (e) {
    return errorResponse(e, { contacts: [], services: [] });
  }
}
