// Control de consumo de mensajes por negocio (paquete incluido + excedente + tope).
export const PLAN_LIMITS = { recepcion_ia: 800, recepcion_fidelizacion: 1500, marketing_full: 3000 };
export const OVERAGE_COST_ARS = 25; // costo por mensaje de marketing por encima del paquete (ajustable)

export function currentPeriod() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

export async function incUsage(sb, tenant_id, field, n) {
  const periodo = currentPeriod();
  const { data } = await sb.from("usage_metrics").select(`id, ${field}`).eq("tenant_id", tenant_id).eq("periodo", periodo).maybeSingle();
  if (data) await sb.from("usage_metrics").update({ [field]: (Number(data[field]) || 0) + n }).eq("id", data.id);
  else await sb.from("usage_metrics").insert({ tenant_id, periodo, [field]: n });
}

export async function getUsage(sb, tenant_id) {
  const periodo = currentPeriod();
  const { data: t } = await sb.from("tenants").select("plan,tope_marketing").eq("id", tenant_id).single();
  if (!t) { const err = new Error("Tenant no encontrado"); err.status = 404; throw err; }
  const limit = PLAN_LIMITS[t?.plan] || 800;
  const tope = t?.tope_marketing ?? null; // null = sin tope
  const { data: u } = await sb.from("usage_metrics").select("mensajes_marketing,mensajes_utility").eq("tenant_id", tenant_id).eq("periodo", periodo).maybeSingle();
  const used = u?.mensajes_marketing || 0;
  const overage = Math.max(0, used - limit);
  return {
    plan: t?.plan || "recepcion_ia",
    used, limit, tope,
    pct: Math.min(100, Math.round((used / limit) * 100)),
    overage,
    overage_costo_ars: overage * OVERAGE_COST_ARS,
    alerta_80: used >= limit * 0.8 && used < limit,
    limite_superado: used >= limit,
    tope_alcanzado: tope != null && used >= tope,
  };
}
