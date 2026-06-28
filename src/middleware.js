import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Rate limiting básico en memoria por IP, por endpoint público.
// Mitigación de abuso/flood (no es a prueba de múltiples instancias serverless,
// pero limita el daño dentro de cada instancia mientras no haya un store
// compartido como Upstash/Vercel Edge Config).
const RATE_LIMITS = {
  "/api/webhook/whatsapp": { max: 30, windowMs: 60_000 },
  "/api/chat": { max: 20, windowMs: 60_000 },
  "/api/cron/recordatorios": { max: 6, windowMs: 60_000 },
};
const buckets = new Map();

function rateLimited(pathname, ip) {
  const rule = RATE_LIMITS[pathname];
  if (!rule) return false;
  const key = `${pathname}:${ip}`;
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + rule.windowMs });
    return false;
  }
  bucket.count++;
  return bucket.count > rule.max;
}

// Rutas accesibles sin sesión: el webhook y el cron validan su propio
// secreto (HMAC / CRON_SECRET) y deben seguir siendo accesibles por
// Meta/Vercel; login/signup son, justamente, cómo se consigue la sesión.
const PUBLIC_PATHS = ["/login", "/signup", "/api/webhook/whatsapp", "/api/cron/recordatorios"];

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";

  if (rateLimited(pathname, ip)) {
    return new NextResponse("Demasiadas solicitudes", { status: 429 });
  }

  if (pathname === "/api/webhook/whatsapp" || pathname === "/api/cron/recordatorios") {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request: req });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const isPublic = PUBLIC_PATHS.includes(pathname);

  if (!user) {
    if (isPublic) return supabaseResponse;
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname === "/login" || pathname === "/signup") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (!pathname.startsWith("/api") && pathname !== "/onboarding") {
    const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).single();
    if (!profile?.tenant_id) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
