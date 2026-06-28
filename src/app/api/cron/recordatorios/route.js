import { supabaseAdmin } from "@/lib/supabase";
import { sendWhatsApp } from "@/lib/whatsapp";

export async function GET(req) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return new Response("forbidden", { status: 401 });
  }
  try {
    const sb = supabaseAdmin();
    const now = Date.now();
    const in24 = new Date(now + 24 * 36e5).toISOString();
    const in2 = new Date(now + 2 * 36e5).toISOString();
    const nowIso = new Date(now).toISOString();

    async function enviarYMarcar(query, flag) {
      const { data } = await query;
      let enviados = 0;
      for (const a of data || []) {
        const telefono = a.contacts?.telefono;
        if (!telefono) continue;
        const ok = await sendWhatsApp(telefono, `Recordatorio: tenés un turno el ${new Date(a.inicio).toLocaleString("es-AR")}.`);
        if (ok) { await sb.from("appointments").update({ [flag]: true }).eq("id", a.id); enviados++; }
      }
      return enviados;
    }

    const enviados24 = await enviarYMarcar(
      sb.from("appointments").select("id,inicio,contacts(telefono)").eq("recordatorio_24h", false).gte("inicio", nowIso).lte("inicio", in24),
      "recordatorio_24h"
    );
    const enviados2 = await enviarYMarcar(
      sb.from("appointments").select("id,inicio,contacts(telefono)").eq("recordatorio_2h", false).gte("inicio", nowIso).lte("inicio", in2),
      "recordatorio_2h"
    );

    return Response.json({ ok: true, recordatorios_24h: enviados24, recordatorios_2h: enviados2 });
  } catch (e) { return Response.json({ ok: false, error: String(e.message || e) }, { status: 500 }); }
}
