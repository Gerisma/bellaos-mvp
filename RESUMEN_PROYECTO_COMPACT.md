# BellaOS — Resumen compacto del proyecto (al 27/06/2026)
Para retomar sin depender de toda la conversación. Detallado a propósito.

## 1. Quién y qué
- **Gerardo · ConectaIA Pro** (info@conectaiapro.com, IG @conectaia.ok). Vende automatización con IA a negocios de belleza.
- **BellaOS:** SaaS **multi-tenant vertical** para estética/peluquería/bienestar. Un motor atiende a muchos negocios (cada uno = tenant) con su voz y datos. Piloto: "Estética Demo" (basado en Bella Salón, Resistencia). Meta del plan: 10 clientes pagos en ~13 semanas.
- Diferencial vs competencia (Botwoot, etc.): **vertical, hecho-para-vos, más barato (USD 39/49/89)**, con agenda+seña, reactivador, recompra, membresías e informes del rubro.

## 2. Dos frentes del proyecto
### A) Comercial / ventas (en Google Drive)
Activos creados: Diagnóstico+Plan 13 semanas; **Auditoría 360** (Cuestionario v2, Informe FODA+AIDA, Producto v2, Menú/Precios v2, Modelo de Precios con créditos/excedente); Landing de la auditoría (con WhatsApp 549362 4840504); Kit de Anuncios Meta (5 variantes); Demo premium navegable (BellaOS_Demo.html con login, ROI, multicanal, CRM embudo, etc.); Plan Técnico MVP; Starter Kit; Ecosistema y Conexiones; Comparativa Botwoot. CRM Airtable "CRM Gerardo / Contactos": 73 estéticas de Resistencia (4 leads calientes) = lista de clientes objetivo.

### B) La app (repo local) — `C:\Users\Gerardo\Documents\bellaos-mvp` (carpeta conectada)
- **Stack:** Next.js (App Router, JS) + Supabase (Postgres+RLS) + OpenRouter (LLM) + WhatsApp Cloud API + MercadoPago (pendiente). Alias `@/` = `src/`.
- **Corre local:** `npm install` → `npm run dev` → localhost:3000. Diseño premium unificado (sidebar violeta/rosa, Plus Jakarta Sans) vía `globals.css` + `Shell`.

## 3. Supabase (conectado y poblado)
- Proyecto **BellaOS**, ref **kcslhhupssvetmbigorl** (org ropucwgpcejujrdqyprg, us-east-2). Gratis.
- En `.env.local` están cargadas: URL, anon y **service_role** (las 3). Faltan: OPENROUTER_API_KEY, WhatsApp, MP_ACCESS_TOKEN.
- **Tablas:** tenants, brand_profiles, services, contacts, conversations, messages, appointments, campaigns, campaign_targets, knowledge_base, usage_metrics, **products, membership_plans, memberships**. RLS por tenant en todas.
- **Columnas de config en tenants:** recordatorio_24h_on, recordatorio_2h_on, incentivo(jsonb), limite_diario_wa, productos_activos, tope_marketing. **contacts:** recordatorios_pref, es_premium.
- **Datos demo:** Estética Demo (plan recepcion_fidelizacion), 3 servicios, ~10 contactos (7 inactivas), 1 turno (Sofía+Facial).
- Migraciones aplicadas: bellaos_schema_v1, add_tope_marketing, membership_incentivos_limites.

## 4. Funcionalidades de la app YA construidas
- **Onboarding** (/onboarding): crea tenant+marca+servicios.
- **Cerebro** (src/lib/responder.js, brain.js, llm.js): intent + respuesta; LLM si hay clave, si no por reglas con datos del negocio.
- **Probador** (/probador), **Conversaciones** (/conversaciones, bandeja, guarda mensajes), **Contactos** (/panel).
- **Agenda** (/agenda): crea turnos reales; cron recordatorios (/api/cron/recordatorios) + vercel.json.
- **Reactivador** (/reactivador): detecta inactivas, campañas por tandas, **control de costos** (paquete incluido por plan, % usado, alerta 80%, excedente facturable, tope opcional que frena envíos).
- **Informes** (/informes): turnos, ingresos atribuidos, embudo, por canal, consumo del mes.
- **Webhook WhatsApp** (/api/webhook/whatsapp): usa el mismo cerebro; guarda conversación.
- APIs: tenants, tenant-data, chat, appointments, campaigns, usage, informes, conversations, cron.

## 5. Decisiones de producto tomadas
- **Recordatorios:** "ambas" → la estética habilita 24h/2h y la clienta confirma (recordatorios_pref).
- **Límites anti-bloqueo:** "mixto" → automático con warm-up + override manual (limite_diario_wa). Semáforo de salud sugerido (ver auditoría §4).
- **Incentivo:** descuento % o servicio de regalo, opcional en reactivación/cumple/recompra/promo global (tenants.incentivo).
- **Membresía premium (módulo, base creada, lógica pendiente):** dos modalidades opcionales — **pago** (cuota mensual, pública si la estética la habilita, cobro MercadoPago) y **regalo CONFIDENCIAL** (solo estética + esa clienta, nunca se difunde). Beneficios jsonb (prioridad reserva, desc servicios/productos, regalos, cumple, extras). Niveles opcionales. Productos opcionales por negocio. Ver FEATURES_v2_SPEC.md.
- **WhatsApp:** no es obligatorio BSP; se puede ir directo a Cloud API. Arrancar con BSP, migrar a directa por costo. Ver CONEXION_WHATSAPP_BSP.md.
- **IA/costo:** OpenRouter en producción; OmniRoute/LiteLLM a evaluar para bajar costo; pgvector (no Pinecone); cron Vercel (no Inngest aún).
- **Estados de WhatsApp:** NO automatizables por API oficial (solo manual o Historias de IG/FB).

## 6. Lo que falta (roadmap en GUIA_CLAUDE_CODE.md)
Bloques 0-14 (MVP: build/git, auditoría, fixes, login+RLS, conversaciones, cerebro v2, WhatsApp real con HMAC, agenda v2, pagos MP, canales IG/FB/web, fidelización, anuncios, pulido, tests, deploy Vercel). Bloques 15-22 (config negocio, recordatorios condicionales, envío seguro+warm-up, productos, planes membresía, gestión con confidencialidad, aplicar beneficios, cobro MP). Bloques 23-29 (team inbox, plantillas, etiquetas, disparadores por evento, auditoría+2FA, constructor de flujos+integraciones, white-label+app móvil).

## 7. Documentos en el repo
CLAUDE.md (contexto, leído por Claude Code), GUIA_CLAUDE_CODE.md (29 bloques), SESION_1_CLAUDE_CODE.md, FEATURES_v2_SPEC.md, ECOSISTEMA_Y_CONEXIONES.md, COMPARATIVA_BOTWOOT.md, CONEXION_WHATSAPP_BSP.md, ONBOARDING_CLIENTE_NO_TECNICO.md, ANALISIS_OMNIROUTE.md, INTEGRACIONES_Y_CLI.md, AUDITORIA_GENERAL_2026-06-27.md, README.md, supabase/schema.sql + seed.sql.

## 8. Cómo continuar
Abrir **Claude Code** en la carpeta (`claude`), seguir SESION_1 (build+auditoría) y después los bloques de la guía en orden. Lo no-programación (ventas, leads, materiales, conectar servicios por API) se sigue en este chat.
