# HANDOFF para Claude Code — BellaOS

_Última actualización: 2026-07-07 (sesión 3). Este archivo resume el estado real para retomar el trabajo desde Claude Code._

## 🆕 Hecho en la sesión 3 (2026-07-07)

Sistema de facturación completo: prueba de 15 días con tarjeta, suscripción mensual
automática, cuentas cortesía con panel admin, y logo personalizado por negocio.

- **Schema** (`supabase/migration_billing_trial.sql`, ya aplicada): `tenants.billing_status`
  (`trial`/`bloqueado`/`activo`/`cortesia`/`cancelado`), `trial_ends_at`, `mp_customer_id`,
  `mp_card_id/last4/brand`, `mp_preapproval_id`, `precio_mensual`, `logo_url`;
  `profiles.is_platform_admin`; bucket público de Storage `logos`. Backfill: los negocios
  que ya existían quedaron `activo` (no se bloquean retroactivamente).
- **Alta con tarjeta:** `/onboarding` tiene un paso nuevo ("¡Ya casi!") con
  `components/CardCapture.js` (MercadoPago Secure Fields — tokeniza en el navegador, el
  servidor nunca ve el número real). `/api/tenants` arranca cada negocio en
  `billing_status='trial'` con `trial_ends_at = +15 días` y un `precio_mensual` sugerido
  (`src/lib/billing.js`). Sin `NEXT_PUBLIC_MP_PUBLIC_KEY`, el paso se salta solo (no
  bloquea altas nuevas).
- **Bloqueo al vencer:** cron diario `/api/cron/billing` (agregado a `vercel.json`) pasa
  `trial`→`bloqueado` cuando `trial_ends_at` venció. El middleware redirige a
  `/suscripcion` (páginas) o devuelve 402 (API); el webhook de WhatsApp deja de
  responderle a las clientas del negocio bloqueado (pero guarda el mensaje entrante).
- **Confirmación y suscripción:** `/suscripcion` + `components/ConfirmCardCVV.js`
  (re-pide solo el CVV) + `/api/billing/confirm`, que crea el `preapproval` de
  MercadoPago (`src/lib/mpSubscription.js`) — recién ahí arranca el cobro mensual
  automático. El webhook de MercadoPago se extendió para escuchar eventos de
  `subscription_preapproval` (cancelación/pausa → vuelve a `bloqueado`).
- **Panel admin** (`/admin`, solo si `profiles.is_platform_admin=true`): lista todos los
  negocios con su consumo (reusa `getUsage`) y un botón "Cobrar consumo" que genera un
  link de pago único de MercadoPago para facturar a mano las cuentas `cortesia`. Tu
  cuenta (`info@conectaiapro.com`) ya está marcada como admin.
- **Logo personalizado:** `/ajustes` (upload) + `/api/settings/logo` (sube a Storage,
  guarda `logo_url`) + `Shell.js` lo muestra en el sidebar en vez de la "B". Verificado
  end-to-end (subida real + URL pública accesible).
- **Verificado en preview**, de punta a punta, con datos de prueba reales creados y
  luego borrados: alta con salto de tarjeta, `/suscripcion`, bloqueo real (tenant forzado
  a `bloqueado`: página redirige, API devuelve 402), panel admin con las 3 cuentas
  reales, subida de logo (con verificación de que la URL pública sirve la imagen).
- **Pendiente de gestión (no es código):** cargar `NEXT_PUBLIC_MP_PUBLIC_KEY` real y
  probar el alta completa con una tarjeta de prueba de MercadoPago antes de ir en serio a
  producción — la integración de Secure Fields no se pudo testear en vivo sin
  credenciales reales. Ajustar `PLAN_PRECIOS_SUGERIDOS` en `src/lib/billing.js` si los
  precios reales son otros.
- **Dominio propio:** se le pasó al dueño la guía paso a paso para conectar un .com
  comprado en Hostinger al proyecto de Vercel (sección 10 de `manuales/MANUAL_DUENO.md`).

## Hecho en la sesión 2 (2026-07-06, tarde)

Verificación completa del proyecto (build limpio, RLS ok) + avance autónomo hacia poder
vender sin fricciones, con manuales completos. Resumen:

- **Diseño premium:** verificado que ya estaba aplicado consistentemente en las 8
  páginas (de una sesión previa) — no hacía falta trabajo nuevo acá.
- **Seguridad:** se sacó el bypass de firma `WHATSAPP_DEBUG` del webhook de WhatsApp
  (quedaba código inerte pero riesgoso si alguien reactivaba la variable).
- **Bug encontrado y corregido:** `/terminos` (creada en la sesión 1 para Meta) no estaba
  en las rutas públicas del middleware → redirigía a `/login`, rompiendo el requisito de
  Meta de que esa URL sea pública. Ya está en `PUBLIC_PATHS`.
- **Cobro de señas por MercadoPago:** nuevo — `src/lib/mercadopago.js`, `/api/payments`
  (genera el link), `/api/webhook/mercadopago` (confirma re-consultando la API, nunca
  confía en el payload), botón "Cobrar seña" en `/agenda`. **Falta aplicar**
  `supabase/migration_mercadopago_senas.sql` en producción (aditiva, seguro aplicarla) y
  cargar un `MP_ACCESS_TOKEN` real de MercadoPago.
- **Embedded Signup (groundwork):** nuevo — `src/lib/metaGraph.js`, `/api/whatsapp/connect`,
  `components/ConnectWhatsApp.js` (banner en Inicio). Verificado en preview end-to-end
  (signup→login→onboarding→Inicio) sin errores. **Falta**: que gestiones Tech Provider +
  `configuration_id` de Embedded Signup en Meta, cargar `NEXT_PUBLIC_META_APP_ID` /
  `NEXT_PUBLIC_META_CONFIG_ID`, y aplicar `supabase/migration_whatsapp_embedded_signup.sql`
  (columna `tenants.waba_id`).
- **Manuales entregados** en `manuales/`: `MANUAL_DUENO.md` (para vos), `MANUAL_CLIENTE.md`
  (para la estética), `ONBOARDING_CLIENTE_PASO_A_PASO.md` (qué pedirle al cliente y cómo
  darlo de alta, con checklist).
- **Dos migraciones SQL quedaron escritas pero sin aplicar** (bloqueado por autorización
  explícita, ya que son cambios a la base de producción): `supabase/migration_mercadopago_senas.sql`
  y `supabase/migration_whatsapp_embedded_signup.sql`. Ambas son aditivas (solo agregan
  columnas nullable, no tocan datos existentes) y hace falta correrlas para que el código
  nuevo funcione de punta a punta.

## ✅ Estado actual (WhatsApp REAL funcionando en producción)

El asistente ya responde por WhatsApp sobre el número real, con firma validada y sin bypass.

- **Número real del bot:** +54 362 15-484-0504 — **Registrado** y operativo.
- **App de Meta correcta (ÚNICA a usar):** "BellaOS Asistente" — **App ID `2616978828760126`** (Publicada, empresa Conectaia).
- **WABA del número real:** "ConectaIApro" — **ID `1710002720151620`** (Aprobada).
- **Phone Number ID:** `1180491018483579`.
- **Webhook:** `https://bellaos-mvp-1.vercel.app/api/webhook/whatsapp` (verify token `bellaos_verify`). Campo `messages` suscripto + WABA suscrita a webhooks (toggle "Suscribirse a webhooks" ON).
- **Firma HMAC:** validando OK con `WHATSAPP_APP_SECRET` de la app `2616978828760126`. `WHATSAPP_DEBUG` **ya fue eliminado** (el bypass no quedó en producción).
- **Token:** permanente, generado por el System User **"Bellaos whats"** (Admin) con permisos `whatsapp_business_messaging` + `whatsapp_business_management`. Está en Vercel como `WHATSAPP_TOKEN`.
- **Supabase:** tenant "Bella Estética" (`34c1241e-2f24-42f1-9675-21c9747e7b44`) → `whatsapp_phone_id = 1180491018483579`.
- **Deploy:** proyecto Vercel `bellaos-mvp-1`, repo GitHub `Gerisma/bellaos-mvp`. `git push` a `master` = deploy a producción.

## 🔧 Hecho en esta sesión

- Diagnóstico completo del webhook. La causa NO era el código: (1) el `WHATSAPP_APP_SECRET` estaba tomado de una de las **tres apps homónimas** "BellaOS Asistente" (la equivocada) → 401 por firma; (2) luego, el `WHATSAPP_TOKEN` era el del **número de prueba temporal (24h) que venció** → fallaba el envío de la respuesta.
- Solución: se pasó al **número comercial real** + **token permanente** del System User, con la WABA y la app correctas.
- **Nueva página `/terminos`** (`src/app/terminos/page.js`), espejo de `/privacidad`.
- Logging de diagnóstico en el webhook (`src/app/api/webhook/whatsapp/route.js`) con bypass de firma **gated por `WHATSAPP_DEBUG`** (variable ya removida; el código del gate quedó, inofensivo por defecto).

## 🔑 Variables de entorno en Vercel (proyecto bellaos-mvp-1) — NO commitear valores

`WHATSAPP_TOKEN` (permanente), `WHATSAPP_PHONE_ID=1180491018483579`, `WHATSAPP_APP_SECRET` (app 2616978828760126), `WHATSAPP_VERIFY_TOKEN=bellaos_verify`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `CRON_SECRET`. (`WHATSAPP_DEBUG` eliminado.)

## 🚀 Próximos pasos priorizados

### 1. Embedded Signup — onboarding self-service de clientes (MÁXIMA PRIORIDAD para escalar)
Que cada negocio conecte su propio WhatsApp en pocos clics, sin repetir el proceso manual de esta sesión.
- Integrar **Facebook Login for Business + WhatsApp Embedded Signup** (JS SDK de Meta) en `/onboarding` (o pantalla nueva "Conectar WhatsApp").
- Requiere ser **Tech Provider** y un `configuration_id` de Embedded Signup. Permisos: `whatsapp_business_management`, `whatsapp_business_messaging`, `business_management`.
- Flujo backend al terminar el signup: recibir `code` → intercambiar por token → obtener `waba_id` y `phone_number_id` → guardar en `tenants` (`whatsapp_phone_id`, `whatsapp_token`, agregar `waba_id`) → **suscribir la WABA** (`POST /{waba-id}/subscribed_apps`) → **registrar el número** (`POST /{phone-number-id}/register` con PIN).
- Soportar **Coexistencia** (Meta, desde mayo 2025) para que el cliente **no pierda su WhatsApp Business app**: sigue usando su celular y el bot opera sobre el mismo número, con mensajes espejados. Es el modo a recomendar a las clientas. (Alternativa: número dedicado, como el de esta sesión.)

### 2. Unificar diseño premium (roadmap item 1)
Layout con sidebar + theme de `design/reference-demo.html`, set de componentes reutilizables aplicado a todas las páginas.

### 3. Canales IG/FB (roadmap item 7)
Adapters de Messenger e Instagram messaging reusando el mismo `responder`. Permisos `pages_messaging`, `instagram_manage_messages` en el mismo Embedded Signup.

### 4. Pagos MercadoPago (roadmap item 6) + facturar excedentes de campañas (control de costos).

### 5. Anuncios y medición (roadmap item 9) — FASE POSTERIOR
Primero Pixel + Conversions API (medición), después la lógica de sugerencias/optimización/retargeting. No es lo próximo.

## 🧹 Limpieza pendiente (irreversible → la hace el dueño)

- **Meta apps:** conservar **`2616978828760126`**. Las otras dos "BellaOS Asistente" en desarrollo (IDs que empiezan con `1709239053451…` y `889527764194…`) se pueden eliminar (Configuración → Básica → Eliminar aplicación). Confirmar que NO sea la publicada antes de borrar.
- **Meta WABAs:** hay 3 — `ConectaIApro` (real, `1710002720151620`, conservar), "Test WhatsApp Business Account" (número de prueba, token vencido, se puede ignorar/eliminar) y "Conectaia".
- **Vercel/GitHub:** el proyecto correcto es `bellaos-mvp-1` y el repo `Gerisma/bellaos-mvp` (el nombre distinto es normal: repo vs proyecto, NO son duplicados). Borrar solo proyectos/repos extra sin deploys ni dominio.
- **Meta → Basic Settings de la app `2616978828760126`:** actualizar "URL de las Condiciones del servicio" → `https://bellaos-mvp-1.vercel.app/terminos` (sigue en placeholder `facebook.com`); "Eliminación de datos" → `https://bellaos-mvp-1.vercel.app/privacidad`.
- (Para mensajes iniciados por el negocio: falta "Añadir método de pago" en Meta y verificación de empresa; no hace falta para responder dentro de la ventana de 24h.)
