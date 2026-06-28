import { NextResponse } from "next/server";

// Gate temporal mientras no existe Supabase Auth real (roadmap punto 2).
// Protege toda la app con una contraseña compartida; el webhook de WhatsApp
// y el cron de recordatorios quedan excluidos porque ya validan su propio
// secreto (HMAC / CRON_SECRET) y deben seguir siendo accesibles por Meta/Vercel.
export function middleware(req) {
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
  matcher: [
    "/((?!api/webhook/whatsapp|api/cron/recordatorios|_next/static|_next/image|favicon.ico).*)",
  ],
};
