"use client";
import { createBrowserClient } from "@supabase/ssr";

// Cliente para Client Components: usa la anon key y la sesión del usuario
// (cookies), RLS hace el filtrado por tenant.
export function supabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
