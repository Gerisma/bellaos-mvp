import { loadTenantContext, generateReply } from "@/lib/responder";
import { safeError } from "@/lib/apiError";

export async function POST(req) {
  try {
    const { tenant_id, message } = await req.json();
    const ctx = await loadTenantContext({ tenantId: tenant_id });
    if (!ctx) return Response.json({ error: "Negocio no encontrado" }, { status: 404 });
    const res = await generateReply(ctx, message || "");
    return Response.json(res);
  } catch (e) {
    return Response.json({ error: safeError(e) }, { status: 500 });
  }
}
