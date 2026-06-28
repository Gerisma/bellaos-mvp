# BellaOS — Contexto del proyecto (para Claude Code)

## Qué es
BellaOS es un SaaS multi-tenant de automatización con IA para estéticas/peluquerías/bienestar.
Un solo motor atiende a muchos negocios (cada uno = un "tenant"), con su voz y sus datos.
Dueño: Gerardo — ConectaIA Pro (info@conectaiapro.com).

## Estado actual (MVP v1 — funcionando)
Construido y conectado a Supabase real:
- Alta de negocios (/onboarding) → crea tenant + brand_profile + services.
- Cerebro del asistente (src/lib/responder.js + brain.js): clasifica intención y responde.
  Con OPENROUTER_API_KEY usa LLM; sin ella, responde por reglas con los datos del negocio.
- Probador del asistente (/probador), Panel de contactos (/panel).
- Agenda (/agenda): crea turnos reales en la tabla appointments.
- Reactivador (/reactivador): detecta inactivas y envía campañas por tandas.
- Informes (/informes): KPIs, embudo y turnos por canal, calculados desde la base.
- Webhook de WhatsApp (/api/webhook/whatsapp) usa el mismo cerebro.
- Cron de recordatorios (/api/cron/recordatorios) + vercel.json.

## Stack
Next.js (App Router, JS) · Supabase (Postgres + RLS) · OpenRouter (LLM) · WhatsApp Cloud API · MercadoPago (pagos, pendiente).
Alias de imports: "@/..." = "src/...".

## Supabase
- Proyecto: BellaOS (ref: kcslhhupssvetmbigorl). Esquema en supabase/schema.sql (ya aplicado), datos en supabase/seed.sql.
- Las claves están en .env.local (NO commitear). service_role es secreta.

## Estructura
- src/app/*           páginas (page.js) y rutas API (api/*/route.js)
- src/lib/            supabase.js, llm.js, brain.js, responder.js, whatsapp.js
- vertical-packs/     estetica.json (comportamiento del rubro en datos)
- supabase/           schema.sql, seed.sql
- design/reference-demo.html  ← DISEÑO OBJETIVO (abrir en navegador)

## DIRECCIÓN DE DISEÑO (importante)
La app hoy tiene un diseño básico/funcional. El objetivo visual es `design/reference-demo.html`
(maqueta premium ya aprobada). Hay que portar ESE look & feel a las páginas reales:
- Paleta: violeta #6D4AFF, violeta oscuro #2E2270, rosa #FF5D93; degradado violeta→rosa.
- Tipografía: Plus Jakarta Sans. Fondo #F4F3FB. Tarjetas blancas, bordes suaves, sombras leves, radios 16-18px.
- Layout con sidebar izquierda (como la demo) + topbar, en vez de las páginas sueltas actuales.
- Crear un layout/sidebar compartido y un set de componentes (Card, KPI, Tabla, Pill) reutilizables.

## ROADMAP para terminar (en orden sugerido)
1. **Unificar diseño**: crear layout con sidebar + theme premium (ver design/reference-demo.html) y aplicarlo a todas las páginas. Mover los estilos inline a un sistema de componentes.
2. **Login / Auth**: Supabase Auth, con tenant_id en el JWT para que RLS aísle por negocio (multi-usuario real).
3. **OpenRouter**: cargar OPENROUTER_API_KEY en .env.local para respuestas con IA.
4. **WhatsApp real**: alta del número (WABA) en Meta, 6 plantillas, validar webhook con firma HMAC, persistir mensajes/conversaciones.
5. **Agenda v2**: que el asistente agende solo (parseo de fecha/servicio) y cobre seña.
6. **Pagos**: MercadoPago para el abono del cliente y para señas.
7. **Canales v1.5**: Instagram, Facebook y chat web (mismos adapters que WhatsApp) + responder comentarios.
8. **Fidelización**: recompra inteligente (recompra_dias), referidos, reseñas de Google automáticas, opt-out.
9. **Anuncios**: medición Pixel/CAPI, retargeting (fase 2).
10. **Deploy**: subir a Vercel (variables de entorno = las de .env.local) para que quede online, no solo en localhost.

## Convenciones
- JS (no TS) en App Router. Rutas API devuelven JSON. Server usa supabaseAdmin() (service role).
- Nunca poner claves en archivos versionados; van en .env.local.
- Mantener el patrón: un "responder" central que el webhook y el probador comparten.

## Control de costos / paquete de mensajes (agregado)
- src/lib/usage.js: PLAN_LIMITS por plan (mensajes de campaña incluidos), OVERAGE_COST_ARS (costo por excedente), incUsage() y getUsage().
- El envío de campañas (/api/campaigns PATCH) cuenta cada mensaje de marketing en usage_metrics y devuelve el consumo y el excedente.
- /api/usage y la pantalla /informes muestran "Consumo del mes": usados / incluidos + excedente y su costo.
- Pendiente para Claude Code: alerta automática al 80%, tope opcional que pausa envíos, y facturar el excedente al cliente (MercadoPago).

### Actualización control de costos (hecho)
- getUsage ahora devuelve: paquete incluido, % usado, alerta_80, limite_superado, tope y tope_alcanzado, excedente y su costo (OVERAGE_COST_ARS).
- /api/usage: GET consumo, POST setea tenants.tope_marketing (migración aplicada: columna tope_marketing).
- /api/campaigns PATCH: respeta el tope (no envía más allá) y cuenta el consumo de marketing.
- /reactivador: barra de consumo, alerta al 80%, excedente a facturar y campo para fijar el tope.
- Único pendiente: facturar el excedente automáticamente por MercadoPago (cuando se conecte MP).

### Conversaciones (hecho)
- src/lib/conversations.js: persistInbound/persistOutbound (crea contacto+conversación+mensajes).
- El webhook de WhatsApp ahora guarda cada mensaje entrante y la respuesta.
- /api/conversations (GET lista / GET por conversation_id) y pantalla /conversaciones (bandeja unificada con filtro visual por canal).

## Features v2 (base creada, lógica pendiente en Claude Code)
Migración aplicada (membership_incentivos_limites). Ver FEATURES_v2_SPEC.md para el detalle.
- tenants: recordatorio_24h_on, recordatorio_2h_on, incentivo(jsonb), limite_diario_wa, productos_activos.
- contacts: recordatorios_pref, es_premium.
- Tablas nuevas: products, membership_plans, memberships (con RLS por tenant).
- Membresía: dos modalidades (pago público por MercadoPago / regalo CONFIDENCIAL = solo estética + clienta). Niveles opcionales. Beneficios jsonb (prioridad reserva, desc servicios/productos, regalos, cumple, extras).
- Privacidad: memberships.confidencial=true nunca se expone en vistas públicas ni informes individuales.

## Historias IG/FB + salud de cuentas (pendiente, especificado)
- Automatizar Historias de Instagram/Facebook (Content Publishing API, media_type=STORIES) con aprobación 1-clic. Límite ~25/día.
- Semáforo de salud: WhatsApp quality_rating + nivel (webhooks phone_number_quality_update/account_update); IG/FB headers X-Business-Use-Case-Usage / X-App-Usage. Regular envíos/anuncios según margen. Detalle en SALUD_CUENTAS_META.md. Es el Bloque 30 de la guía.
