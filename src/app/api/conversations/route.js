import { supabaseAdmin } from "@/lib/supabase";
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const tenant_id = searchParams.get("tenant_id");
    const conversation_id = searchParams.get("conversation_id");
    const sb = supabaseAdmin();
    if (conversation_id) {
      const { data } = await sb.from("messages").select("rol,texto,intent,created_at").eq("conversation_id", conversation_id).order("created_at");
      return Response.json({ messages: data || [] });
    }
    const { data } = await sb.from("conversations").select("id,canal,estado,created_at,contacts(nombre,telefono)").eq("tenant_id", tenant_id).order("created_at", { ascending: false }).limit(50);
    return Response.json({ conversations: data || [] });
  } catch (e) { return Response.json({ error: String(e.message || e) }); }
}
