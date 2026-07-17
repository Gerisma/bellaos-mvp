# Manual del Dueño — BellaOS (para Gerardo / ConectaIA Pro)

Este manual es para vos, el que opera la plataforma y vende el servicio. Explica cómo
funciona BellaOS por dentro, cómo dar de alta un cliente, cómo cobrarle, cómo
monitorear que todo ande y qué hacer cuando algo falla.

> Cliente = "tenant" = una estética/peluquería/centro de bienestar. Un solo sistema
> atiende a muchos clientes, cada uno con su voz, sus datos y su WhatsApp.

---

## 1. Qué vendés (en una frase)

Un asistente con IA que atiende el WhatsApp de la estética 24/7: responde precios y
horarios, agenda turnos, reactiva clientas dormidas y da informes — sin que la dueña
tenga que estar contestando el teléfono.

---

## 2. Cómo está montado (arquitectura, mínimo indispensable)

| Pieza | Qué hace | Dónde |
|-------|----------|-------|
| App web (Next.js) | El panel que usa el cliente + las rutas API | Vercel: proyecto `bellaos-mvp-1` → `https://bellaos-mvp-1.vercel.app` |
| Base de datos (Supabase) | Guarda negocios, contactos, turnos, mensajes | Proyecto Supabase `BellaOS` (ref `kcslhhupssvetmbigorl`) |
| Cerebro IA (OpenRouter) | Genera las respuestas del asistente | Se activa con `OPENROUTER_API_KEY` |
| WhatsApp Cloud API (Meta) | El canal por donde entra y sale cada mensaje | App de Meta "BellaOS Asistente" (ID `2616978828760126`) |
| Código | Repo GitHub `Gerisma/bellaos-mvp`, rama `master` | `git push` a `master` = deploy automático a producción |

**Regla de oro del deploy:** cada `git push` a `master` publica en producción. No hay
paso manual. Si rompés algo, revierte con `git revert` y volvé a pushear.

---

## 3. El panel del cliente (las 8 pantallas)

Estas son las secciones que ve el cliente cuando entra a la app. Conviene que las
conozcas para poder darle soporte:

1. **Inicio** — KPIs (turnos, ingresos, reactivadas, inactivas), consumo del mes y recomendaciones dinámicas según el estado real del negocio.
2. **Entrenador** — Preguntas frecuentes (izquierda) + Probador (derecha) en una sola pantalla. El cliente prueba el asistente con casos reales y, si algo no lo supo responder, lo carga como FAQ ahí mismo para que lo aprenda.
4. **Conversaciones** — bandeja unificada: todos los chats de WhatsApp, quién escribió y qué respondió el bot.
5. **Contactos** — la lista de clientas del negocio (se crean solas cuando escriben).
6. **Agenda** — turnos reales. Se pueden crear a mano o los agenda el asistente.
7. **Reactivador** — detecta clientas inactivas y les manda campañas por WhatsApp (con control de consumo).
8. **Informes** — KPIs, embudo, turnos por canal y **consumo del mes** (mensajes usados vs incluidos + excedente).

---

## 4. Planes y facturación

Los paquetes de mensajes de marketing/campaña por plan están definidos en
`src/lib/usage.js`:

| Plan (`plan` en la tabla `tenants`) | Mensajes de campaña incluidos / mes |
|-------------------------------------|-------------------------------------|
| `recepcion_ia` | 800 |
| `recepcion_fidelizacion` | 1500 |
| `marketing_full` | 3000 |

- **Excedente:** cada mensaje de marketing por encima del paquete cuesta
  **$25 ARS** (`OVERAGE_COST_ARS`, ajustable en el mismo archivo).
- **Tope opcional:** el cliente puede fijar un tope (`tenants.tope_marketing`) desde
  `/reactivador`; al alcanzarlo, el sistema deja de enviar campañas para no generar excedente.
- **Alerta al 80%:** cuando el consumo llega al 80% del paquete, la pantalla avisa.
- Las respuestas del asistente dentro de la ventana de 24h (conversación iniciada por
  la clienta) **no cuentan** como marketing; el costo de marketing es solo para
  campañas/mensajes iniciados por el negocio.

> Importante: las respuestas dentro de 24h son gratis para Meta en muchos casos, pero
> los mensajes iniciados por el negocio (plantillas) tienen costo de Meta aparte del tuyo.
> El precio que le cobrás al cliente tiene que cubrir: tu margen + costo Meta + costo LLM.

**Cobro automático del excedente por MercadoPago:** todavía NO está conectado. Hoy el
excedente se muestra en Informes pero lo facturás vos a mano. (Ver "Qué falta".)

---

## 5. Dar de alta un cliente nuevo (resumen)

El paso a paso detallado está en `manuales/ONBOARDING_CLIENTE_PASO_A_PASO.md`. En corto:

1. El cliente entra a `/signup`, crea su usuario (email + contraseña) y en `/onboarding`
   carga los datos del negocio y sus servicios.
2. **Vos** conectás su WhatsApp a la plataforma (hoy es un proceso manual en Meta +
   Supabase; ver el paso a paso). Este es el único paso técnico.
3. Cargás su plan en la base (`tenants.plan`).
4. El cliente prueba en `/entrenador` (Probador + FAQs juntos) y ya está atendiendo.

> Hoy la conexión de WhatsApp de cada cliente la hacés vos manualmente. Cuando se
> implemente **Embedded Signup** (ver "Qué falta"), el cliente lo hará solo con un
> botón "Conectar WhatsApp". Ese es el cambio que te permite escalar a muchos
> clientes sin trabajo manual por cada uno.

---

## 6. Variables de entorno (Vercel — proyecto `bellaos-mvp-1`)

Nunca las commitees. Viven en Vercel (Settings → Environment Variables) y en tu
`.env.local` local:

| Variable | Para qué |
|----------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Conexión pública a Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave secreta de servidor (altas privilegiadas). **Nunca exponer.** |
| `WHATSAPP_TOKEN` | Token permanente del System User de Meta |
| `WHATSAPP_PHONE_ID` | Phone Number ID del número de la plataforma |
| `WHATSAPP_APP_SECRET` | Secreto de la app Meta (valida la firma del webhook) |
| `WHATSAPP_VERIFY_TOKEN` | Token para verificar el webhook (hoy `bellaos_verify`) |
| `OPENROUTER_API_KEY` / `OPENROUTER_MODEL` | Cerebro IA (sin la key, responde por reglas) |
| `CRON_SECRET` | Protege el cron de recordatorios |
| `MP_ACCESS_TOKEN` | Token de MercadoPago de la plataforma (cobro de señas) |
| `NEXT_PUBLIC_APP_URL` | URL pública de la app (para el link de vuelta de MercadoPago). Opcional: si falta, se usa el origin de la request. |
| `NEXT_PUBLIC_META_APP_ID` / `NEXT_PUBLIC_META_CONFIG_ID` | Habilitan el botón "Conectar WhatsApp" (Embedded Signup). Sin ellas, el botón muestra "no disponible aún". Requieren que la app de Meta sea **Tech Provider** con un `configuration_id` de Embedded Signup creado. |
| `NEXT_PUBLIC_MP_PUBLIC_KEY` | Clave **pública** de MercadoPago (Secure Fields, distinta de `MP_ACCESS_TOKEN`). Habilita la captura de tarjeta en el alta y en `/suscripcion`. Sin ella, esos pasos se saltan solos. |

### Cobro de señas por MercadoPago (implementado esta sesión)
En `/agenda`, cada turno sin seña paga tiene un botón **"Cobrar seña"**: pide el monto,
genera un link de MercadoPago (Checkout Pro) y lo abre en una pestaña. Cuando la clienta
paga, el webhook `/api/webhook/mercadopago` confirma el pago (re-consultando la API de
MP, nunca confía en el aviso en sí) y marca el turno como pagado.

- Hoy todos los cobros usan la cuenta de MercadoPago de la **plataforma**
  (`MP_ACCESS_TOKEN`) — el dinero entra a esa cuenta, no directo a la de cada estética.
  Es la opción simple para arrancar; asentar con cada clienta cómo le transferís su parte.
- `tenants.mp_access_token` existe para que, más adelante, cada negocio pueda conectar
  su propia cuenta de MercadoPago (igual que `whatsapp_token`). Falta la resolución
  multi-cuenta real (Marketplace/OAuth de MP); por ahora el webhook prueba primero la
  cuenta global y, si no encuentra el pago, prueba los tokens propios cargados.
- **Requiere aplicar** `supabase/migration_mercadopago_senas.sql` en producción (columnas
  `tenants.mp_access_token`, `appointments.mp_payment_id`, `appointments.sena_monto`).
  Es aditiva y seguro aplicarla en cualquier momento.
- Facturación automática del **excedente de campañas** (cobrarle a la estética, no a su
  clienta) sigue sin implementar — es un problema de negocio distinto, documentado en la
  sección 4 de este manual.

### WhatsApp self-service (Embedded Signup, groundwork implementado esta sesión)
En Inicio aparece un banner "Conectar WhatsApp" para negocios que todavía no tienen
`whatsapp_phone_id`. Con `NEXT_PUBLIC_META_APP_ID`/`NEXT_PUBLIC_META_CONFIG_ID`
configuradas, el cliente puede conectar su propio WhatsApp con un botón (Facebook Login
for Business + Embedded Signup), sin que vos toques nada: el backend
(`/api/whatsapp/connect`) suscribe la WABA a los webhooks, registra el número y guarda
`whatsapp_phone_id`/`waba_id` en el tenant, usando el token permanente de la plataforma
(mismo modelo de "cuenta compartida" que ya usás).

Para activarlo falta que **vos** hagas en Meta:
1. Que la app `2616978828760126` sea aprobada como **Tech Provider**.
2. Crear una **configuración de Embedded Signup** (Meta Business Manager → WhatsApp
   Manager → Embedded Signup) y obtener su `configuration_id`.
3. Cargar `NEXT_PUBLIC_META_APP_ID=2616978828760126` y
   `NEXT_PUBLIC_META_CONFIG_ID=<el que te dé Meta>` en Vercel.
4. **Aplicar** `supabase/migration_whatsapp_embedded_signup.sql` (columna `tenants.waba_id`).

Hasta entonces, seguí conectando el WhatsApp de cada cliente a mano (ver
`ONBOARDING_CLIENTE_PASO_A_PASO.md`, bloque 3) — el banner de conexión no rompe nada,
solo muestra un aviso de "no disponible aún" con tu email de contacto.

---

## 7. Monitoreo diario (5 minutos)

1. **Vercel → Deployments:** que el último deploy diga "Ready" (verde).
2. **Vercel → Logs** (o `vercel logs`): buscá errores del webhook. Frases clave:
   `firma invalida`, `WhatsApp sendWhatsApp falló`, `persistencia fallo`.
3. **Supabase → Table editor → `messages`:** que estén entrando mensajes nuevos.
4. **Prueba viva:** mandá un WhatsApp al número del bot y confirmá que responde.

---

## 8. Problemas típicos y cómo resolverlos

| Síntoma | Causa probable | Solución |
|---------|----------------|----------|
| El bot no responde nada | Firma inválida (401 en logs) | Revisar que `WHATSAPP_APP_SECRET` sea el de la app `2616978828760126` |
| El bot recibe pero no contesta | Token vencido/incorrecto | Revisar `WHATSAPP_TOKEN` (debe ser el permanente del System User) |
| Responde genérico, sin datos del negocio | El `phone_id` entrante no matchea ningún tenant | Verificar `tenants.whatsapp_phone_id` del cliente en Supabase |
| Responde por reglas, sin IA | Falta `OPENROUTER_API_KEY` o el modelo está dado de baja | Cargar la key / revisar `OPENROUTER_MODEL` |
| No agenda / no guarda | Error de RLS o service_role | Revisar logs de la ruta API correspondiente |
| Campañas no se envían | Se alcanzó el tope (`tope_marketing`) | Subir o quitar el tope en `/reactivador` |
| La seña no se marca como pagada | Falta `MP_ACCESS_TOKEN`, o el webhook de MP no está configurado en el panel de MercadoPago apuntando a `/api/webhook/mercadopago` | Revisar logs de esa ruta; confirmar que el pago está `approved` en el panel de MercadoPago |
| El botón "Conectar WhatsApp" no aparece | Falta `NEXT_PUBLIC_META_APP_ID`/`NEXT_PUBLIC_META_CONFIG_ID`, o el negocio ya tiene `whatsapp_phone_id` cargado | Esperado si todavía no gestionaste Tech Provider en Meta (ver sección de arriba) |

**Verificar el webhook manualmente** (debe devolver el challenge):
```
https://bellaos-mvp-1.vercel.app/api/webhook/whatsapp?hub.mode=subscribe&hub.verify_token=bellaos_verify&hub.challenge=hola
```
Si devuelve `hola` → el webhook está vivo y el verify token es correcto.

---

## 9. Seguridad (no negociable)

- La clave `SUPABASE_SERVICE_ROLE_KEY` da acceso total: solo en el servidor, nunca en el navegador ni en git.
- Cada cliente está aislado por **RLS** (Row Level Security) en Supabase: un negocio nunca ve datos de otro. Las rutas de servidor usan el `tenant_id` del usuario logueado, nunca uno mandado por el cliente.
- El webhook valida **firma HMAC** de Meta en cada request. No desactivar.
- Membresías marcadas `confidencial=true` (regalo de la estética a su clienta) no se exponen nunca en vistas públicas ni informes individuales.

---

## 10. Dominio propio (.com) con Hostinger

BellaOS vive en Vercel; Hostinger solo aloja el **nombre** del dominio y apunta a Vercel.

1. Comprá el dominio en Hostinger (solo el dominio, no hace falta su hosting).
2. En Vercel → tu proyecto `bellaos-mvp-1` → **Settings → Domains** → agregá el dominio. Vercel te muestra un registro `A` y un `CNAME`.
3. En Hostinger → **hPanel → Dominios → tu dominio → DNS/Nameservers** → cargá esos mismos registros.
4. Esperá la propagación (minutos a horas). Vercel emite el HTTPS solo, gratis.

## 11. Prueba de 15 días + suscripción automática

Cada negocio nuevo arranca con **15 días de prueba gratis**. Al crear el negocio en
`/onboarding` se le pide la tarjeta (guardada de forma segura por MercadoPago —
BellaOS nunca ve el número real). No se le cobra nada todavía.

- **`tenants.billing_status`**: `trial` (probando) → `bloqueado` (prueba vencida, sin
  confirmar) → `activo` (suscripción mensual corriendo) → `cortesia` (gratis, nunca se
  bloquea) → `cancelado`.
- **Al vencer los 15 días** (cron diario `/api/cron/billing`), si el cliente no confirmó,
  queda **bloqueado**: no puede usar el panel y el asistente deja de responderle a sus
  propias clientas (aunque el mensaje entrante se guarda, para que lo vea al reactivar).
- **El cliente confirma** en `/suscripcion` con un botón "Sí, quiero seguir" (le vuelve a
  pedir solo el CVV, no la tarjeta completa). Ese clic es el que dispara el **primer
  cobro** y activa la **suscripción mensual automática** de ahí en adelante (se cobra
  solo cada mes, con la misma tarjeta, hasta que cancele).
- **Precio:** `tenants.precio_mensual` (por negocio, editable a mano en Supabase si
  negociás un precio distinto). Los sugeridos por plan están en `src/lib/billing.js`
  (`PLAN_PRECIOS_SUGERIDOS`) — ajustalos ahí si tus precios reales son otros.
- **Requiere** `NEXT_PUBLIC_MP_PUBLIC_KEY` (clave pública de MercadoPago, distinta del
  `MP_ACCESS_TOKEN`) en Vercel. **Sin ella, el paso de tarjeta se salta solo** (no bloquea
  el alta de nuevos negocios) — la prueba corre igual, solo que sin captura de tarjeta
  hasta que la cargues.
- Antes de ir a producción de verdad: **probar el alta completa con una tarjeta de
  prueba de MercadoPago** (Secure Fields es una integración de terceros que no se pudo
  testear en vivo sin credenciales reales).

## 12. Cuentas "cortesía" (gratis) + panel admin

Para dar acceso 100% gratis a alguien pero seguir viendo cuánto "gasta": marcá esa
cuenta como `tenants.billing_status = 'cortesia'` en Supabase (nunca se bloquea sola).

Entrá a **`/admin`** (solo visible para vos, con tu cuenta marcada como
`profiles.is_platform_admin = true`) para ver **todos** los negocios de la plataforma:
su plan, estado, precio y consumo del mes. Con el botón **"Cobrar consumo"** generás un
link de pago único de MercadoPago para facturarle a mano a quien quieras, cuando quieras.

## 13. Logo personalizado (marca blanca básica)

Cada negocio puede subir su logo en **`/ajustes`** (PNG/JPG/WEBP/SVG, hasta 2MB). Se
guarda en Supabase Storage (bucket público `logos`) y reemplaza el ícono "B" en su propio
sidebar. Es por ahora solo visual en el panel — no se propaga a mensajes ni informes.

## 14. Estado y hoja de ruta

El detalle de qué está hecho y qué falta para vender a escala está en el diagnóstico
que te pasé por chat y en `HANDOFF_CLAUDE_CODE.md`. En una línea: **el producto
funciona y ya atiende WhatsApp real; lo que falta para escalar es que cada cliente
conecte su propio WhatsApp solo (Embedded Signup) y el cobro automático por MercadoPago.**
