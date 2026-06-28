import { NextResponse } from "next/server";

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

// Gate temporal mientras no existe Supabase Auth real (roadmap punto 2).
// Protege toda la app con una contraseña compartida; el webhook de WhatsApp
// y el cron de recordatorios quedan exentos porque ya validan su propio
// secreto (HMAC / CRON_SECRET) y deben seguir siendo accesibles por Meta/Vercel.
export function middleware(req) {
  const { pathname } = req.nextUrl;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";

  if (rateLimited(pathname, ip)) {
    return new NextResponse("Demasiadas solicitudes", { status: 429 });
  }

  if (pathname === "/api/webhook/whatsapp" || pathname === "/api/cron/recordatorios") {
    return NextResponse.next();
  }

  const user = process.env.APP_BASIC_AUTH_USER;
  const pass = process.env.APP_BASIC_AUTH_PASS;
  if (!user || !pass) return NextResponse.next();

  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Basic ")) {
    const [u, p] = Buffer.from(auth.slice(6), "base64").toString().split(":");
    if (u === user && p === pass) return NextResponse.next();
  }
  return new NextResponse("Auth requerido", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="BellaOS"' },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
