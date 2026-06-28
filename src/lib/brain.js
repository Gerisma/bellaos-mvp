import estetica from "../../vertical-packs/estetica.json";

export function composeSystemPrompt({ brand, services }) {
  let p = estetica.system_prompt
    .replace("{{negocio}}", brand?.name || "el negocio")
    .replace("{{tono}}", brand?.tono || "cercano")
    .replace("{{horarios}}", brand?.horarios || "horario comercial");
  const lista = (services || [])
    .map((s) => `- ${s.nombre}: $${s.precio} (${s.duracion_min} min)`)
    .join("\n");
  p += `\n\nServicios y precios:\n${lista || "(sin servicios cargados)"}`;
  return p;
}

export function classifyIntent(text) {
  const t = (text || "").toLowerCase();
  if (/(precio|sale|cuesta|cuanto|cuánto|vale)/.test(t)) return "consultar_precio";
  if (/(turno|reserv|agenda|cita)/.test(t)) return "agendar_turno";
  if (/(horario|abren|abierto|sabado|sábado|domingo|atienden)/.test(t)) return "consultar_horario";
  if (/(cancel)/.test(t)) return "cancelar_turno";
  if (/(queja|reclamo|mal|pesim|horrible)/.test(t)) return "queja";
  return "otro";
}

// Respuesta por reglas (funciona sin LLM, usando los datos del negocio).
export function ruleBasedReply(intent, text, { brand, services }) {
  const t = (text || "").toLowerCase();
  const nombre = brand?.name || "nuestro centro";
  const lista = (services || []);
  const found = lista.find((s) => t.includes((s.nombre || "").toLowerCase().split(" ")[0]));
  switch (intent) {
    case "consultar_precio":
      if (found) return `El ${found.nombre} está $${found.precio} y dura unos ${found.duracion_min} min. ¿Querés que te busque un turno? 😊`;
      if (lista.length) return `Te paso algunos precios:\n` + lista.map(s => `• ${s.nombre}: $${s.precio}`).join("\n") + `\n¿Sobre cuál querés saber más?`;
      return `Contame qué servicio te interesa y te paso el precio 😊`;
    case "agendar_turno":
      return `¡Genial! ¿Para qué servicio y qué día te queda cómodo? Tengo disponibilidad esta semana en ${nombre} 💕`;
    case "consultar_horario":
      return `Nuestro horario es ${brand?.horarios || "de lunes a sábado"}. ¿Querés reservar un turno?`;
    case "cancelar_turno":
      return `Claro, ¿para qué día tenías el turno? Lo cancelo y te libero el lugar.`;
    case "queja":
      return `Lamento el inconveniente. Ya aviso a una persona del equipo para que te ayude personalmente.`;
    default:
      return `¡Hola! Soy el asistente de ${nombre} 💕 Puedo darte precios, horarios y agendarte un turno. ¿En qué te ayudo?`;
  }
}
