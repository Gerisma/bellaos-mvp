// Precios sugeridos por plan (ARS/mes) para la suscripción de la plataforma
// (lo que le cobrás vos a cada estética, no lo que ella le cobra a sus
// clientas). Son un default al crear el negocio; el precio real que se
// cobra siempre es tenants.precio_mensual, así que se puede ajustar por
// negocio sin tocar código (ej. un precio negociado distinto).
export const PLAN_PRECIOS_SUGERIDOS = {
  recepcion_ia: 15000,
  recepcion_fidelizacion: 25000,
  marketing_full: 40000,
};

export const TRIAL_DIAS = 15;

export function trialEndsAt(desde = new Date()) {
  return new Date(desde.getTime() + TRIAL_DIAS * 24 * 60 * 60 * 1000).toISOString();
}
