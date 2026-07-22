// Parseo de "agendame un corte mañana a las 15hs" en texto libre (español,
// Argentina) para que el asistente pueda agendar turnos solo, sin que la
// clienta tenga que usar un formulario. Es deliberadamente conservador: si
// no encuentra fecha + hora + servicio con confianza razonable, no agenda
// nada y deja que la conversación normal (LLM o reglas) pida lo que falta.
// Todas las horas se anclan a America/Argentina (UTC-3 fijo, sin horario de
// verano) para que "las 15hs" no dependa de en qué servidor corre Vercel.

const DIAS = ["domingo", "lunes", "martes", "miercoles", "miércoles", "jueves", "viernes", "sabado", "sábado"];
const DIA_INDEX = { domingo: 0, lunes: 1, martes: 2, miercoles: 3, "miércoles": 3, jueves: 4, viernes: 5, sabado: 6, "sábado": 6 };

function pad(n) { return String(n).padStart(2, "0"); }

// "Ahora" en hora de Argentina, como {y,m,d}, sin depender del huso del server.
function hoyArgentina() {
  const nowUtc = new Date();
  const arg = new Date(nowUtc.getTime() - 3 * 60 * 60 * 1000);
  return { y: arg.getUTCFullYear(), m: arg.getUTCMonth() + 1, d: arg.getUTCDate() };
}

function sumarDias({ y, m, d }, dias) {
  const base = new Date(Date.UTC(y, m - 1, d));
  base.setUTCDate(base.getUTCDate() + dias);
  return { y: base.getUTCFullYear(), m: base.getUTCMonth() + 1, d: base.getUTCDate() };
}

function diaSemanaDe({ y, m, d }) {
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0=domingo
}

function parseFechaTexto(t) {
  if (/pasado\s*ma[ñn]ana/.test(t)) return sumarDias(hoyArgentina(), 2);
  if (/\bma[ñn]ana\b/.test(t)) return sumarDias(hoyArgentina(), 1);
  if (/\bhoy\b/.test(t)) return hoyArgentina();

  // dd/mm o dd-mm (opcional /yyyy)
  const fechaExplicita = t.match(/\b(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?\b/);
  if (fechaExplicita) {
    const d = Number(fechaExplicita[1]); const m = Number(fechaExplicita[2]);
    let y = fechaExplicita[3] ? Number(fechaExplicita[3]) : hoyArgentina().y;
    if (y < 100) y += 2000;
    if (d >= 1 && d <= 31 && m >= 1 && m <= 12) return { y, m, d };
  }

  // día de la semana ("el lunes", "este viernes", "próximo martes")
  const diaMatch = t.match(/\b(domingo|lunes|martes|mi[ée]rcoles|jueves|viernes|s[áa]bado)\b/);
  if (diaMatch) {
    const objetivo = DIA_INDEX[diaMatch[1].toLowerCase()];
    const hoy = hoyArgentina();
    const hoyDow = diaSemanaDe(hoy);
    let delta = (objetivo - hoyDow + 7) % 7;
    if (delta === 0) delta = /pr[oó]xim/.test(t) ? 7 : 0; // "el lunes" un lunes = hoy; "próximo lunes" = en 7 días
    return sumarDias(hoy, delta);
  }
  return null;
}

function parseHoraTexto(t) {
  // "15:30", "15.30", "9:00hs"
  let m = t.match(/\b([01]?\d|2[0-3])[:.h]([0-5]\d)\s*(hs?|horas?)?\b/);
  if (m) return { h: Number(m[1]), min: Number(m[2]) };

  // "a las 9", "9hs", "9 hs", "3pm", "9 de la mañana/tarde/noche"
  m = t.match(/\b(?:a\s*las\s*)?([01]?\d|2[0-3])\s*(hs|horas)\b/);
  if (m) return { h: Number(m[1]), min: 0 };

  m = t.match(/\b([01]?\d)\s*(am|pm)\b/);
  if (m) {
    let h = Number(m[1]) % 12;
    if (m[2] === "pm") h += 12;
    return { h, min: 0 };
  }

  m = t.match(/\ba\s*las\s*([01]?\d|2[0-3])\b(?!\s*(?:de\s*)?(?:ma[ñn]ana|d[ií]a))/);
  if (m) return { h: Number(m[1]), min: 0 };

  m = t.match(/\b([01]?\d)\s*(?:de\s*la\s*)?(ma[ñn]ana|tarde|noche)\b/);
  if (m) {
    let h = Number(m[1]);
    if (/tarde|noche/.test(m[2]) && h < 12) h += 12;
    return { h, min: 0 };
  }
  return null;
}

function matchServicio(t, services) {
  const candidatos = (services || []).filter((s) => {
    const palabras = (s.nombre || "").toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    return palabras.some((w) => new RegExp(`\\b${w}\\b`).test(t));
  });
  return candidatos.length === 1 ? candidatos[0] : null;
}

// Devuelve { service, isoInicio, y,m,d,h,min } si pudo resolver fecha + hora +
// servicio con confianza; null si falta algo (la conversación normal sigue).
export function tryParseBooking(text, services) {
  const t = (text || "").toLowerCase();
  const fecha = parseFechaTexto(t);
  const hora = parseHoraTexto(t);
  const service = matchServicio(t, services);
  if (!fecha || !hora || !service) return null;

  const isoInicio = `${fecha.y}-${pad(fecha.m)}-${pad(fecha.d)}T${pad(hora.h)}:${pad(hora.min)}:00-03:00`;
  const inicio = new Date(isoInicio);
  if (Number.isNaN(inicio.getTime()) || inicio.getTime() < Date.now() - 5 * 60 * 1000) return null; // no agendar en el pasado
  return { service, isoInicio, inicio };
}

export function fmtFechaHora(iso) {
  return new Date(iso).toLocaleString("es-AR", { weekday: "long", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "America/Argentina/Buenos_Aires" });
}
