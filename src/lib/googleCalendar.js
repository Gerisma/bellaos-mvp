// Espejo de turnos en el Google Calendar de la dueña (de solo lectura para
// ella: BellaOS sigue siendo la fuente de verdad, esto solo le crea el
// evento para que lo vea desde el celular). Requiere GOOGLE_CLIENT_ID y
// GOOGLE_CLIENT_SECRET de un proyecto de Google Cloud (Gerardo tiene que
// crearlo y habilitar la Calendar API — ver TAREAS_PENDIENTES.md). Hasta que
// esas variables existan, todas las funciones acá son no-ops seguros.

const GOOGLE_ENABLED = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
const SCOPE = "https://www.googleapis.com/auth/calendar.events";

export function googleEnabled() { return GOOGLE_ENABLED; }

export function buildAuthUrl({ redirectUri, state }) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent",
    state: state || "",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForTokens(code, redirectUri) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code, client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri, grant_type: "authorization_code",
    }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) { console.error("Google exchangeCodeForTokens falló:", res.status, data); throw new Error("No se pudo conectar con Google"); }
  return data; // { access_token, refresh_token, expires_in, ... }
}

async function getAccessToken(refreshToken) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken, client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) { console.error("Google getAccessToken falló:", res.status, data); return null; }
  return data.access_token;
}

// Crea el evento espejo del turno. Devuelve el google_event_id (para guardar
// en appointments.google_event_id) o null si no se pudo (nunca frena el
// flujo de agendar, que ya quedó confirmado en la base antes de esto).
export async function crearEventoEspejo({ refreshToken, calendarId, titulo, descripcion, inicioIso, duracionMin }) {
  if (!GOOGLE_ENABLED || !refreshToken) return null;
  const accessToken = await getAccessToken(refreshToken);
  if (!accessToken) return null;

  const fin = new Date(new Date(inicioIso).getTime() + (duracionMin || 60) * 60_000).toISOString();
  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId || "primary")}/events`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      summary: titulo,
      description: descripcion || "Agendado automáticamente por BellaOS.",
      start: { dateTime: inicioIso },
      end: { dateTime: fin },
    }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) { console.error("Google crearEventoEspejo falló:", res.status, data); return null; }
  return data.id || null;
}
