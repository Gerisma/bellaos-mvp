import { supabaseServer } from "@/lib/supabaseServer";
import { getCurrentTenantId } from "@/lib/auth";
import { errorResponse } from "@/lib/apiError";
import { askLLM } from "@/lib/llm";

const TIPO_PROMPT = {
  promo: "una promoción o descuento puntual, con urgencia suave (sin sonar desesperado)",
  tip: "un tip o consejo útil relacionado al rubro, que aporte valor aunque no vendan nada ese día",
  testimonio: "un posteo tipo testimonio/antes-después, sin inventar datos falsos ni citas de personas reales — dejar un espacio [PEGAR TESTIMONIO REAL] si hace falta una frase textual",
  novedad: "el anuncio de un servicio nuevo o una novedad del local",
  fecha_especial: "un posteo para una fecha especial del calendario (día de la madre, primavera, etc.), conectándolo con los servicios del negocio",
};

// Genera copy para Instagram/Facebook con el LLM ya configurado (OpenRouter).
// No publica solo: Meta exige permisos de Content Publishing API que todavía
// no están aprobados para esta cuenta, así que el texto queda listo para
// copiar y pegar (o programar a mano) hasta que se pueda automatizar el paso final.
export async function POST(req) {
  try {
    const sb = await supabaseServer();
    const tenant_id = await getCurrentTenantId(sb);
    const b = await req.json();
    const tipo = TIPO_PROMPT[b.tipo] ? b.tipo : "promo";
    const extra = (b.instrucciones || "").slice(0, 400);

    const [{ data: tenant }, { data: bp }, { data: services }] = await Promise.all([
      sb.from("tenants").select("name").eq("id", tenant_id).single(),
      sb.from("brand_profiles").select("tono,diferencial,horarios,direccion").eq("tenant_id", tenant_id).single(),
      sb.from("services").select("nombre,precio").eq("tenant_id", tenant_id).eq("activo", true),
    ]);

    if (!process.env.OPENROUTER_API_KEY) {
      return Response.json({ ok: false, error: "Falta OPENROUTER_API_KEY para generar contenido con IA." }, { status: 400 });
    }

    const listaServicios = (services || []).map((s) => `- ${s.nombre}${s.precio ? ` ($${s.precio})` : ""}`).join("\n") || "(sin servicios cargados)";
    const sys = `Sos redactor/a de contenido para redes sociales (Instagram/Facebook) de "${tenant?.name || "el negocio"}", un negocio de estética/peluquería/bienestar. Tono: ${bp?.tono || "cercano y profesional"}. Diferencial del negocio: ${bp?.diferencial || "atención personalizada"}.
Servicios disponibles:
${listaServicios}
Escribí ${TIPO_PROMPT[tipo]}.
Reglas: máximo 80 palabras, en español rioplatense, sin inventar precios ni promociones que no te dieron, con 1-2 emojis como máximo y terminá con 3 a 5 hashtags relevantes en español. Devolvé SOLO el texto del posteo, sin explicaciones ni comillas.`;

    const texto = await askLLM(sys, [{ role: "user", content: extra ? `Instrucciones adicionales: ${extra}` : "Generá el posteo." }]);
    return Response.json({ ok: true, texto: (texto || "").trim() });
  } catch (e) {
    return errorResponse(e, { ok: false });
  }
}
