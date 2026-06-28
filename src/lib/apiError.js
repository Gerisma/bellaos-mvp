// Loggea el error completo en servidor y devuelve un mensaje genérico al cliente,
// evitando filtrar detalles de esquema/Postgres en las respuestas JSON.
export function safeError(e) {
  console.error(e);
  return "Error interno. Intentá de nuevo en unos minutos.";
}

// Para errores intencionales con e.status (ej. "tenant no encontrado" -> 404),
// expone el mensaje propio; para el resto, cae a safeError + 500.
export function errorResponse(e, extra = {}) {
  if (e?.status) {
    console.error(e);
    return Response.json({ ...extra, error: e.message }, { status: e.status });
  }
  return Response.json({ ...extra, error: safeError(e) }, { status: 500 });
}
