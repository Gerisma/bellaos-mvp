// Helpers para resolver quién es el usuario autenticado y a qué tenant
// pertenece, en vez de confiar en un tenant_id mandado por el cliente.
// sb debe ser un cliente con la sesión del usuario (supabaseServer()).

export async function getCurrentUserId(sb) {
  const { data } = await sb.auth.getUser();
  if (!data?.user) {
    const e = new Error("No autenticado");
    e.status = 401;
    throw e;
  }
  return data.user.id;
}

export async function getCurrentTenantId(sb) {
  const userId = await getCurrentUserId(sb);
  const { data: profile } = await sb.from("profiles").select("tenant_id").eq("id", userId).single();
  if (!profile?.tenant_id) {
    const e = new Error("Todavía no creaste tu negocio");
    e.status = 403;
    throw e;
  }
  return profile.tenant_id;
}

// Para rutas que ven datos de TODOS los negocios (panel admin de la
// plataforma, no de un tenant). Nunca confiar en nada mandado por el
// cliente para esto: se resuelve siempre contra profiles.is_platform_admin.
export async function assertPlatformAdmin(sb) {
  const userId = await getCurrentUserId(sb);
  const { data: profile } = await sb.from("profiles").select("is_platform_admin").eq("id", userId).single();
  if (!profile?.is_platform_admin) {
    const e = new Error("No autorizado");
    e.status = 403;
    throw e;
  }
}
