// Llamada al LLM via OpenRouter.
export async function askLLM(systemPrompt, messages) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      max_tokens: 500,
    }),
  });
  if (!res.ok) {
    console.error("OpenRouter chat completions falló:", res.status, await res.text().catch(() => ""));
    return "Disculpa, hubo un problema. Te respondemos en breve.";
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}
