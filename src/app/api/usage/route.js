import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentTenantId } from "@/lib/auth";
import { getUsage } from "@/lib/usage";
import { errorResponse } from "@/lib/apiError";

export async function GET() {
  try {
    const sb = await supabaseServer();
    const tenant_id = await getCurrentTenantId(sb);
    return Response.json(await getUsage(sb, tenant_id));
  } catch (e) { return errorResponse(e); }
}

export async function POST(req) {
  try {
    const sb = await supabaseServer();
    const tenant_id = await getCurrentTenantId(sb);
    const { tope_marketing } = await req.json();
    let val = null;
    if (tope_marketing !== "" && tope_marketing != null) {
      val = Number(tope_marketing);
      if (!Number.isFinite(val) || val < 0) return Response.json({ ok: false, error: "tope_marketing debe ser un número >= 0" }, { status: 400 });
    }
    // tenants no tiene policy de update (solo lectura propia) — el tope se
    // escribe server-side con admin, pero el tenant_id ya está resuelto de
    // forma segura desde la sesión, no desde el body.
    const admin = supabaseAdmin();
    await admin.from("tenants").update({ tope_marketing: val }).eq("id", tenant_id);
    return Response.json({ ok: true, uso: await getUsage(sb, tenant_id) });
  } catch (e) { return errorResponse(e, { ok: false }); }
}
