import { createClient } from "@supabase/supabase-js";

// Cliente con service role para uso en el servidor (webhooks, jobs).
export function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}
