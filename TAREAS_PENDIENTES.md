# 📋 Tareas Pendientes — BellaOS MVP

## 🚀 Fase 1: Deploy & Testing (EN PROGRESO)
- [x] Código backend completo
- [x] Supabase conectado
- [x] Webhook WhatsApp implementado
- [ ] Deploy en Vercel (drag & drop)
- [ ] Testear URLs públicas
- [ ] Generar token permanente WhatsApp

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
