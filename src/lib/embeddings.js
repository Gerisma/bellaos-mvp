// Embeddings vía OpenRouter (mismo proveedor y key que el chat, endpoint
// OpenAI-compatible). Devuelve null si no hay key o si falla la llamada —
// nunca corta el flujo de la app, igual que askLLM en src/lib/llm.js.
export async function embed(text) {
  if (!process.env.OPENROUTER_API_KEY || !text) return null;
  try {
    const res = await fetch("https://openrouter.ai/api/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/text-embedding-3-small",
        input: text,
        dimensions: 1536,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data?.[0]?.embedding ?? null;
  } catch {
    return null;
  }
}
