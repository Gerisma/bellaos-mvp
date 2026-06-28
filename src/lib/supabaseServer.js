import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Cliente para Route Handlers: opera como el usuario logueado (anon key +
// cookies de sesión), no como service_role. RLS filtra por tenant_id vía
// la tabla profiles — las rutas ya no necesitan (ni deben) confiar en un
// tenant_id mandado por el cliente.
export async function supabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // se llama desde un Server Component; el middleware ya refresca la sesión.
          }
        },
      },
    }
  );
}
