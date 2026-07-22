import { supabaseAdmin } from "@/lib/supabase";
import { exchangeCodeForTokens } from "@/lib/googleCalendar";

// Vuelta del consentimiento de Google. Usa supabaseAdmin (no hay que confiar
// en que la sesión del navegador siga viva tras el ida-y-vuelta a Google) y
// el tenant_id viaja en "state", generado únicamente por /api/google/connect
// para el negocio ya autenticado en ese momento.
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const tenantId = searchParams.get("state");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
  if (!code || !tenantId) return Response.redirect(`${baseUrl}/conexiones?google=error`, 302);

  try {
    const tokens = await exchangeCodeForTokens(code, `${baseUrl}/api/google/callback`);
    if (!tokens.refresh_token) {
      // Google no siempre reenvía refresh_token si ya lo habías dado antes
      // (por eso pedimos prompt=consent, pero por las dudas no rompemos).
      return Response.redirect(`${baseUrl}/conexiones?google=sin_refresh_token`, 302);
    }
    const admin = supabaseAdmin();
    await admin.from("tenants").update({
      google_refresh_token: tokens.refresh_token,
      google_calendar_connected: true,
      google_calendar_id: "primary",
    }).eq("id", tenantId);
    return Response.redirect(`${baseUrl}/conexiones?google=ok`, 302);
  } catch (e) {
    console.error("[google callback] error:", e?.message);
    return Response.redirect(`${baseUrl}/conexiones?google=error`, 302);
  }
}
