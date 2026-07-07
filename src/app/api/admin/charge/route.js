import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabase";
import { assertPlatformAdmin } from "@/lib/auth";
import { errorResponse } from "@/lib/apiError";
import { isUuid } from "@/lib/validate";
import { createPaymentPreference } from "@/lib/mercadopago";

// Genera un link de pago único (no recurrente) para facturarle a mano el
// consumo acumulado a una cuenta "cortesía". Vos le mandás el link (por
// WhatsApp, email, como prefieras) cuando decidas cobrarle.
export async function POST(req) {
  try {
    const sb = await supabaseServer();
    await assertPlatformAdmin(sb);
    const b = await req.json();
    if (!isUuid(b.tenant_id)) return Response.json({ ok: false, error: "tenant_id inválido" }, { status: 400 });
    const amount = Number(b.amount);
    if (!Number.isFinite(amount) || amount <= 0) return Response.json({ ok: false, error: "Monto inválido" }, { status: 400 });
    if (!process.env.MP_ACCESS_TOKEN) return Response.json({ ok: false, error: "Falta MP_ACCESS_TOKEN" }, { status: 400 });

    const admin = supabaseAdmin();
    const { data: tenant } = await admin.from("tenants").select("name").eq("id", b.tenant_id).single();
    if (!tenant) return Response.json({ ok: false, error: "Negocio no encontrado" }, { status: 404 });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
    const pref = await createPaymentPreference({
      title: `Consumo BellaOS · ${tenant.name}`,
      amount,
      externalReference: `admin-consumo:${b.tenant_id}`,
      notificationUrl: `${baseUrl}/api/webhook/mercadopago`,
      backUrl: `${baseUrl}/admin`,
    });

    return Response.json({ ok: true, init_point: pref.initPoint });
  } catch (e) {
    return errorResponse(e, { ok: false });
  }
}
