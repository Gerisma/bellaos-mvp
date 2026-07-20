# 📋 Tareas Pendientes — BellaOS MVP

## 🚀 Fase 1: Deploy & Testing (EN PROGRESO)
- [x] Código backend completo
- [x] Supabase conectado
- [x] Webhook WhatsApp implementado
- [ ] Deploy en Vercel (drag & drop)
- [ ] Testear URLs públicas
- [ ] Generar token permanente WhatsApp

---

## 🔍 Auditoría vs. Demo Original (julio 2026)

Comparación entre `BellaOS_Demo.html` (la maqueta con datos falsos del principio) y el producto real. Hecho hoy:

- [x] Copy de Conversaciones corregido: ya no promete Instagram/Facebook como si estuvieran conectados (decía "todo lo que entra por WhatsApp, Instagram, Facebook y web" sin que IG/FB estén wireados todavía).
- [x] Bug de layout corregido: Términos y Privacidad se renderizaban dentro del panel privado (sidebar + "Cerrar sesión") en vez de como página pública standalone — un visitante anónimo que entraba desde el footer de la portada veía el panel de admin alrededor del texto legal. Arreglado en `Shell.js` (`PUBLIC_PAGES`).
- [x] Página **Simulador ROI** construida (`/simulador-roi`, agregada al menú): calculadora en vivo de plata recuperable, para usar en reuniones de venta. Antes no existía.
- [x] Auditoría de consistencia visual: se revisó el código de Inicio, Conversaciones, Agenda, Informes, Entrenador, Contactos, Admin, Signup, Términos/Privacidad. El sistema de diseño premium (sidebar violeta, `.card`, `.kpi`, `.btn`, etc. en `globals.css`) ya está aplicado de forma consistente en casi toda la app — el ítem "unificar diseño" del roadmap está más avanzado de lo que el checklist reflejaba.

Todavía sin construir (existían como pantallas de fantasía en el demo, no como código):

- [ ] **CRM-Embudo visual** dedicado (vista tipo Kanban con tarjetas de clienta arrastrables por etapa). Hoy el embudo existe como datos y barras en `/informes`, pero no como pantalla propia interactiva.
- [ ] **Anuncios** (integración con Meta Ads: Pixel, CAPI, retargeting, medición de ROI por campaña, creativos generados por IA). No hay página ni lógica — coincide con Fase 7 más abajo.
- [ ] **Contenido** (IA que genera y publica posts/reels solos, con calendario de contenido). No existe.
- [ ] **Reputación / reseñas de Google** automáticas en Informes (el demo mostraba "4,9★, +18 reseñas este mes"). No implementado — depende de Fase 6 (Fidelización v2).
- [ ] Adaptadores de Instagram y Facebook para que `Conversaciones` reciba mensajes reales de esos canales (Fase 3 más abajo) — hoy el componente ya soporta mostrar esos canales, falta el webhook/adapter que meta los datos.
- [ ] Agenda v2: que la IA agende sola parseando fecha/servicio del chat y cobre seña (Fase 2/3) — hoy `/agenda` es un formulario manual.

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

## 💳 Fase 4: Pagos & Suscripción (PENDIENTE)

### MercadoPago
- [ ] Conectar API de MP
- [ ] Crear órdenes de pago en `/api/appointments` (seña)
- [ ] Crear órdenes en `/api/campaigns` (reactivación paga)
- [ ] Webhooks de MP (confirmación de pago)
- [ ] Notificaciones al cliente (WhatsApp: "Pago confirmado")

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
