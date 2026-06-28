# Auditoría de seguridad y código — BellaOS MVP

**Fecha:** 2026-06-27

## Resumen ejecutivo

Se revisó la totalidad de las rutas API (`src/app/api/**`), las páginas de UI, las librerías (`src/lib/*.js`), el esquema de Supabase (`supabase/schema.sql`), `vercel.json` y la configuración de entorno (`.env.example`, `.gitignore`). Total de hallazgos: **5 Críticos, 6 Altos, 7 Medios, 5 Bajos**.

Los tres riesgos más urgentes:
1. **Ausencia total de aislamiento por tenant en RLS combinada con uso exclusivo de `service_role`** — todas las rutas usan `supabaseAdmin()` (bypassea RLS), y solo existe una policy real en `contacts` (`supabase/schema.sql:83`); el resto de tablas tienen RLS activado pero sin policies. La seguridad multi-tenant depende 100% de que cada ruta filtre manualmente por `tenant_id`, y al menos una no lo hace (`src/app/panel/page.js`).
2. **Webhook de WhatsApp sin validación de firma HMAC** (`src/app/api/webhook/whatsapp/route.js`) — cualquiera puede invocar el endpoint con un payload falso, inyectar mensajes, disparar consumo de LLM/WhatsApp o hacer DoS.
3. **Leak cross-tenant confirmado en `/panel`** (`src/app/panel/page.js:9`) y en `GET /api/appointments` cuando no se pasa `tenant_id` (`src/app/api/appointments/route.js:6-12`) — devuelven datos de todos los negocios sin filtrar.

No se encontraron claves hardcodeadas en código versionado. `.env.local` existe y está correctamente listado en `.gitignore`; `.env.example` solo contiene placeholders vacíos.

## Estado de remediación (2026-06-27)

Los 5 hallazgos Críticos fueron corregidos:
- #1 y #2: `/panel` ahora es client component con selector de tenant y usa `/api/tenant-data` (filtrado por `tenant_id`); `GET /api/appointments` exige `tenant_id` (400 si falta).
- #3: el webhook de WhatsApp valida `X-Hub-Signature-256` con HMAC-SHA256 contra `WHATSAPP_APP_SECRET` antes de procesar el POST.
- #4 y #5: el cron de recordatorios exige `Authorization: Bearer $CRON_SECRET`, y ahora llama a `sendWhatsApp` con el teléfono del contacto antes de marcar el flag como enviado (solo si el envío fue exitoso).

**Acción requerida del usuario:** agregar `WHATSAPP_APP_SECRET` y `CRON_SECRET` a `.env.local` (y a las env vars de Vercel al desplegar). Sin esas variables, el webhook y el cron rechazan todas las solicitudes (fail-closed por diseño).

**Alto — #6 resuelto:** se agregaron las policies `tenant_isolation` faltantes en `supabase/schema.sql` (brand_profiles, services, conversations, messages, appointments, campaigns, campaign_targets, knowledge_base, usage_metrics). Al verificar contra la base real (`kcslhhupssvetmbigorl`) se constató que ya estaban aplicadas allí desde una migración previa no reflejada en el archivo — el cambio deja el `schema.sql` consistente con el estado real de la base.

**Alto — #7 y #8 mitigados:** se agregó `src/middleware.js`, un gate de Basic Auth controlado por `APP_BASIC_AUTH_USER`/`APP_BASIC_AUTH_PASS` que protege toda la app (excepto el webhook de WhatsApp y el cron, que ya validan su propio secreto). Esto cierra el acceso público no autenticado mientras no exista Supabase Auth real. **No es la remediación completa**: sigue sin haber sesión por usuario ni validación de que un `tenant_id` pertenece al solicitante — cualquiera que conozca la contraseña compartida puede seguir leyendo/escribiendo cualquier tenant. La solución definitiva (Supabase Auth + `tenant_id` en JWT, roadmap punto 2) queda pendiente.

**Acción requerida del usuario:** definir `APP_BASIC_AUTH_USER` y `APP_BASIC_AUTH_PASS` en `.env.local` y en Vercel. Si no se definen, el middleware no bloquea nada (fail-open intencional para no romper el entorno de desarrollo local existente).

**Alto — #9 resuelto:** se creó `src/lib/apiError.js` (`safeError(e)`: loggea el error completo con `console.error` y devuelve un mensaje genérico) y se reemplazó el patrón `String(e.message || e)` en las 13 ocurrencias de las 9 rutas afectadas (`appointments`, `campaigns`, `conversations`, `usage`, `informes`, `chat`, `tenants`, `tenant-data`, `cron/recordatorios`). Ya no se exponen detalles de esquema/Postgres al cliente.

**Alto — #10 resuelto:** se agregó la columna `tenants.whatsapp_token` (migración aplicada en Supabase y reflejada en `schema.sql`). `sendWhatsApp(to, text, { phoneId, token })` ahora acepta credenciales por tenant con fallback a las env vars globales si el tenant no tiene número propio. El webhook pasa `ctx.tenant.whatsapp_phone_id`/`whatsapp_token`, y el cron de recordatorios hace join con `tenants` para usar las credenciales del negocio correspondiente.

Los hallazgos Altos #11, Medios y Bajos quedan pendientes de remediación.

## Crítico

#### 1. `/panel` expone contactos de TODOS los tenants (sin filtro tenant_id)
**Archivo:** `src/app/panel/page.js:9`
Descripción: la query `sb.from("contacts").select(...).order("nombre").limit(50)` no filtra por `tenant_id` en absoluto. Usa `supabaseAdmin()` (service_role, bypassea RLS), por lo que se listan hasta 50 contactos de cualquier negocio, mezclados.
Riesgo/Impacto: fuga de datos de clientes (PII: nombre, canal, ticket promedio) entre negocios distintos. Viola el aislamiento multi-tenant que es la base del modelo SaaS.
Remediación sugerida: agregar selector de tenant (como en las demás páginas) y filtrar `.eq("tenant_id", tenantId)`.

#### 2. `GET /api/appointments` sin `tenant_id` devuelve turnos de todos los negocios
**Archivo:** `src/app/api/appointments/route.js:6-13`
Descripción: el filtro `tenant_id` es opcional (`if (tenant_id) q = q.eq(...)`); si el parámetro no se envía, la query corre sin restricción y devuelve todos los appointments de la base completa.
Riesgo/Impacto: cualquier cliente (o bug en el frontend) que olvide pasar `tenant_id` expone turnos, horarios y relaciones contact_id/service_id de todos los tenants.
Remediación sugerida: hacer `tenant_id` obligatorio y devolver 400 si falta, en vez de hacer fallback a "sin filtro".

#### 3. Webhook de WhatsApp sin validación de firma HMAC (X-Hub-Signature-256)
**Archivo:** `src/app/api/webhook/whatsapp/route.js:14-37`
Descripción: el `POST` procesa el body entrante sin verificar la cabecera `X-Hub-Signature-256` contra el App Secret de Meta. Solo el `GET` valida `hub.verify_token` (eso es solo para la verificación inicial de Meta, no protege los POST posteriores).
Riesgo/Impacto: cualquier atacante puede enviar un payload arbitrario al endpoint público y: (a) hacer que el sistema "responda" y gaste cuota de LLM/WhatsApp, (b) inyectar mensajes falsos que se persisten en `conversations`/`messages`, (c) DoS al endpoint, (d) suplantar mensajes de clientes reales si conoce/adivina un `phone_number_id` válido.
Remediación sugerida: calcular HMAC-SHA256 del raw body con `WHATSAPP_APP_SECRET` y comparar con el header antes de procesar; rechazar con 401 si no coincide.

#### 4. Cron de recordatorios público y sin protección de secreto
**Archivo:** `src/app/api/cron/recordatorios/route.js:3-22`, `vercel.json:1-5`
Descripción: la ruta es un `GET` accesible públicamente; no valida ningún header (`Authorization`, `CRON_SECRET`, o el header automático de Vercel Cron) antes de ejecutar la lógica. `vercel.json` solo define el schedule, no agrega protección.
Riesgo/Impacto: cualquiera puede invocar el cron manualmente y forzar la marca de `recordatorio_24h`/`recordatorio_2h` como `true` en masa sin que se haya enviado ningún mensaje real (ver hallazgo #5), inutilizando el sistema de recordatorios para todos los tenants, o simplemente abusar del endpoint para generar carga.
Remediación sugerida: validar `Authorization: Bearer <CRON_SECRET>` (Vercel inyecta este header automáticamente en sus cron jobs) y rechazar si no coincide con una env var server-only.

#### 5. El cron de recordatorios marca como "enviado" sin enviar ningún mensaje
**Archivo:** `src/app/api/cron/recordatorios/route.js:12-18`
Descripción: el cron solo hace `update({ recordatorio_24h: true })` / `update({ recordatorio_2h: true })` sobre los turnos próximos; en ningún punto llama a `sendWhatsApp()` (de `src/lib/whatsapp.js`) ni a ninguna lógica de envío. Es decir, marca los recordatorios como enviados sin enviarlos.
Riesgo/Impacto: bug funcional crítico — el feature de recordatorios documentado en `CLAUDE.md` ("Cron de recordatorios") no envía nada; los clientes nunca reciben el recordatorio de 24h/2h, y como el flag queda en `true`, no se reintentará jamás. Esto afecta directamente el negocio (no-shows).
Remediación sugerida: antes de marcar el flag, invocar `sendWhatsApp(contacto.telefono, mensaje)` usando los datos de `contact_id`/`tenant_id` del turno, y solo marcar `true` si el envío fue exitoso.

## Alto

#### 6. [RESUELTO] Todas las tablas (salvo `contacts`) tienen RLS activado pero SIN policies
**Archivo:** `supabase/schema.sql:73-84`
Descripción: `alter table ... enable row level security` se ejecuta para `brand_profiles, services, contacts, conversations, messages, appointments, campaigns, campaign_targets, knowledge_base, usage_metrics`, pero solo se crea una policy (`tenant_isolation on contacts`). El comentario en línea 84 dice "Crear policy equivalente para el resto" — pendiente, nunca implementado.
Riesgo/Impacto: si en el futuro se usa el cliente `anon`/`authenticated` (por ejemplo al implementar Auth real, paso 2 del roadmap) en vez de `service_role` para alguna de estas tablas, todas las queries fallarían silenciosamente (RLS sin policy = deny-all) o, peor, si se crea una policy mal escrita, podría haber fuga cross-tenant. Hoy el riesgo es mitigado porque solo se usa `service_role`, pero eso traslada el 100% de la responsabilidad de aislamiento al código de aplicación (ver hallazgos relacionados).
Remediación sugerida: crear policies `tenant_isolation` equivalentes a la de `contacts` para cada tabla con `tenant_id`, usando `auth.jwt() ->> 'tenant_id'`, antes de migrar a Supabase Auth.

#### 7. [MITIGADO] Uso exclusivo de `service_role` en todas las rutas API sin capa de verificación de pertenencia
**Archivo:** `src/lib/supabase.js:4-9` (usado en todas las rutas bajo `src/app/api/**`)
Descripción: no existe ningún middleware/helper que valide que el `tenant_id` recibido por query param o body realmente corresponde al usuario autenticado (hoy no hay autenticación de usuario en absoluto, ver hallazgo #8). Cualquier `tenant_id` válido (UUID) que se conozca o adivine permite leer/escribir datos de ese tenant desde cualquier ruta.
Riesgo/Impacto: con `service_role` bypasseando RLS, el único control de acceso es "saber el UUID del tenant". No hay sesión de usuario que limite qué tenant_id puede consultar cada cliente.
Remediación sugerida: implementar Supabase Auth (roadmap punto 2) y validar en cada ruta que el `tenant_id` del JWT coincide con el solicitado, antes de pasar a producción real con más de un tenant.

#### 8. [MITIGADO] No hay autenticación de usuario en ninguna ruta API ni página
**Archivo:** todas las rutas en `src/app/api/**`, todas las páginas con selector de tenant (`src/app/agenda/page.js`, `src/app/reactivador/page.js`, etc.)
Descripción: `/api/tenants` GET devuelve la lista completa de negocios sin autenticación; cualquier visitante puede ver todos los tenants y, combinando con el resto de endpoints, leer/escribir datos de cualquiera.
Riesgo/Impacto: en el estado actual (probablemente solo localhost/demo) es aceptable, pero el roadmap indica que el deploy a Vercel (`punto 10`) está pendiente; si se despliega antes de implementar auth, la aplicación entera queda abierta públicamente sin control de acceso.
Remediación sugerida: bloquear el deploy público hasta completar el punto 2 del roadmap (Supabase Auth + tenant_id en JWT), o al menos proteger con un gate temporal (Vercel password protection / Basic Auth) durante la fase de pruebas.

#### 9. [RESUELTO] Mensajes de error de Supabase expuestos directamente en las respuestas JSON
**Archivo:** múltiples — ejemplos: `src/app/api/appointments/route.js:15`, `src/app/api/campaigns/route.js:17,35,66`, `src/app/api/informes/route.js:26`, `src/app/api/tenants/route.js:34`, `src/app/api/usage/route.js:7,16`
Descripción: el patrón `catch (e) { return Response.json({ error: String(e.message || e) }, ...) }` se repite en casi todas las rutas, devolviendo el mensaje crudo de error de Postgres/Supabase al cliente.
Riesgo/Impacto: puede filtrar detalles de esquema (nombres de columnas/tablas, constraints, tipos) útiles para un atacante en reconocimiento, y en general es mala práctica de seguridad por diseño (no defensa en profundidad).
Remediación sugerida: loggear el error completo en servidor (`console.error`) y devolver al cliente un mensaje genérico ("Error interno") con un código de referencia, salvo en entornos de desarrollo.

#### 10. [RESUELTO] `sendWhatsApp` usa un único número de WhatsApp global, no por tenant
**Archivo:** `src/lib/whatsapp.js:3` vs `src/app/api/webhook/whatsapp/route.js:18,22`
Descripción: el webhook recibe `phoneId` del payload entrante y lo usa correctamente para identificar el tenant (`loadTenantContext({ phoneId })`), pero al responder llama a `sendWhatsApp(from, result.reply)`, que internamente usa `process.env.WHATSAPP_PHONE_ID` y `process.env.WHATSAPP_TOKEN` fijos (una sola cuenta WABA para toda la plataforma).
Riesgo/Impacto: en un modelo multi-tenant real (cada negocio con su propio número de WhatsApp, como sugiere la columna `tenants.whatsapp_phone_id`), todos los envíos de respuesta saldrían desde el mismo número/token, sin importar qué tenant originó la conversación. Esto rompe el aislamiento de canal y la facturación/atribución por negocio en cuanto haya más de un tenant con número propio.
Remediación sugerida: pasar el `phone_number_id`/token específico del tenant (almacenado o resuelto via `ctx.tenant`) a `sendWhatsApp`, en vez de usar variables de entorno globales.

#### 11. Sin rate limiting en endpoints públicos
**Archivo:** `src/app/api/webhook/whatsapp/route.js`, `src/app/api/chat/route.js`, `src/app/api/cron/recordatorios/route.js`
Descripción: no existe ninguna capa de rate limiting (ni siquiera básica por IP) en ninguna ruta API, particularmente las accesibles sin autenticación.
Riesgo/Impacto: el webhook de WhatsApp (sin HMAC, ver #3) y `/api/chat` (usado por el Probador, sin tenant validation) quedan abiertos a abuso/flood, generando costos de LLM (OpenRouter) y de WhatsApp Cloud API sin control.
Remediación sugerida: agregar rate limiting (por IP o por tenant_id) en middleware o vía un servicio externo (p. ej. Vercel Edge Config / Upstash) antes de exponer producción.

## Medio

#### 12. `getUsage` puede dividir por límite inválido / NaN si `plan` no está en `PLAN_LIMITS`
**Archivo:** `src/lib/usage.js:20,28`
Descripción: `const limit = PLAN_LIMITS[t?.plan] || 800;` tiene fallback a 800, lo cual está bien, pero si `t` es `null` (tenant_id inexistente) el resto de la función sigue calculando con `limit=800` y `used=0` en vez de devolver un error explícito; el caller (`/api/usage`, `/api/informes`) no distingue "tenant no encontrado" de "tenant sin uso", devolviendo datos plausibles pero falsos.
Riesgo/Impacto: UI puede mostrar "0/800 usados" para un tenant_id inválido/inexistente, ocultando errores de integración en vez de mostrar un mensaje claro.
Remediación sugerida: en `getUsage`, si `!t`, lanzar/devolver un error explícito que la ruta pueda traducir en 404.

#### 13. `/api/campaigns` PATCH: condición `frenado` revisa `targets.length >= permitido`, no si quedan pendientes reales
**Archivo:** `src/app/api/campaigns/route.js:64`
Descripción: `const frenado = uso.tope != null && (uso.used >= uso.tope) && (targets?.length || 0) >= permitido;` — esta lógica intenta inferir si "se cortó por tope" comparando cuántos se trajeron vs. cuántos se permitían, pero no verifica si realmente quedan más `campaign_targets` pendientes después de esta tanda. Si `targets.length === permitido` simplemente porque esa era exactamente la cantidad de pendientes restantes (sin que el tope haya sido la causa), igual reporta `frenado: true` cuando el tope sí se alcanzó pero la campaña en realidad ya terminó.
Riesgo/Impacto: mensaje confuso en la UI del Reactivador ("se alcanzó el tope") cuando en realidad la campaña simplemente se completó. Es un bug de UX/reporting, no de seguridad.
Remediación sugerida: hacer un count separado de `campaign_targets` con `estado=pendiente` después de actualizar, y comparar contra ese número en vez de inferir por longitud del batch.

#### 14. Inputs de las rutas API no se validan (tipos, presencia, formato)
**Archivo:** prácticamente todas las rutas POST/PATCH — ejemplos: `src/app/api/appointments/route.js:21-26` (no valida que `inicio` sea fecha válida, ni que `tenant_id` sea UUID), `src/app/api/tenants/route.js:15-19` (no valida `b.name` no vacío más allá del `required` del form HTML, fácilmente bypasseable con curl), `src/app/api/usage/route.js:11-14` (acepta cualquier string/number en `tope_marketing` sin rango)
Descripción: no hay capa de validación de esquema (zod, yup, manual) en ninguna ruta; se confía en que el frontend manda datos bien formados.
Riesgo/Impacto: inserciones con `null`/tipos incorrectos pueden generar errores 500 poco descriptivos o datos corruptos (ej. `inicio` inválido, `precio` no numérico) en la base. Es bajo para un atacante directo (sin RCE/injection porque se usa el cliente de Supabase con queries parametrizadas), pero medio para robustez del sistema.
Remediación sugerida: agregar validación mínima (zod) por ruta antes de tocar la base, especialmente para los IDs de tenant.

#### 15. Sin CORS explícito en las rutas API
**Archivo:** todas las rutas bajo `src/app/api/**` (no se encontró ningún `Access-Control-*` header ni configuración de CORS)
Descripción: Next.js App Router, por defecto, no agrega CORS permisivo entre orígenes distintos para rutas API; al no configurarse nada explícito, las rutas solo responden same-origin salvo que algo más (proxy, Vercel) lo cambie. No se detectó middleware de CORS.
Riesgo/Impacto: bajo/medio — no es una vulnerabilidad en sí (de hecho la ausencia de CORS permisivo es lo seguro por defecto), pero vale la pena documentarlo explícitamente, sobre todo de cara a integrar el webhook de WhatsApp (que es server-to-server, no afectado por CORS) y futuros widgets embebibles de chat web (roadmap punto 7), que sí necesitarán CORS configurado a propósito.
Remediación sugerida: cuando se implemente el canal "chat web" (roadmap 7), definir explícitamente los headers CORS necesarios en esa ruta puntual, no de forma global.

#### 16. Duplicación de lógica de carga de `tenants` y patrón fetch en cada página cliente
**Archivo:** `src/app/agenda/page.js:7`, `src/app/probador/page.js:6`, `src/app/reactivador/page.js:8`, `src/app/informes/page.js:7`, `src/app/conversaciones/page.js:7`
Descripción: el mismo `useEffect(() => { fetch("/api/tenants")... }, [])` con el mismo manejo de estado se repite, sin extraer, en cinco páginas distintas.
Riesgo/Impacto: no es un riesgo de seguridad, pero incrementa el costo de mantenimiento — un cambio en la forma de seleccionar tenant (p. ej. al agregar Auth) requiere editar 5 archivos.
Remediación sugerida: extraer un hook compartido `useTenants()` en `src/lib` o `src/hooks`.

#### 17. Ninguna página de cliente envuelve sus `fetch` en try/catch
**Archivo:** `src/app/agenda/page.js:7-9,12`, `src/app/probador/page.js:6,10`, `src/app/reactivador/page.js:8,11-13,16,20,28`, `src/app/informes/page.js:7-8`, `src/app/conversaciones/page.js:7-9`, `src/app/onboarding/page.js:12`
Descripción: todas las llamadas `fetch(...).then(r => r.json())...` asumen que la red funciona y que la respuesta siempre es JSON válido con status 200. No hay `.catch()` ni manejo de fallos de red (servidor caído, timeout, JSON inválido).
Riesgo/Impacto: si el servidor o Supabase están caídos, las páginas quedan en estado de carga indefinido o lanzan una excepción no controlada en la consola sin feedback al usuario, en vez de mostrar un mensaje de error claro.
Remediación sugerida: envolver los `fetch` en try/catch (o usar una librería como SWR/TanStack Query que maneja esto) y mostrar un estado de error visible.

#### 18. `componente Panel` (`src/app/panel/page.js`) es Server Component sin paginación real
**Archivo:** `src/app/panel/page.js:9`
Descripción: además del problema de tenant (#1), usa `.limit(50)` fijo sin paginación ni búsqueda; en un negocio con más de 50 contactos, los demás simplemente no se muestran sin ningún indicio en la UI.
Riesgo/Impacto: bajo impacto funcional hoy (MVP), pero quedará oculto a medida que crezca la base de contactos.
Remediación sugerida: agregar paginación o un buscador antes de escalar a tenants con bases de clientes grandes.

## Bajo

#### 19. `WHATSAPP_VERIFY_TOKEN` con valor por defecto documentado en `.env.example`
**Archivo:** `.env.example` (línea con `WHATSAPP_VERIFY_TOKEN=bellaos_verify`)
Descripción: el placeholder no está vacío como las demás variables, sino que sugiere un valor real (`bellaos_verify`) que podría quedar copiado tal cual a producción si el desarrollador no lo cambia.
Riesgo/Impacto: bajo — el verify token solo protege el handshake inicial `GET` de Meta, no los mensajes POST. Si no se cambia, es adivinable.
Remediación sugerida: documentar explícitamente que debe reemplazarse por un valor aleatorio único en producción.

#### 20. No hay manejo de "negocio sin servicios" más allá de un placeholder textual
**Archivo:** `src/lib/brain.js:9-11`
Descripción: si `services` está vacío, el prompt dice `(sin servicios cargados)`; está bien manejado para el LLM, pero `ruleBasedReply` (línea 35) responde genérico sin advertir al operador del negocio que faltan datos.
Riesgo/Impacto: bajo, cosmético/UX.
Remediación sugerida: ninguna acción urgente.

#### 21. Falta estado de "tenant no seleccionado" explícito en varias páginas
**Archivo:** `src/app/probador/page.js`, `src/app/agenda/page.js`, `src/app/reactivador/page.js`, `src/app/informes/page.js`
Descripción: si `tenants` está vacío (no hay negocios creados aún), los `<select>` quedan vacíos sin mensaje ("No hay negocios, creá uno en /onboarding"), y las acciones (enviar, crear turno) podrían dispararse con `tenantId=""`.
Riesgo/Impacto: bajo, UX confusa en el primer uso (antes de dar de alta el primer negocio).
Remediación sugerida: mostrar un mensaje guía cuando `tenants.length === 0`.

#### 22. `classifyIntent` y `ruleBasedReply` usan reglas regex simples que pueden mal-clasificar
**Archivo:** `src/lib/brain.js:15-23,30`
Descripción: por ejemplo, el matching de servicio en `ruleBasedReply` (línea 30) usa `t.includes(primera_palabra_del_nombre_del_servicio)`, lo que puede dar falsos positivos con nombres de servicios cortos o ambiguos (ej. "Color" podría matchear "colorido", etc.).
Riesgo/Impacto: bajo, calidad de respuesta del asistente sin LLM, no es un riesgo de seguridad.
Remediación sugerida: mejorar el matching (tokenización, fuzzy match) cuando se trabaje en la calidad del motor de reglas.

#### 23. Falta de índices/constraints únicos para evitar duplicados de contacto por teléfono+tenant
**Archivo:** `supabase/schema.sql:23-29` (tabla `contacts`)
Descripción: no hay un `unique(tenant_id, telefono)`; `persistInbound` (`src/lib/conversations.js:3-7`) depende de hacer `select.maybeSingle()` antes de insertar, lo que es una condición de carrera (race condition) si llegan dos mensajes casi simultáneos del mismo número (poco probable pero posible con reintentos de Meta).
Riesgo/Impacto: bajo — podría crear contactos duplicados para el mismo teléfono bajo carga/reintento.
Remediación sugerida: agregar `unique(tenant_id, telefono)` y usar `upsert` con `onConflict`.
