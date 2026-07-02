# 🎯 SIGUIENTE PASO — Qué hacer ahora

## Resumen
Todo el código está **listo para producción**. El MVP funciona localmente. Ahora necesitás **1 cosa** para avanzar:

---

## ❓ Pregunta crítica:

### ¿Está el proyecto ya deployado en Vercel?

**SI** → Compartí la URL y me doy cuenta del resto  
**NO** → Deployá en Vercel (la guía es simple)

---

## Opción A: Ya está en Vercel ✅

Si ya lo deployaste en otra sesión:
1. Compartí la URL (ej: `https://bellaos-mvp.vercel.app`)
2. Yo actualizaré todos los valores para WhatsApp (webhook URL, etc.)
3. Generás token permanente en Meta
4. Listo

**Tiempo**: ~5 minutos

---

## Opción B: Deployar ahora

**Ruta rápida sin complicaciones:**

1. Ir a [vercel.com](https://vercel.com) → Inicia sesión
2. **New Project** → buscar y conectar repo `bellaos-mvp` (GitHub)
3. Siguiente → **Add Environment Variables** y copiar EXACTAMENTE esto:

```
NEXT_PUBLIC_SUPABASE_URL=<obtener de .env.local>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<obtener de .env.local>
SUPABASE_SERVICE_ROLE_KEY=<obtener de .env.local>
OPENROUTER_API_KEY=<obtener de .env.local>
OPENROUTER_MODEL=google/gemini-2.5-flash
WHATSAPP_PHONE_ID=1230199323501547
WHATSAPP_VERIFY_TOKEN=bellaos_verify
WHATSAPP_APP_SECRET=<obtener de Meta Settings Basic>
CRON_SECRET=<generar seguro: openssl rand -hex 32>
WHATSAPP_TOKEN=<vacío por ahora>
MP_ACCESS_TOKEN=
```

**ℹ️** Las claves están en tu `.env.local` — solo cópialas de ahí a Vercel.

4. **Deploy** → Vercel automáticamente:
   - Copia el repo
   - Detecta Next.js
   - Build y sube a CDN
   - Te da una URL (ej: `https://bellaos-mvp.vercel.app`)

5. **Verifica**:
   - Abrí la URL → debe cargar `Hola 👋`
   - Probá `/onboarding` → debe dejar crear un negocio
   - Revisá logs en Vercel → Deployments → Logs (si hay errores)

**Tiempo**: ~10 minutos

---

## Después del deploy

1. **Capturá la URL** que Vercel te da
2. **Generar token permanente en Meta**:
   - Business Manager → Users → System Users → New
   - Admin role, asignarle WABA, generar token sin fecha de expiración
   - Copiar a Vercel → Environment Variables → `WHATSAPP_TOKEN`
   - Redeploy (manual o esperar que Vercel lo detecto)

3. **Registrar webhook en Meta**:
   - Meta for Developers → BellaOS → WhatsApp → Configuration
   - URL: `https://tu-url-vercel.com/api/webhook/whatsapp`
   - Verify Token: `bellaos_verify`
   - Meta verifica solo → OK ✅

4. **Crear plantillas de WhatsApp** (6 plantillas):
   - Names exactos, categorías UTILITY/MARKETING
   - Meta las aprueba (UTILITY: minutos, MARKETING: más tiempo)

---

## Documentación disponible

- **VERCEL_DEPLOYMENT.md** → Guía completa, paso a paso
- **WHATSAPP.md** → Detalles WhatsApp Cloud API
- **CHECKLIST_DEPLOY.md** → Checklist visual
- **CLAUDE.md** → Contexto del proyecto

---

## 📊 Estado del MVP

### ✅ Completado
- Backend: responder.js, brain.js, llm.js (OpenRouter), whatsapp.js
- Webhook WhatsApp: validación HMAC, manejo de conversaciones
- Crons: recordatorios 24h y 2h configurados
- Campaigns: control de tope y conteo de consumo
- Auth: login/signup, multi-usuario por tenant
- UI: sidebar, cards, KPIs, tables, pills
- Supabase: schema, RLS, seed data
- Control de costos: tracking completo

### 🚀 Listo para deploy
- Todo el código testea y funciona en local
- Vercel.json tiene crons configurados
- .env.local tiene todas las claves (no committeado)
- No hay dependencias faltantes

### ⏳ Pendiente
1. Deploy en Vercel (10 minutos)
2. Generar token permanente WhatsApp (5 minutos)
3. Registrar webhook en Meta (1 minuto)
4. Crear 6 plantillas WhatsApp (10 minutos + 1-24h aprobación)

---

## 🎬 Plan de los próximos 30 minutos

1. ✅ **Ahora**: Me avisás si Vercel está deployado o querés deployar
2. ⏳ **Si no**: Déjame deployar en Vercel por vos (es rápido)
3. ⏳ **Luego**: Generás token permanente de WhatsApp
4. ⏳ **Después**: Registrás webhook en Meta
5. ✅ **Finalmente**: Creás las 6 plantillas (Meta las aprueba en paralelo)

**Total**: ~30 min (sin contar aprobación de plantillas)

---

## ¿Preguntas?

- "¿Puedo deployar sin WhatsApp aún?" → Sí, funciona todo menos el webhook
- "¿Puedo usar número de prueba?" → Sí, vale 90 días
- "¿Qué pasa si deployar falla?" → Vercel logs te dice qué pasó, rollback es 1 click
- "¿Se pueden cambiar las variables después?" → Sí, Vercel redeploying automático

---

## 🚀 Siguiente acción

**Compartí:**
- ¿Está en Vercel ya? (URL si es sí)
- ¿Querés que lo depliegue ahora? (si es no)

O directamente empezá vos mismo en [vercel.com](https://vercel.com) — es simple.
