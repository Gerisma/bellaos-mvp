import { supabaseServer } from "@/lib/supabaseServer";
import { getCurrentTenantId } from "@/lib/auth";
import { errorResponse } from "@/lib/apiError";
import { isNonEmptyString } from "@/lib/validate";
import { exchangeLongLivedUserToken, getPaginasDelUsuario, getInstagramBusinessId, subscribePageWebhooks } from "@/lib/metaGraph";

export async function GET() {
  try {
    const sb = await supabaseServer();
    const tenant_id = await getCurrentTenantId(sb);
    const { data } = await sb.from("tenants").select("fb_page_id,ig_connected,ig_business_id").eq("id", tenant_id).single();
    return Response.json({ connected: !!data?.fb_page_id, ig_connected: !!data?.ig_connected });
  } catch (e) {
    return errorResponse(e, { connected: false });
  }
}

// Recibe el token corto que entrega el FB.login del navegador, lo cambia por
// uno de larga duración, toma la primera Página que administra el usuario y
// (si tiene una cuenta de Instagram Business vinculada) guarda también el
// ig_business_id. Suscribe la Página a los webhooks de mensajería para que,
// cuando exista el adapter de Conversaciones para IG/FB, ya reciba los
// eventos sin volver a pasar por este paso.
export async function POST(req) {
  try {
    const sb = await supabaseServer();
    const tenant_id = await getCurrentTenantId(sb);
    const b = await req.json();
    if (!isNonEmptyString(b.userAccessToken)) return Response.json({ ok: false, error: "Falta el token de Facebook" }, { status: 400 });

    const longLived = await exchangeLongLivedUserToken(b.userAccessToken);
    const paginas = await getPaginasDelUsuario(longLived);
    if (!paginas.length) return Response.json({ ok: false, error: "Tu usuario de Facebook no administra ninguna Página. Creá una Página de Facebook primero." }, { status: 400 });

    const pagina = paginas[0]; // MVP: la primera página; a futuro se puede dejar elegir si administra varias.
    const igBusinessId = await getInstagramBusinessId(pagina.id, pagina.access_token);
    await subscribePageWebhooks(pagina.id, pagina.access_token);

    const { error } = await sb.from("tenants").update({
      fb_page_id: pagina.id, fb_page_token: pagina.access_token,
      ig_business_id: igBusinessId, ig_connected: !!igBusinessId,
    }).eq("id", tenant_id);
    if (error) throw error;

    return Response.json({ ok: true, page_name: pagina.name, ig_connected: !!igBusinessId });
  } catch (e) {
    return errorResponse(e, { ok: false });
  }
}
