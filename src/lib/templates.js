// Nombres de las plantillas de WhatsApp aprobadas por Meta, configurables por
// env var (por si el negocio las aprobó con otro nombre) con default al
// nombre documentado en WHATSAPP.md.
export const TEMPLATES = {
  recordatorio24h: process.env.WHATSAPP_TEMPLATE_RECORDATORIO_24H || "recordatorio_24h",
  recordatorio2h: process.env.WHATSAPP_TEMPLATE_RECORDATORIO_2H || "recordatorio_2h",
  confirmacionTurno: process.env.WHATSAPP_TEMPLATE_CONFIRMACION_TURNO || "confirmacion_turno",
  cancelacionTurno: process.env.WHATSAPP_TEMPLATE_CANCELACION_TURNO || "cancelacion_turno",
  reactivacion: process.env.WHATSAPP_TEMPLATE_REACTIVACION || "reactivacion",
  bienvenida: process.env.WHATSAPP_TEMPLATE_BIENVENIDA || "bienvenida",
};

export const TEMPLATE_LANG = process.env.WHATSAPP_TEMPLATE_LANG || "es_AR";
