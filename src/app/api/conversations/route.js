import { supabaseServer } from "@/lib/supabaseServer";
import { getCurrentTenantId } from "@/lib/auth";
import { errorResponse } from "@/lib/apiError";

export async function GET(req) {
  try {
    const sb = await supabaseServer();
    const tenant_id = await getCurrentTenantId(sb);
    const { searchParams } = new URL(req.url);
    const conversation_id = searchParams.get("conversation_id");
    if (conversation_id) {
      // RLS filtra por tenant_id igual, aunque acá no se pase explícito.
      const { data } = await sb.from("messages").select("rol,texto,intent,created_at").eq("conversation_id", conversation_id).order("created_at");
      return Response.json({ messages: data || [] });
    }
    const [{ data: convs }, { data: lastMsgs }] = await Promise.all([
      sb.from("conversations").select("id,canal,estado,created_at,contacts(nombre,telefono)").eq("tenant_id", tenant_id).order("created_at", { ascending: false }).limit(50),
      sb.from("messages").select("conversation_id,texto,rol,created_at").eq("tenant_id", tenant_id).order("created_at", { ascending: false }).limit(300),
    ]);
    const ultimoPorConv = {};
    for (const m of lastMsgs || []) {
      if (!ultimoPorConv[m.conversation_id]) ultimoPorConv[m.conversation_id] = m;
    }
    const conversations = (convs || [])
      .map((c) => ({ ...c, ultimo: ultimoPorConv[c.id] || null }))
      .sort((a, b) => new Date(b.ultimo?.created_at || b.created_at) - new Date(a.ultimo?.created_at || a.created_at));
    return Response.json({ conversations });
  } catch (e) { return errorResponse(e); }
}
