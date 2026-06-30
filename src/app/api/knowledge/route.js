import { supabaseServer } from "@/lib/supabaseServer";
import { getCurrentTenantId } from "@/lib/auth";
import { embed } from "@/lib/embeddings";
import { errorResponse } from "@/lib/apiError";
import { isNonEmptyString } from "@/lib/validate";

export async function GET() {
  try {
    const sb = await supabaseServer();
    const tenant_id = await getCurrentTenantId(sb);
    const { data } = await sb.from("knowledge_base")
      .select("id,pregunta,respuesta,embedding,created_at")
      .eq("tenant_id", tenant_id)
      .order("created_at", { ascending: false });
    const faqs = (data || []).map(({ embedding, ...f }) => ({ ...f, embedded: embedding != null }));
    return Response.json({ faqs });
  } catch (e) { return errorResponse(e, { faqs: [] }); }
}

export async function POST(req) {
  try {
    const sb = await supabaseServer();
    const tenant_id = await getCurrentTenantId(sb);
    const { pregunta, respuesta } = await req.json();
    if (!isNonEmptyString(pregunta) || !isNonEmptyString(respuesta)) {
      return Response.json({ ok: false, error: "Completá la pregunta y la respuesta" }, { status: 400 });
    }
    const embedding = await embed(pregunta);
    const { data, error } = await sb.from("knowledge_base")
      .insert({ tenant_id, pregunta, respuesta, embedding })
      .select("id,pregunta,respuesta,created_at")
      .single();
    if (error) throw error;
    return Response.json({ ok: true, faq: data, embedded: embedding != null });
  } catch (e) { return errorResponse(e, { ok: false }); }
}

export async function DELETE(req) {
  try {
    const sb = await supabaseServer();
    await getCurrentTenantId(sb); // exige sesión + negocio; RLS scoping queda en el delete
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return Response.json({ ok: false, error: "Falta id" }, { status: 400 });
    await sb.from("knowledge_base").delete().eq("id", id);
    return Response.json({ ok: true });
  } catch (e) { return errorResponse(e, { ok: false }); }
}
