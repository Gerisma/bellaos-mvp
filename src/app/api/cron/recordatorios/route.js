import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const sb = supabaseAdmin();
    const now = Date.now();
    const in24 = new Date(now + 24 * 36e5).toISOString();
    const in2 = new Date(now + 2 * 36e5).toISOString();
    const nowIso = new Date(now).toISOString();

    // 24 h antes
    const { data: a24 } = await sb.from("appointments").select("id")
      .eq("recordatorio_24h", false).gte("inicio", nowIso).lte("inicio", in24);
    for (const a of a24 || []) await sb.from("appointments").update({ recordatorio_24h: true }).eq("id", a.id);
    // 2 h antes
    const { data: a2 } = await sb.from("appointments").select("id")
      .eq("recordatorio_2h", false).gte("inicio", nowIso).lte("inicio", in2);
    for (const a of a2 || []) await sb.from("appointments").update({ recordatorio_2h: true }).eq("id", a.id);

    return Response.json({ ok: true, recordatorios_24h: a24?.length || 0, recordatorios_2h: a2?.length || 0 });
  } catch (e) { return Response.json({ ok: false, error: String(e.message || e) }, { status: 500 }); }
}
