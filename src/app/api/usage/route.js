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
    const sb = supabaseAdmin();
    const val = tope_marketing === "" || tope_marketing == null ? null : Number(tope_marketing);
    await sb.from("tenants").update({ tope_marketing: val }).eq("id", tenant_id);
    return Response.json({ ok: true, uso: await getUsage(sb, tenant_id) });
  } catch (e) { return errorResponse(e, { ok: false }); }
}
