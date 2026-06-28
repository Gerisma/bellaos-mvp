import { supabaseServer } from "@/lib/supabaseServer";
import { getCurrentTenantId } from "@/lib/auth";
import { loadTenantContext, generateReply } from "@/lib/responder";
import { errorResponse } from "@/lib/apiError";

export async function POST(req) {
  try {
    const sb = await supabaseServer();
    const tenant_id = await getCurrentTenantId(sb);
    const { message } = await req.json();
    const ctx = await loadTenantContext({ tenantId: tenant_id });
    if (!ctx) return Response.json({ error: "Negocio no encontrado" }, { status: 404 });
    const res = await generateReply(ctx, message || "");
    return Response.json(res);
  } catch (e) {
    return errorResponse(e);
  }
}
