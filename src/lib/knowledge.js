import { embed } from "./embeddings";

// Búsqueda semántica de FAQs relevantes para un mensaje. Devuelve [] (sin
// pegarle a la base) si no hay OPENROUTER_API_KEY — el RAG solo enriquece
// el camino del LLM, nunca el de reglas.
export async function searchFAQs(sb, tenant_id, text, { matchCount = 3, minSimilarity = 0.3 } = {}) {
  const embedding = await embed(text);
  if (!embedding) return [];
  const { data, error } = await sb.rpc("match_knowledge_base", {
    p_tenant_id: tenant_id,
    query_embedding: embedding,
    match_count: matchCount,
  });
  if (error) return [];
  return (data || []).filter((f) => f.similarity >= minSimilarity);
}
