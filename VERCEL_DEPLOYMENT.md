# BellaOS — Deployment en Vercel

## Estado actual
- ✅ Supabase conectado y vigente
- ✅ OpenRouter API key configurada en `.env.local`
- ✅ WhatsApp webhook implementado con validación HMAC
- ✅ Cron de recordatorios configurado en `vercel.json`
- ✅ Campaigns con control de tope y conteo de consumo
- ✅ Todas las rutas API listas para producción

## Antes del deploy

### 1. Variables de entorno para Vercel
Copiar EXACTAMENTE estas variables a Vercel → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=<obtener de .env.local>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<obtener de .env.local>
SUPABASE_SERVICE_ROLE_KEY=<obtener de .env.local>
OPENROUTER_API_KEY=<obtener de .env.local>
OPENROUTER_MODEL=google/gemini-2.5-flash
WHATSAPP_PHONE_ID=1230199323501547
WHATSAPP_VERIFY_TOKEN=bellaos_verify
WHATSAPP_APP_SECRET=<obtener de Meta for Developers → App Settings → Basic>
CRON_SECRET=<generar uno seguro, ej: $(openssl rand -hex 32)>
WHATSAPP_TOKEN=<generar token permanente del System User — ver abajo>
MP_ACCESS_TOKEN=<completar cuando conectes MercadoPago>
```

**⚠️ IMPORTANTE**: Las claves de Supabase y OpenRouter YA están en tu `.env.local`. Solo cópialas de ahí a Vercel.

**Notas:**
- `WHATSAPP_APP_SECRET`: sacá de Meta for Developers → App de BellaOS Asistente → Settings → Basic → App Secret (botón "Show").
- `CRON_SECRET`: generá uno único y seguro; usalo igual en Vercel.
- `WHATSAPP_TOKEN`: generá el token permanente vía System User en Meta Business Manager (ver sección 2 de `WHATSAPP.md`).
- No commitear `.env.local` — ya está en `.gitignore`.

### 2. Webhook en Meta (después del deploy)

Una vez que Vercel despliega, la URL será algo como `https://bellaos-mvp.vercel.app`.

En **Meta for Developers → BellaOS Asistente → WhatsApp → Configuration → Webhook**:

1. **Webhook URL**: `https://bellaos-mvp.vercel.app/api/webhook/whatsapp`
2. **Verify Token**: `bellaos_verify` (tiene que coincidir con `WHATSAPP_VERIFY_TOKEN`)
3. **Subscribe to field**: `messages` (es el único que usamos)

Meta va a hacer un `GET` para verificar — si todo está bien, responde el `hub.challenge` automáticamente.

### 3. Plantillas de WhatsApp

En **Meta Business Manager → WhatsApp Manager → Message Templates**, creá estas 6:

| Nombre | Categoría | Variables | Cuerpo |
|--------|-----------|-----------|--------|
| `recordatorio_24h` | UTILITY | {{1}} nombre, {{2}} fecha/hora | "Hola {{1}}! Te recordamos tu turno mañana {{2}}. Te esperamos 💕" |
| `recordatorio_2h` | UTILITY | {{1}} nombre, {{2}} fecha/hora | "Hola {{1}}! Tu turno es en 2 horas, {{2}}. ¡Nos vemos pronto!" |
| `confirmacion_turno` | UTILITY | {{1}} nombre, {{2}} fecha/hora, {{3}} servicio | "Hola {{1}}! Confirmamos tu turno de {{3}} para el {{2}}. Cualquier cambio, avisanos por acá." |
| `cancelacion_turno` | UTILITY | {{1}} nombre, {{2}} fecha/hora | "Hola {{1}}, tu turno del {{2}} fue cancelado. Escribinos cuando quieras reagendar 💕" |
| `reactivacion` | MARKETING | {{1}} nombre | "Hola {{1}}! Hace un tiempo que no te vemos por acá. Tenemos un beneficio especial esperándote, ¿charlamos?" |
| `bienvenida` | UTILITY | {{1}} nombre del negocio | "¡Hola! Soy el asistente virtual de {{1}} 💕 Puedo darte precios, horarios y agendarte un turno. ¿En qué te ayudo?" |

Meta las revisa antes de aprobarlas — UTILITY suele tardar minutos/horas, MARKETING puede tardar más.

## Proceso de deploy

1. **Conectar repo a Vercel**:
   - Ir a [vercel.com](https://vercel.com) → New Project
   - Importar repo (GitHub/GitLab/Bitbucket)
   - Seleccionar `bellaos-mvp`
   - Next.js se detecta automáticamente

2. **Configurar variables de entorno**:
   - En Project Settings → Environment Variables
   - Agregar todas las variables listadas arriba
   - Son `NEXT_PUBLIC_*` → visibles en el cliente (solo Supabase anon key)
   - El resto → solo servidor

3. **Deploy**:
   - Vercel detecta automáticamente `vercel.json` con el cron
   - Push a `main` dispara deploy automático

4. **Verificar**:
   - Abrir la URL de Vercel (ej: `https://bellaos-mvp.vercel.app`)
   - Probar `/` (homepage) → debe cargar
   - Probar `/onboarding` → debe crear tenants en Supabase
   - Probar `/probador` (si existe) → debe responder mensajes
   - Cron se ejecuta automáticamente cada hora a las `:00`

## Crons configurados

En `vercel.json`:
```json
{
  "crons": [
    { "path": "/api/cron/recordatorios", "schedule": "0 * * * *" }
  ]
}
```

- Ejecuta cada hora a las `:00` (00:00, 01:00, 02:00, etc. UTC)
- Envía recordatorios 24h y 2h para turnos próximos
- Requiere `CRON_SECRET` en el header `Authorization: Bearer ${CRON_SECRET}`
- Vercel lo envía automáticamente

## Después del deploy

1. **Generar token permanente de WhatsApp**:
   - Ir a Meta Business Manager → Business Settings → Users → System Users
   - Crear System User con rol Admin
   - Asignarle el WABA (con permisos `whatsapp_business_messaging` y `whatsapp_business_management`)
   - Generar token sin fecha de expiración
   - Copiar a `WHATSAPP_TOKEN` en Vercel

2. **Registrar webhook en Meta**:
   - Con la URL del deploy (ej: `https://bellaos-mvp.vercel.app/api/webhook/whatsapp`)
   - Meta verifica automáticamente — si OK, el webhook queda registrado

3. **Crear las plantillas de WhatsApp**:
   - En Meta Business Manager → WhatsApp Manager
   - Crear las 6 plantillas (ver tabla arriba)
   - Esperar aprobación (UTILITY: minutos/horas; MARKETING: puede tardar más)

4. **Conectar número real (opcional por ahora)**:
   - Comprar/portar número en Meta
   - Actualizar `WHATSAPP_PHONE_ID` en Vercel (si es diferente del de prueba)
   - El número de prueba (+1 555 661-1382) es válido por 90 días

5. **MercadoPago** (cuando sea):
   - Conectar cuenta de MP en `MP_ACCESS_TOKEN`
   - Implementar pago de señas en `/api/appointments` y `/api/campaigns`

## URLs después del deploy

- **Frontend**: `https://bellaos-mvp.vercel.app/`
- **Webhook WhatsApp**: `https://bellaos-mvp.vercel.app/api/webhook/whatsapp`
- **API Chat**: `https://bellaos-mvp.vercel.app/api/chat`
- **API Cron**: `https://bellaos-mvp.vercel.app/api/cron/recordatorios`
- **Admin Panels**: `/onboarding`, `/panel`, `/agenda`, `/informes`, `/reactivador`

## Control de costos & paquetes

El proyecto tiene:
- `src/lib/usage.js`: cuenta mensajes de marketing y compara con paquete incluido
- `/api/usage`: consulta consumo y tope
- `/reactivador`: UI para campaña de reactivación con barra de consumo y alerta al 80%
- Tope opcional: se puede fijar en `tenants.tope_marketing` vía `/api/usage` POST

Cuando se activa MercadoPago, se puede facturar el excedente automáticamente.

## Rollback

Si hay un problema:
1. Vercel guarda todos los deploys
2. Ir a Deployments → seleccionar un deploy anterior → "Redeploy"
3. O hacer un push a `main` con un fix

## Monitoreo

- **Logs de Vercel**: Deployments → Logs (últimas ejecuciones de crons, errores)
- **Logs de Supabase**: Supabase Dashboard → Logs
- **Errores en webhook**: Vercel → Logs (búsqueda por "WhatsApp")
- **Conversaciones guardadas**: Base Supabase → tabla `conversations`
