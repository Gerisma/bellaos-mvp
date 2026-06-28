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
    const { data } = await sb.from("conversations").select("id,canal,estado,created_at,contacts(nombre,telefono)").eq("tenant_id", tenant_id).order("created_at", { ascending: false }).limit(50);
    return Response.json({ conversations: data || [] });
  } catch (e) { return errorResponse(e); }
}
