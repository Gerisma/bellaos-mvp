# 📋 Tareas Pendientes — BellaOS MVP

## ⚠️ Nota (22/07/2026): este documento estaba desactualizado

Varias secciones de abajo (Fase 1, "MercadoPago pendiente", etc.) quedaron escritas
en una etapa anterior y ya NO reflejan el código real. Auditoría hecha hoy leyendo
el código y la base directamente — esto es lo que hay REALMENTE en producción:

- **WhatsApp: en vivo y funcionando.** Número real +54 362 15-484-0504, token
  permanente, firma HMAC validada, deploy en Vercel (`bellaos-mvp-1`). No está pendiente.
- **Facturación de la plataforma (a las estéticas): construida completa.** Prueba de
  15 días con tarjeta (MercadoPago Secure Fields), suscripción mensual automática
  (preapproval), cron que bloquea al vencer, panel admin cross-negocio, cuentas
  "cortesía". Falta solo cargar credenciales reales de MercadoPago (ver abajo).
- **Cobro de señas de turnos (MercadoPago Checkout Pro): construido completo**
  (`/api/payments`, botón en `/agenda`, webhook que reconsulta el pago antes de
  acreditar). Mismo tema de credenciales reales pendiente.
- **Onboarding self-service de WhatsApp (Embedded Signup): código listo**
  (`metaGraph.js`, `/api/whatsapp/connect`), pero bloqueado por un trámite de Meta
  (Tech Provider + `configuration_id`) que no se puede acelerar desde el código.
- **Login/Auth + aislamiento por negocio (RLS): construido.**
- **Hoy además se agregó:** Agenda v2 (el asistente agenda turnos solo si el mensaje
  trae servicio+fecha+hora, ej. "quiero un corte mañana a las 15hs" — antes solo
  prometía "voy a ver disponibilidad"), CRM-Embudo visual con tarjetas arrastrables
  (`/crm`), generador de contenido con IA para IG/Facebook (`/contenido`).

Las secciones de abajo se dejan como quedaron (valor histórico), pero para el
estado real siempre priorizar esta nota y `HANDOFF_CLAUDE_CODE.md`.

## 🆕 Segunda tanda (22/07/2026, más tarde): Conexiones + Tienda + Catálogo

A pedido de Gerardo: sección de Conexiones, tienda de productos tangibles con
carrito y pago, y catálogo de servicios con categorías reales.

- [x] **Catálogo real cargado**: 44 servicios de Bella Estética (categorías, sub-tratamientos,
  precios, duración, tiempo de limpieza/preparación, tiempo de reserva) — tabla `services`
  ampliada con `categoria`, `subcategoria`, `tiempo_limpieza_min`, `tiempo_reserva_dias`.
  **Precios son de ejemplo, hay que confirmarlos antes de salir al mercado** (palabra de Gerardo).
- [x] **Página `/conexiones`** (nueva en el menú): hub único con WhatsApp (ya existía),
  Facebook/Instagram (nuevo), Google Calendar (nuevo) y a qué WhatsApp/email le llegan
  los avisos internos.
- [x] **Notificaciones a la dueña por WhatsApp**: cuando el asistente agenda un turno solo
  (Agenda v2) o deriva una conversación a un humano, se le avisa por WhatsApp a
  `tenants.notif_whatsapp_telefono` (configurable en `/conexiones`). Usa una plantilla
  nueva (`aviso_dueno`) que **todavía hay que crear y mandar a aprobar en Meta Business
  Manager** — sin esa plantilla aprobada, el envío va a fallar silenciosamente (queda
  logueado, no rompe nada).
- [x] **Facebook/Instagram: botón de conexión real** (`ConnectFacebook.js`, `/api/facebook/connect`):
  login con Facebook, guarda la Página y la cuenta de Instagram Business vinculada.
  Funciona hoy mismo para el administrador de la app de Meta (modo desarrollo); para
  que cualquier negocio externo lo use hace falta la misma aprobación de Meta que
  Embedded Signup de WhatsApp (`pages_messaging`, `instagram_manage_messages`).
  **Todavía no alimenta Conversaciones** (falta el adapter que reciba esos mensajes).
- [x] **Google Calendar: OAuth + espejo de turnos** (`src/lib/googleCalendar.js`,
  `/api/google/connect`, `/api/google/callback`): al conectar, cada turno nuevo
  (manual o agendado solo por la IA) crea un evento en el Google Calendar de la
  dueña. Es de solo lectura para ella — BellaOS sigue siendo la fuente de verdad.
  **Falta cargar `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`** de un proyecto de
  Google Cloud (Gerardo tiene que crearlo, habilitar la Calendar API y configurar
  la pantalla de consentimiento OAuth) — sin esas variables el botón "Conectar"
  devuelve un aviso claro en vez de fallar.
- [x] **Tienda de productos tangibles completa**: gestión (`/productos`, con subida de
  foto) + tienda pública sin login (`/tienda/<slug>`) con carrito y checkout real por
  MercadoPago (`/api/tienda/[slug]`) + webhook extendido para marcar el pedido pagado
  y descontar stock. Tablas `orders`/`order_items` nuevas; `products` ya existía de
  antes (de fidelización) y se le agregó `descripcion`/`imagen_url`.
  **Depende de las mismas credenciales reales de MercadoPago** que la seña de turnos.

### Variables de entorno nuevas a cargar en Vercel (las tiene que poner Gerardo)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google Cloud Console, Calendar API habilitada.
- (Ya pendientes de antes) `MP_ACCESS_TOKEN` / `NEXT_PUBLIC_MP_PUBLIC_KEY` reales de MercadoPago.
- (Ya pendientes de antes) `NEXT_PUBLIC_META_APP_ID` / `NEXT_PUBLIC_META_CONFIG_ID` — también
  destraban el botón de Facebook/Instagram en `/conexiones`, no solo WhatsApp.

### Pendiente de gestión en Meta (no es código)
- [ ] Crear y mandar a aprobar la plantilla de WhatsApp `aviso_dueno` (para las notificaciones internas).
- [ ] Trámite de permisos `pages_messaging`/`instagram_manage_messages` (mismo trámite que Embedded Signup) para que Facebook/Instagram funcione con negocios externos, no solo en modo desarrollo.

## 🌐 Subdominio propio de BellaOS (22/07/2026)

A pedido de Gerardo: separar `www.conectaiapro.org` (portada de la empresa) de un
subdominio propio para el producto BellaOS, en vez de anidar rutas por producto/cliente.

- [x] Agregado `bellaos.conectaiapro.org` como dominio del proyecto en Vercel (mismo deploy).
- [x] `src/middleware.js`: en ese subdominio, "/" sin sesión manda a `/login` (el panel),
  no a la landing comercial — la landing sigue viviendo solo en `www.conectaiapro.org`.
- [ ] **Falta un solo paso, lo tiene que hacer Gerardo**: cargar este registro DNS en
  Hostinger (no pude entrar yo, pide su contraseña):
  - Tipo: `CNAME`
  - Nombre: `bellaos`
  - Valor: `a88263012922a2a8.vercel-dns-017.com.`
  - Vercel lo va a marcar como "Valid Configuration" solo, apenas propague (minutos a
    unas horas). Después de eso, `bellaos.conectaiapro.org` funciona como la puerta de
    entrada al panel de BellaOS.
- Para el próximo producto de ConectaIA Pro (inmobiliarias, gimnasios, etc.): mismo
  patrón, un subdominio nuevo apuntando a un proyecto de Vercel aparte (no anidarlo
  como rutas de este proyecto — son bases de datos y lógica de negocio distintas).

## 🚀 Fase 1: Deploy & Testing (COMPLETA)
- [x] Código backend completo
- [x] Supabase conectado
- [x] Webhook WhatsApp implementado
- [x] Deploy en Vercel — `bellaos-mvp-1`, dominio propio conectado
- [x] Testear URLs públicas
- [x] Generar token permanente WhatsApp

---

## 🔍 Auditoría vs. Demo Original (julio 2026)

Comparación entre `BellaOS_Demo.html` (la maqueta con datos falsos del principio) y el producto real. Hecho hoy:

- [x] Copy de Conversaciones corregido: ya no promete Instagram/Facebook como si estuvieran conectados (decía "todo lo que entra por WhatsApp, Instagram, Facebook y web" sin que IG/FB estén wireados todavía).
- [x] Bug de layout corregido: Términos y Privacidad se renderizaban dentro del panel privado (sidebar + "Cerrar sesión") en vez de como página pública standalone — un visitante anónimo que entraba desde el footer de la portada veía el panel de admin alrededor del texto legal. Arreglado en `Shell.js` (`PUBLIC_PAGES`).
- [x] Página **Simulador ROI** construida (`/simulador-roi`, agregada al menú): calculadora en vivo de plata recuperable, para usar en reuniones de venta. Antes no existía.
- [x] Auditoría de consistencia visual: se revisó el código de Inicio, Conversaciones, Agenda, Informes, Entrenador, Contactos, Admin, Signup, Términos/Privacidad. El sistema de diseño premium (sidebar violeta, `.card`, `.kpi`, `.btn`, etc. en `globals.css`) ya está aplicado de forma consistente en casi toda la app — el ítem "unificar diseño" del roadmap está más avanzado de lo que el checklist reflejaba.

Actualizado 22/07/2026 — construido en esta sesión:

- [x] **CRM-Embudo visual** (`/crm`): columnas por etapa con tarjetas arrastrables (drag & drop nativo), mueve `contacts.stage` en vivo.
- [x] **Contenido IA** (`/contenido`): genera copy para IG/Facebook con OpenRouter (promo, tip, testimonio, novedad, fecha especial). Publicación automática todavía no — depende de permiso de Meta (Content Publishing API), por ahora se copia y pega a mano.
- [x] **Agenda v2**: el asistente agenda solo cuando el mensaje trae servicio + fecha + hora reconocibles ("agendame un corte mañana a las 15hs") — crea el turno real, chequea que no choque con otro turno, y confirma por el mismo chat. Si falta info, sigue pidiendo por LLM/reglas como antes. `/agenda` sigue existiendo como formulario manual para cargar turnos a mano.

Todavía sin construir (genuinamente pendiente, no por falta de tiempo sino por dependencias externas o por ser fase posterior):

- [ ] **Anuncios** (integración con Meta Ads: Pixel, CAPI, retargeting, medición de ROI por campaña). No hay página ni lógica — coincide con Fase 7. Fase posterior a propósito (así lo decidió Claude Code en la sesión 3, no es un olvido).
- [ ] **Reputación / reseñas de Google** automáticas en Informes (el demo mostraba "4,9★, +18 reseñas este mes"). No implementado — depende de Fase 6 (Fidelización v2) y de conectar Google Business Profile API (OAuth propio, lo tiene que autorizar Gerardo).
- [ ] Adaptadores de Instagram y Facebook para que `Conversaciones` reciba mensajes reales de esos canales — **bloqueado por Meta**: requiere que se apruebe el mismo trámite de Embedded Signup (Tech Provider + permisos `pages_messaging`/`instagram_manage_messages`), no es una tarea de código pendiente sino una aprobación externa con tiempos que no controlamos.
- [ ] Cobrar seña automáticamente al agendar por chat (hoy Agenda v2 crea el turno pero el cobro de seña sigue siendo manual desde `/agenda`, botón "Cobrar seña").

---

## 🔧 Fase 2: Setup por Cliente (PENDIENTE)

### Opción A: Self-Service (Cliente configura solo)
- [ ] Crear sección "Setup" en el panel
- [ ] Formulario: "Ingresá tu número WhatsApp"
- [ ] Formulario: "Pegá tu token de WhatsApp"
- [ ] Formulario: "Conectá tu MercadoPago"
- [ ] Guías step-by-step (links a Meta, Business Manager, etc.)
- [ ] Validaciones y errores claros

### Opción B: Premium (TÚ configuras por el cliente)
- [ ] Admin panel para ver/editar clientes
- [ ] Endpoint: crear WABA + generar token automático (si es posible)
- [ ] Endpoint: validar conexión de MercadoPago
- [ ] Endpoint: crear plantillas de WhatsApp
- [ ] Dashboard: ver estado de cada cliente (✅ WhatsApp listo, ⏳ MercadoPago pendiente, etc.)
- [ ] Email a cliente: "Tu setup está listo, podés empezar"

---

## 📱 Fase 3: Redes Sociales (PENDIENTE)

### Instagram & Facebook
- [ ] Adapter para Instagram (similar a WhatsApp)
- [ ] Adapter para Facebook
- [ ] Webhook para recibir mensajes
- [ ] Enviar respuestas automáticas
- [ ] Responder comentarios en posts/historias
- [ ] Integration con el cerebro del asistente

### WhatsApp Evolucionado
- [ ] Leer estados/ubicación del cliente
- [ ] Enviar imágenes/videos en respuestas
- [ ] Botones interactivos (agendar, pagar, etc.)

---

## 💳 Fase 4: Pagos & Suscripción (CÓDIGO LISTO — falta credenciales reales)

### MercadoPago
- [x] Conectar API de MP (`src/lib/mercadopago.js`, `src/lib/mpSubscription.js`)
- [x] Crear órdenes de pago en `/api/payments` (seña de turno) y suscripción (`/api/billing/confirm`)
- [x] Webhooks de MP (`/api/webhook/mercadopago`, confirma re-consultando el pago, nunca confía en el payload)
- [ ] Cargar credenciales reales en Vercel: `NEXT_PUBLIC_MP_PUBLIC_KEY` y `MP_ACCESS_TOKEN` (los tiene que generar Gerardo desde su cuenta de MercadoPago — por seguridad esto no lo puede hacer un asistente de IA, tiene que cargarlo el dueño de la cuenta).
- [ ] Probar el alta con tarjeta de prueba de MercadoPago una vez cargadas las credenciales.
- [ ] Notificaciones al cliente por WhatsApp cuando se confirma un pago (hoy solo se marca `sena_pagada=true` en la base, no se avisa por chat).

### Planes & Billing
- [ ] Crear tabla `subscription_plans` (Basic, Pro, Enterprise)
- [ ] Crear tabla `subscriptions` (qué plan tiene cada cliente)
- [ ] Control de costos por plan (mensajes incluidos, excedentes)
- [ ] Facturación automática (cada mes)
- [ ] Dashboard: ver gasto + próximo pago

---

## ⚡ Fase 5: Optimizaciones (PENDIENTE)

### Crons & Vercel
- [ ] **CAMBIAR PLAN A PRO** cuando esté en producción real
  - Razón: plan Hobby solo permite 1 cron/día. Cambiar schedule a "0 8 * * *" (8 AM)
  - Cuando tengas clientes pagos, upgrade a Pro para múltiples crons
  - Esto permitirá recordatorios 24h + 2h simultáneos

### Seguridad
- [ ] Rotar `service_role` de Supabase a `sb_secret_...` (Supabase depreca legacy keys fin 2026)
- [ ] Implementar rate limiting en APIs
- [ ] Validar firmas HMAC en todos los webhooks

### Rendimiento
- [ ] Caché de FAQs en Redis
- [ ] Compresión de imágenes en respuestas
- [ ] Paginación en tablas grandes (contacts, appointments)
- [ ] Índices en Supabase para queries lentas

### Logging & Monitoreo
- [ ] Integrar Sentry (error tracking)
- [ ] Dashboard de logs en Vercel
- [ ] Alertas por email: errores críticos, crons fallidos

---

## 🎯 Fase 6: Fidelización v2 (PENDIENTE)

### Membership & Referidos
- [ ] Membresía de clientes (niveles, beneficios)
- [ ] Sistema de referidos (cliente recomienda, obtiene descuento)
- [ ] Reseñas automáticas en Google
- [ ] Puntos y rewards

### Reactivación Inteligente
- [ ] Análisis: por qué dejaron de venir
- [ ] Campañas segmentadas (perdidas, en riesgo, aniversarios, cumpleaños)
- [ ] A/B testing de mensajes

---

## 📊 Fase 7: Anuncios & Medición (PENDIENTE)

### Meta Ads
- [ ] Pixel de Facebook/Instagram
- [ ] CAPI (Conversions API) → registrar conversiones en Meta
- [ ] Retargeting (público similar, lookalike)
- [ ] Dashboard: ROI por campaña

### Google Ads
- [ ] Google Ads integration
- [ ] Conversion tracking
- [ ] Search campaigns (local search)

---

## 📇 Cuenta Meta Business / WhatsApp (PENDIENTE)

Del reordenamiento de julio 2026 (nombre "Conectaia PRO" rechazado y corregido), quedó pendiente:

- [ ] Configurar **Enlaces de mensajes** (WhatsApp Manager → el número → Enlaces de mensajes) para el número de Conectaia PRO (+54 9 362 484-0504): crear un link con texto precargado distinto por canal (bio de Instagram, botón del sitio, cartel/QR físico) para saber de dónde viene cada lead. Gratis, sin código.
- [ ] Evaluar **Comandos** (`/demo`, `/precio`, etc.) en WhatsApp Manager: solo autocompletan lo que el usuario escribe, no responden solos — si se agregan, hay que sumar en `responder.js` una regla que los detecte y conteste por reglas sin llamar al LLM (ahorro real de tokens).
- [ ] Actividad mínima en Facebook e Instagram de Conectaia PRO: foto de perfil/portada y un par de publicaciones reales (hoy: 9 y 41 seguidores, sin contenido).
- [ ] Suavizar la bio de Instagram @conectaia_pro (sacar "+40% de ventas en 90 días GARANTIZADO", suena a promesa no verificable).
- [ ] Cargar método de pago en las cuentas de WhatsApp Business (Configuración → Facturación y pagos → Cuentas de WhatsApp Business) — hoy ambas figuran "Sin método de pago"; falta cuando se agoten las conversaciones de servicio gratuitas o se envíen plantillas de marketing. Acción financiera: la tiene que hacer Gerardo.
- [ ] Revisar el acceso duplicado "Gerardo Alegre Alegre @conectaia.ok" (marcado Inactivo) en Usuarios del portafolio — confirmar si hace falta o se puede quitar.
- [ ] Definir Divisa del WABA ConectaIApro (sin definir, relevante si se usa catálogo/pagos).
- [ ] Iniciar verificación **Tech Provider** en Business Info cuando BellaOS empiece a dar de alta números de WhatsApp para clientes (multi-tenant) — no urgente hoy.

---

## 🚨 Issues Conocidos

| Problema | Estado | Nota |
|----------|--------|------|
| Lock files en .git | ⚠️ Pendiente | GitHub Desktop fallaba por permisos. Solución: usar Vercel drag & drop |
| Cron limitado a 1/día | ⚠️ Hobby plan | Cambiar a Pro cuando tengas clientes pagos |
| Service role legacy | ⚠️ Depreca 2026 Q4 | Rotar a `sb_secret_...` antes de fin 2026 |
| Next.js 14.2.5 security | ⚠️ Advertencia | Considerar upgrade cuando salga patch |

---

## 📝 Notas Generales

- **Prioridad ahora**: Deploy + testeo de URLs públicas
- **Prioridad mes 1**: Setup por cliente (Opción A + B)
- **Prioridad mes 2**: MercadoPago + planes de pago
- **Prioridad mes 3+**: Redes sociales + fidelización

**Revisión**: Chequear este MD cada week para priorizaciones.

---

## 📞 Links Útiles

- [Supabase Docs](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [OpenRouter Models](https://openrouter.ai/docs/models)
- [Meta WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [MercadoPago API](https://www.mercadopago.com.ar/developers/es/docs)
