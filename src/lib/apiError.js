// Loggea el error completo en servidor y devuelve un mensaje genérico al cliente,
// evitando filtrar detalles de esquema/Postgres en las respuestas JSON.
export function safeError(e) {
  console.error(e);
  return "Error interno. Intentá de nuevo en unos minutos.";
}
