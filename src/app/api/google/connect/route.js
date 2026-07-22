import { supabaseServer } from "@/lib/supabaseServer";
import { getCurrentTenantId } from "@/lib/auth";
import { errorResponse } from "@/lib/apiError";
import { buildAuthUrl, googleEnabled } from "@/lib/googleCalendar";

// Arranca el OAuth de Google Calendar: redirige a la pantalla de consentimiento
// de Google. El tenant_id viaja en "state" para que el callback sepa a quién
// guardarle el refresh_token (no hay sesión de servidor compartida entre el
// redirect de ida y el de vuelta).
export async function GET(req) {
  try {
    if (!googleEnabled()) return Response.json({ error: "Google Calendar no está configurado todavía (falta GOOGLE_CLIENT_ID/SECRET)." }, { status: 400 });
    const sb = await supabaseServer();
    const tenant_id = await getCurrentTenantId(sb);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
    const url = buildAuthUrl({ redirectUri: `${baseUrl}/api/google/callback`, state: tenant_id });
    return Response.redirect(url, 302);
  } catch (e) {
    return errorResponse(e, {});
  }
}
