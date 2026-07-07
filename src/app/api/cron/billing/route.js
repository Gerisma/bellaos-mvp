import { supabaseAdmin } from "@/lib/supabase";
import { safeError } from "@/lib/apiError";

// Corre una vez por día (ver vercel.json): vence las pruebas de 15 días que
// no fueron confirmadas y bloquea el acceso de esos negocios hasta que el
// dueño de esa cuenta confirme la suscripción en /suscripcion.
export async function GET(req) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return new Response("forbidden", { status: 401 });
  }
  try {
    const sb = supabaseAdmin();
    const { data, error } = await sb
      .from("tenants")
      .update({ billing_status: "bloqueado" })
      .eq("billing_status", "trial")
      .lt("trial_ends_at", new Date().toISOString())
      .select("id");
    if (error) throw error;
    return Response.json({ ok: true, bloqueados: data?.length || 0 });
  } catch (e) { return Response.json({ ok: false, error: safeError(e) }, { status: 500 }); }
}
