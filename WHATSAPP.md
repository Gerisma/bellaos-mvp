# WhatsApp Cloud API — alta del número (WABA) y plantillas

Guía paso a paso para conectar un número de WhatsApp real a BellaOS, en
producción. Si solo querés probar el código sin un número real, saltá a
[Probar en local sin un número real](#probar-en-local-sin-un-número-real).

## 1. Crear la app de Meta y agregar el producto WhatsApp

1. Entrá a [developers.facebook.com](https://developers.facebook.com) →
   **Mis apps** → **Crear app** → tipo "Negocio".
2. Dentro de la app, agregá el producto **WhatsApp**.
3. Asociá (o creá) una **WhatsApp Business Account (WABA)** y verificá el
   negocio en [Meta Business Manager](https://business.facebook.com) (razón
   social, dirección, a veces piden un documento). Esto puede tardar de horas
   a un par de días si Meta pide revisión manual.
4. Agregá/comprá el número de teléfono que va a usar el negocio (puede ser
   un número nuevo o portar uno existente — un número que ya recibe WhatsApp
   normal no se puede usar al mismo tiempo en la app y en el celular).

## 2. Generar un token permanente

El token que aparece por default en el panel de pruebas **expira a las
24 h** — no sirve para producción.

1. En [Meta Business Settings](https://business.facebook.com/settings) →
   **Usuarios** → **Usuarios del sistema** → creá un **System User** con rol
   **Admin**.
2. Asignale el WABA (con permiso `whatsapp_business_messaging` y
   `whatsapp_business_management`).
3. Generá un token para ese System User, sin fecha de expiración. Ese es el
   valor de `WHATSAPP_TOKEN`.
4. El `WHATSAPP_PHONE_ID` lo sacás de **WhatsApp → Primeros pasos** en el
   panel de la app (es el "Phone number ID", no el número de teléfono en sí).

## 3. Configurar el webhook

1. En **WhatsApp → Configuración → Webhook**, poné la URL pública:
   `https://tu-dominio.com/api/webhook/whatsapp`.
2. **Verify token**: cualquier string que vos elijas — tiene que coincidir
   exacto con `WHATSAPP_VERIFY_TOKEN` en tu `.env.local`/Vercel.
3. Suscribite al campo **`messages`** (es el único que usa la app hoy).
4. Meta va a pegarle a la URL con un `GET` para verificar — si
   `WHATSAPP_VERIFY_TOKEN` está bien configurado, el endpoint responde el
   `hub.challenge` y queda verificado (ver `src/app/api/webhook/whatsapp/route.js`).

## 4. Sacar el App Secret (para validar la firma HMAC)

1. En **Configuración de la app → Básica**, copiá el **App Secret** (botón
   "Mostrar").
2. Es el valor de `WHATSAPP_APP_SECRET`. Cada `POST` que Meta manda al
   webhook viene firmado con `X-Hub-Signature-256` (HMAC-SHA256 del body
   crudo con este secret); `src/app/api/webhook/whatsapp/route.js` lo valida
   antes de procesar nada — sin este secret configurado, el webhook rechaza
   **todos** los POST con 401 (fail-closed a propósito).

## 5. Crear las 6 plantillas

En **WhatsApp Manager → Administrador de plantillas de mensajes → Crear
plantilla**. Cada una necesita: nombre exacto (en minúsculas, sin espacios),
categoría, idioma, y el cuerpo con variables `{{1}}`, `{{2}}`, etc. Meta las
revisa antes de aprobarlas — UTILITY suele tardar minutos a horas, MARKETING
puede tardar más y tiene reglas más estrictas (nada de descuentos exagerados,
tiene que ser claramente identificable como negocio).

| Nombre exacto | Categoría | Variables | Cuerpo sugerido |
|---|---|---|---|
| `recordatorio_24h` | UTILITY | `{{1}}` nombre, `{{2}}` fecha/hora | "Hola {{1}}! Te recordamos tu turno mañana {{2}}. Te esperamos 💕" |
| `recordatorio_2h` | UTILITY | `{{1}}` nombre, `{{2}}` fecha/hora | "Hola {{1}}! Tu turno es en 2 horas, {{2}}. ¡Nos vemos pronto!" |
| `confirmacion_turno` | UTILITY | `{{1}}` nombre, `{{2}}` fecha/hora, `{{3}}` servicio | "Hola {{1}}! Confirmamos tu turno de {{3}} para el {{2}}. Cualquier cambio, avisanos por acá." |
| `cancelacion_turno` | UTILITY | `{{1}}` nombre, `{{2}}` fecha/hora | "Hola {{1}}, tu turno del {{2}} fue cancelado. Escribinos cuando quieras reagendar 💕" |
| `reactivacion` | MARKETING | `{{1}}` nombre | "Hola {{1}}! Hace un tiempo que no te vemos por acá. Tenemos un beneficio especial esperándote, ¿charlamos?" |
| `bienvenida` | UTILITY | `{{1}}` nombre del negocio | "¡Hola! Soy el asistente virtual de {{1}} 💕 Puedo darte precios, horarios y agendarte un turno. ¿En qué te ayudo?" |

El texto exacto se puede ajustar al aprobar — lo importante es que el número
de variables y su orden coincidan con lo que manda el código (ver tabla de
abajo).

**Importante:** el campo "Plantilla" que el negocio escribe al crear una
campaña en el Reactivador (`campaigns.plantilla`) es solo un recordatorio
interno de qué dice la campaña — **no es lo que se envía**. WhatsApp no
permite mandar texto libre como mensaje que inicia el negocio (solo se puede
responder texto libre dentro de las 24 h de un mensaje del cliente). El envío
real de una campaña de reactivación siempre usa la plantilla aprobada
`reactivacion`.

### Conectar el número a un negocio en BellaOS

Una vez aprobado, guardá `WHATSAPP_PHONE_ID` y `WHATSAPP_TOKEN` —
**de ese negocio específico** — en `tenants.whatsapp_phone_id` y
`tenants.whatsapp_token` (cada tenant puede tener su propio número; si esas
columnas están vacías, el código cae a las variables de entorno globales).

## 6. Variables de entorno

| Variable | Para qué | Default si falta |
|---|---|---|
| `WHATSAPP_TOKEN` | Token permanente del System User (fallback global) | — (requerido para enviar) |
| `WHATSAPP_PHONE_ID` | Phone Number ID (fallback global) | — (requerido para enviar) |
| `WHATSAPP_VERIFY_TOKEN` | Verificación del webhook (handshake `GET`) | — (sin esto, Meta no puede verificar el webhook) |
| `WHATSAPP_APP_SECRET` | Validación HMAC de los `POST` del webhook | — (sin esto, el webhook rechaza todo con 401) |
| `WHATSAPP_TEMPLATE_LANG` | Idioma de las plantillas | `es_AR` |
| `WHATSAPP_TEMPLATE_RECORDATORIO_24H` | Nombre real de la plantilla en Meta | `recordatorio_24h` |
| `WHATSAPP_TEMPLATE_RECORDATORIO_2H` | ídem | `recordatorio_2h` |
| `WHATSAPP_TEMPLATE_CONFIRMACION_TURNO` | ídem | `confirmacion_turno` |
| `WHATSAPP_TEMPLATE_CANCELACION_TURNO` | ídem (sin disparador automático todavía, ver abajo) | `cancelacion_turno` |
| `WHATSAPP_TEMPLATE_REACTIVACION` | ídem | `reactivacion` |
| `WHATSAPP_TEMPLATE_BIENVENIDA` | ídem (sin disparador automático todavía, ver abajo) | `bienvenida` |

Solo hace falta setear las `WHATSAPP_TEMPLATE_*` si la plantilla quedó
aprobada con un nombre distinto al de la tabla — si usás los nombres
sugeridos, no hace falta tocar nada.

## 7. Qué dispara cada plantilla hoy

| Plantilla | Se manda automáticamente desde | Código |
|---|---|---|
| `recordatorio_24h` / `recordatorio_2h` | Cron de recordatorios (`/api/cron/recordatorios`, corre por hora vía `vercel.json`) | `src/app/api/cron/recordatorios/route.js` |
| `confirmacion_turno` | Crear un turno con clienta cargada desde `/agenda` | `src/app/api/appointments/route.js` (POST) |
| `reactivacion` | Botón "Enviar tanda" en `/reactivador` | `src/app/api/campaigns/route.js` (PATCH) |
| `cancelacion_turno` | **Sin disparador todavía** — la app no tiene una función de cancelar turnos (ni botón ni ruta). La plantilla queda lista para cuando se construya esa feature; usar `sendWhatsAppTemplate` de `src/lib/whatsapp.js` con `TEMPLATES.cancelacionTurno`. |
| `bienvenida` | **Sin disparador todavía** — no hay un punto del código que dispare "primer contacto manual" con una clienta nueva (el saludo automático del bot, cuando responde por WhatsApp, ya usa texto libre porque es respuesta a un mensaje del cliente, no necesita plantilla). |

## Probar en local sin un número real

### Validar la firma HMAC del webhook

Con el server corriendo (`npm run dev`) y `WHATSAPP_APP_SECRET` seteado en
`.env.local`:

```bash
SECRET="el mismo valor de WHATSAPP_APP_SECRET"
BODY='{"entry":[{"changes":[{"value":{"metadata":{"phone_number_id":"123"},"messages":[{"from":"5491111111111","text":{"body":"hola"}}]}}]}]}'
SIG="sha256=$(echo -n "$BODY" | openssl dgst -sha256 -hmac "$SECRET" | sed 's/^.* //')"

# Firma válida → 200
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/webhook/whatsapp \
  -H "Content-Type: application/json" -H "X-Hub-Signature-256: $SIG" -d "$BODY"

# Firma inválida → 401
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/webhook/whatsapp \
  -H "Content-Type: application/json" -H "X-Hub-Signature-256: sha256=00000" -d "$BODY"
```

### Recibir mensajes reales sin tener el dominio en producción

Meta necesita una URL **pública** y HTTPS para el webhook — `localhost` no
sirve. Para probar el flujo completo en desarrollo, exponé el puerto local
con un túnel (por ejemplo `ngrok http 3000`) y usá esa URL de ngrok como
webhook en el paso 3, apuntando a `/api/webhook/whatsapp`.

### Probar el envío de plantillas sin templates aprobadas

`sendWhatsAppTemplate` (`src/lib/whatsapp.js`) llama directo a la Graph API
de Meta — sin un WABA real configurado (`WHATSAPP_TOKEN`/`WHATSAPP_PHONE_ID`
o las columnas del tenant), o sin las plantillas aprobadas, la llamada va a
fallar. Eso es esperado: revisá la consola del servidor, donde queda
logueado el código de error y el motivo exacto que devuelve Meta (plantilla
no encontrada, no aprobada, número inválido, etc.) — no rompe la respuesta
de la ruta que la dispara (crear turno, enviar campaña, correr el cron).
