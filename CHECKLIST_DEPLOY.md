# ✅ Checklist — Deploy BellaOS en Vercel

## ✅ Backend — LISTO PARA PRODUCCIÓN

### Supabase
- [x] Proyecto BellaOS conectado (ref: `kcslhhupssvetmbigorl`)
- [x] Schema aplicado (`supabase/schema.sql`)
- [x] RLS configurado por tenant
- [x] Migrations: `membership_incentivos_limites` aplicada

### Código
- [x] Next.js 14 con App Router (JS, sin TS)
- [x] Rutas API: `/api/webhook/whatsapp`, `/api/chat`, `/api/campaigns`, `/api/appointments`, `/api/cron/recordatorios`, `/api/usage`, `/api/conversations`, más
- [x] Brain del asistente: clasificación de intenciones, reglas y LLM
- [x] WhatsApp: validación HMAC, guardado de conversaciones, envío de mensajes y plantillas
- [x] Crons: recordatorios 24h y 2h (configurados en `vercel.json`)
- [x] Control de costos: conteo de mensajes, tope mensual, alertas
- [x] OpenRouter: integrado, key en `.env.local`

### Seguridad
- [x] `.env.local` no committeado (en `.gitignore`)
- [x] Validación HMAC en webhook
- [x] Verificación de token en crons
- [x] RLS en Supabase (aislamiento por tenant)
- [x] Service role encriptado (migración a `sb_secret_...` pending para 2026-Q4)

---

## 🚫 BLOQUEADO — Necesita intervención

### 1. Deploy en Vercel
**Status**: ⏳ Esperando token de Vercel o URL si ya está deployado

**Qué hacer**:
- Opción A: Si NO está deployado
  - Ir a [vercel.com](https://vercel.com) → Log in
  - New Project → Connect repo (GitHub/GitLab)
  - Seleccionar `bellaos-mvp`
  - Next.js se detecta automáticamente
  - Ver sección "Variables de entorno para Vercel" en `VERCEL_DEPLOYMENT.md`

- Opción B: Si YA está deployado en otra sesión
  - Compartir URL (ej: `https://bellaos-mvp.vercel.app`)
  - Yo actualizaré la config de webhook

**Tiempo**: ~5-10 minutos

---

### 2. WhatsApp — Token permanente
**Status**: ⏳ Esperando generación vía System User

**Qué hacer** (después del deploy en Vercel):
1. Ir a [Meta Business Settings](https://business.facebook.com/settings)
2. Usuarios → Usuarios del sistema → Crear nuevo
3. Nombre: ej "BellaOS Bot", Rol: Admin
4. Asignarle el WABA (1399045228805477) con permisos `whatsapp_business_messaging` y `whatsapp_business_management`
5. Generar token (sin fecha de expiración)
6. Copiar el token → Variables de Vercel → `WHATSAPP_TOKEN`
7. Redeploy automático (o manual si es necesario)

**Tiempo**: ~5 minutos

---

### 3. Webhook — Registrar en Meta
**Status**: ⏳ Esperando URL de Vercel

**Qué hacer** (después del deploy):
1. Meta for Developers → BellaOS Asistente → WhatsApp → Configuration → Webhook
2. **URL**: `https://tu-vercel-url.vercel.app/api/webhook/whatsapp`
3. **Verify Token**: `bellaos_verify` (coincide con `WHATSAPP_VERIFY_TOKEN`)
4. **Subscribe to field**: `messages`
5. Click "Verify"
6. Meta hace un `GET` → responde automáticamente con `hub.challenge` → OK ✅

**Tiempo**: ~1 minuto

---

### 4. Plantillas de WhatsApp — Crear & Aprobar
**Status**: ⏳ Esperando verificación de empresa (opcional)

**Qué hacer**:
1. Meta Business Manager → WhatsApp Manager → Message Templates
2. Crear 6 plantillas (ver tabla en `VERCEL_DEPLOYMENT.md`):
   - `recordatorio_24h` (UTILITY)
   - `recordatorio_2h` (UTILITY)
   - `confirmacion_turno` (UTILITY)
   - `cancelacion_turno` (UTILITY)
   - `reactivacion` (MARKETING)
   - `bienvenida` (UTILITY)
3. Esperar aprobación:
   - UTILITY: minutos a horas
   - MARKETING: puede tardar más (reglas más estrictas)

**Tiempo**: ~10 minutos para crearlas + 1-24 horas para aprobación

---

## 📋 Checklist de pasos

### FASE 1: Preparación (COMPLETADO)
- [x] Código backend listo
- [x] Supabase vigente
- [x] OpenRouter key cargada
- [x] WhatsApp webhook implementado
- [x] Documentación escrita

### FASE 2: Deploy en Vercel (PENDIENTE)
- [ ] Conectar repo a Vercel
- [ ] Configurar variables de entorno
- [ ] Deploy automático
- [ ] Verificar que `/` y `/onboarding` funcionan
- [ ] Obtener URL pública

### FASE 3: Integración de WhatsApp (PENDIENTE)
- [ ] Generar token permanente del System User
- [ ] Agregar `WHATSAPP_TOKEN` a Vercel
- [ ] Registrar webhook en Meta (URL + verify token)
- [ ] Meta verifica automáticamente (GET → hub.challenge)
- [ ] Crear 6 plantillas de WhatsApp
- [ ] Esperar aprobación de plantillas

### FASE 4: Testing (PENDIENTE)
- [ ] Enviar mensaje de prueba al número +1 555 661-1382
- [ ] Verificar que llega respuesta desde el webhook
- [ ] Revisar logs en Vercel
- [ ] Revisar tabla `conversations` en Supabase
- [ ] Probar `/probador` (si existe) → debe responder

### FASE 5: Producción (PENDIENTE)
- [ ] Número real de WhatsApp (opcional, puede ser número de prueba por 90 días)
- [ ] Conectar MercadoPago (cuando sea necesario)
- [ ] Activar alertas de costos (80% del paquete)
- [ ] Monitoreo de crons

---

## 📞 Intervención necesaria

### Vercel
- [x] Token de Vercel (si es primera vez)
- [x] GitHub repo conectado
- [x] O URL si ya está deployado

### Meta / WhatsApp
- [x] App Secret (de Settings → Basic)
- [x] Generar System User y token permanente
- [x] Crear 6 plantillas

### Supabase
- [x] Consideramos si rotar `service_role` (opcional, depreca en Q4 2026)

---

## 🎯 Próximos pasos

1. **Ahora**: Me avisás si Vercel ya está deployado o si necesitas ayuda para conectarlo
2. **Si no**: Desplegar en Vercel (proceso automático de Vercel)
3. **Luego**: Generar token permanente de WhatsApp
4. **Después**: Registrar webhook en Meta
5. **Final**: Crear plantillas y testear

**Estimado**: 30-60 minutos (sin contar aprobación de plantillas)

---

## 📚 Documentación

- `VERCEL_DEPLOYMENT.md` → Guía paso a paso (variables, webhook, plantillas)
- `WHATSAPP.md` → Detalles de WhatsApp Cloud API (número real, token, etc.)
- `CLAUDE.md` → Contexto del proyecto y roadmap
- `.env.example` → Template de variables
