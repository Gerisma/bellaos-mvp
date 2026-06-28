// Validaciones mínimas de inputs en rutas API, sin agregar una librería de esquemas.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(v) {
  return typeof v === "string" && UUID_RE.test(v);
}

export function isValidDate(v) {
  return typeof v === "string" && !Number.isNaN(new Date(v).getTime());
}

export function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}
