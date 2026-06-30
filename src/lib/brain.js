import estetica from "../../vertical-packs/estetica.json";

export function composeSystemPrompt({ brand, services }, faqs = []) {
  let p = estetica.system_prompt
    .replace("{{negocio}}", brand?.name || "el negocio")
    .replace("{{tono}}", brand?.tono || "cercano")
    .replace("{{horarios}}", brand?.horarios || "horario comercial");
  const lista = (services || [])
    .map((s) => `- ${s.nombre}: $${s.precio} (${s.duracion_min} min)`)
    .join("\n");
  p += `\n\nServicios y precios:\n${lista || "(sin servicios cargados)"}`;
  if (faqs?.length) {
    p += `\n\nPreguntas frecuentes relevantes (usalas si ayudan a responder, ignoralas si no aplican):\n`
      + faqs.map((f) => `P: ${f.pregunta}\nR: ${f.respuesta}`).join("\n\n");
  }
  return p;
}

export function classifyIntent(text) {
  const t = (text || "").toLowerCase().trim();
  if (/(precio|sale|cuesta|cuanto|cuánto|vale|tarifa|cobran)/.test(t)) return "consultar_precio";
  if (/(turno|reserv|agend|cita|anotame|anotar)/.test(t)) return "agendar_turno";
  if (/(horario|abren|cierran|abierto|sabado|sábado|domingo|atienden|que d[ií]a)/.test(t)) return "consultar_horario";
  if (/(direcci[oó]n|ubicaci[oó]n|d[oó]nde (queda|est[aá]n|est[aá])|c[oó]mo llegar)/.test(t)) return "consultar_direccion";
  if (/(cancel|anular|no voy a poder|no puedo ir)/.test(t)) return "cancelar_turno";
  if (/(queja|reclamo|\bmal\b|pesim|horrible|terrible|enojad)/.test(t)) return "queja";
  if (/^(hola|buenas|buen d[ií]a|buenos d[ií]as|buenas tardes|buenas noches)\b/.test(t)) return "saludo";
  return "otro";
}

// Respuesta por reglas (funciona sin LLM, usando los datos del negocio).
export function ruleBasedReply(intent, text, { brand, services }) {
  const t = (text || "").toLowerCase();
  const nombre = brand?.name || "nuestro centro";
  const lista = (services || []);
  const found = lista.find((s) => {
    const palabras = (s.nombre || "").toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    return palabras.some((w) => new RegExp(`\\b${w}\\b`).test(t));
  });
  switch (intent) {
    case "consultar_precio":
      if (found) return `El ${found.nombre} está $${found.precio} y dura unos ${found.duracion_min} min. ¿Querés que te busque un turno? 😊`;
      if (lista.length) return `Te paso algunos precios:\n` + lista.map(s => `• ${s.nombre}: $${s.precio}`).join("\n") + `\n¿Sobre cuál querés saber más?`;
      return `Contame qué servicio te interesa y te paso el precio 😊`;
    case "agendar_turno":
      return `¡Genial! ¿Para qué servicio y qué día te queda cómodo? Tengo disponibilidad esta semana en ${nombre} 💕`;
    case "consultar_horario":
      return `Nuestro horario es ${brand?.horarios || "de lunes a sábado"}. ¿Querés reservar un turno?`;
    case "consultar_direccion":
      return brand?.direccion ? `Estamos en ${brand.direccion}. ¿Te paso cómo llegar? 😊` : `Contame tu zona y te paso la dirección exacta 😊`;
    case "cancelar_turno":
      return `Claro, ¿para qué día tenías el turno? Lo cancelo y te libero el lugar.`;
    case "queja":
      return `Lamento el inconveniente. Ya aviso a una persona del equipo para que te ayude personalmente.`;
    case "saludo":
      return `¡Hola! Soy el asistente de ${nombre} 💕 ¿En qué te puedo ayudar hoy?`;
    default:
      return `¡Hola! Soy el asistente de ${nombre} 💕 Puedo darte precios, horarios y agendarte un turno. ¿En qué te ayudo?`;
  }
}
