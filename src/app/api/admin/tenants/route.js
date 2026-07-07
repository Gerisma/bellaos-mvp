import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabase";
import { assertPlatformAdmin } from "@/lib/auth";
import { errorResponse } from "@/lib/apiError";
import { getUsage } from "@/lib/usage";

// Vista cross-negocio para el dueño de la plataforma: todos los tenants con
// su estado de facturación y el consumo/costo acumulado del mes. Usa
// supabaseAdmin() a propósito (así se salta el RLS por tenant), pero solo
// después de confirmar que quien pide esto es un admin de la plataforma.
export async function GET() {
  try {
    const sb = await supabaseServer();
    await assertPlatformAdmin(sb);

    const admin = supabaseAdmin();
    const { data: tenants } = await admin
      .from("tenants")
      .select("id,name,plan,billing_status,precio_mensual,created_at")
      .order("created_at", { ascending: false });

    const conUso = await Promise.all((tenants || []).map(async (t) => {
      try {
        const u = await getUsage(admin, t.id);
        return { ...t, uso: u };
      } catch {
        return { ...t, uso: null };
      }
    }));

    return Response.json({ tenants: conUso });
  } catch (e) {
    return errorResponse(e, { tenants: [] });
  }
}
