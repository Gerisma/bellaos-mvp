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
  avisoDueno: process.env.WHATSAPP_TEMPLATE_AVISO_DUENO || "aviso_dueno",
  // Plantilla genérica para avisos internos a la dueña del negocio (turno
  // nuevo agendado por el asistente, handoff a humano, etc.) — {{1}} nombre
  // del negocio, {{2}} el mensaje. Todavía hay que crearla y que Meta la
  // apruebe (Business Manager → Plantillas), igual que las demás.
};

export const TEMPLATE_LANG = process.env.WHATSAPP_TEMPLATE_LANG || "es_AR";
