import { supabaseAdmin } from "@/lib/supabase";
import { getUsage } from "@/lib/usage";
import { errorResponse } from "@/lib/apiError";
export async function GET(req) {
  try {
    const tenant_id = new URL(req.url).searchParams.get("tenant_id");
    return Response.json(await getUsage(supabaseAdmin(), tenant_id));
  } catch (e) { return errorResponse(e); }
}
export async function POST(req) {
  try {
    const { tenant_id, tope_marketing } = await req.json();
    let val = null;
    if (tope_marketing !== "" && tope_marketing != null) {
      val = Number(tope_marketing);
      if (!Number.isFinite(val) || val < 0) return Response.json({ ok: false, error: "tope_marketing debe ser un número >= 0" }, { status: 400 });
    }
    const sb = supabaseAdmin();
    await sb.from("tenants").update({ tope_marketing: val }).eq("id", tenant_id);
    return Response.json({ ok: true, uso: await getUsage(sb, tenant_id) });
  } catch (e) { return errorResponse(e, { ok: false }); }
}
