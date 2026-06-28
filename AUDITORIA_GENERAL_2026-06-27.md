# Auditoría general de BellaOS — 27/06/2026

## 1. Estado del código (honesto)
- App Next.js multi-tenant funcionando y conectada a Supabase real. Páginas: inicio, onboarding, probador, conversaciones, panel, agenda, reactivador, informes, (configuración pendiente).
- Construido vía asistencia con verificación de **sintaxis** (node --check) y pruebas de datos contra Supabase. **No** se corrió `npm run build` completo desde acá → primera tarea en Claude Code (Bloque 0).
- Cerebro con fallback por reglas si no hay OPENROUTER_API_KEY.

## 2. Seguridad — hallazgos y pendientes
| Punto | Estado | Acción |
| :-- | :-- | :-- |
| RLS por tenant en tablas | Policies creadas | Falta **login real** que ponga tenant_id en el JWT (hoy el panel usa service_role) → Bloque 3 |
| service_role solo en server | OK | Mantener; nunca exponer al browser |
| Firma HMAC del webhook WhatsApp | **Pendiente** | Validar X-Hub-Signature-256 → Bloque 6 |
| 2FA + audit log | Pendiente | Bloque 27 |
| Secretos en .env.local | OK | No commitear; rotar si se filtran |
| Validación de inputs / rate limiting | Parcial | Reforzar en APIs públicas |
| Datos personales (Ley 25.326 AR) | Pendiente | Consentimiento, opt-out (parcial), borrado, política de privacidad |
| Backups Supabase | Por configurar | Activar backups + probar restauración |

## 3. Servicios externos — claves, límites y condiciones (al 27/06/2026)
- **Supabase** (proyecto BellaOS, ref kcslhhupssvetmbigorl): claves URL/anon/service_role en .env.local. Free: 500MB DB, pausa por inactividad; Pro USD25/mes (backups PITR).
- **Vercel:** deploy + cron. Free: hobby (no comercial estricto); Pro USD20/mes para producción.
- **OpenRouter:** API key (falta). Pago por uso (centavos). Modelo económico por defecto.
- **WhatsApp Cloud API:** token + phone_number_id + verify_token. Límites: nuevo ~250 contactos/24h → 1.000 → 10.000 → 100.000 → ilimitado, **por portfolio** (desde oct-2025), según **calidad**. "Service" (responder) ilimitado. Plantillas aprobadas para iniciar conversación.
- **Instagram:** DMs automáticos ~200/hora; respuestas a comentarios ~750/hora/Página; ventana 24h; publicar ~25/día.
- **Facebook:** publicar ~25/día, ~20 min entre posts.
- **Meta Marketing API:** permiso de ad account; medición con Píxel + Conversions API.
- **MercadoPago:** access token (falta). Comisión ~6%. Suscripciones (preapproval) para abonos/membresías.

## 4. Detección de "número caliente" y límites EN VIVO (respuesta a tu pregunta)
**Sí se puede anticipar.**
- **WhatsApp:** consultando `GET /{phone_number_id}` con los campos **quality_rating** (Green/Yellow/Red) y el **tier de límite** (campo histórico `messaging_limit_tier`, hoy `whatsapp_business_manager_messaging_limit`). Con eso BellaOS sabe **antes de enviar**: si el número está sano (verde) y cuántos contactos/24h tiene de cupo. Rojo = no avanzar de nivel (pero ya no baja solo si no hay infracciones).
- **Instagram/Facebook:** cada respuesta de la Graph API trae headers de uso — **X-Business-Use-Case-Usage**, **X-App-Usage**, **X-Ad-Account-Usage** — con el **% consumido**. BellaOS los lee y, si está cerca del límite, **frena o reparte**; si hay margen, **puede subir** el ritmo/anuncios.
**Implementación sugerida:** un "semáforo" por cuenta (verde/amarillo/rojo) en el panel + lógica que escale o reduzca envíos/anuncios según el cupo restante. (Sumar al Bloque 17 de envío seguro.)

## 5. Sugerencias y mejoras (priorizadas)
**Críticas (antes de salir a producción):**
1. Login real + RLS efectiva por tenant (Bloque 3).
2. Validar firma HMAC del webhook (Bloque 6).
3. Política de privacidad + consentimiento/opt-out + borrado (Ley 25.326).
4. Activar backups de Supabase y probar restauración.
**Altas:**
5. Semáforo de salud/límites de WhatsApp/IG/FB (sección 4).
6. Team inbox + plantillas reutilizables (Bloques 23-24).
7. `npm run build` limpio + tests básicos (Bloques 0 y 13).
**Medias:**
8. Disparadores por evento (no-show, recompra, reseña) — Bloque 26.
9. Auditoría/2FA (Bloque 27). 10. Membresías UI + beneficios (Bloques 18-22).
**Optimización de costo:**
11. pgvector (no Pinecone), cron de Vercel (no Inngest aún), evaluar OmniRoute/LiteLLM para IA.
