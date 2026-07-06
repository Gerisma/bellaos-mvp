# Onboarding de un Cliente — Paso a Paso (para Gerardo)

Guía operativa para dar de alta una estética nueva: qué pedirle, qué hace ella, qué
hacés vos y cómo dejar el WhatsApp funcionando. Seguila en orden.

> Estado actual: la conexión de WhatsApp de cada cliente es **manual** (la hacés vos en
> Meta + Supabase). Cuando se implemente Embedded Signup, el bloque 3 lo reemplaza un
> botón "Conectar WhatsApp" que usa el propio cliente. Ver el final de este documento.

---

## BLOQUE 0 — Qué pedirle al cliente ANTES de empezar

Mandale esta lista al cliente (podés copiar/pegar). Sin estos datos no se puede configurar:

**Datos del negocio**
- [ ] Nombre comercial de la estética (como quiere que aparezca).
- [ ] Tono de la marca: cercano / formal / divertido.
- [ ] Horarios de atención (ej: "Lun a Sáb de 9 a 19").
- [ ] Dirección (opcional pero recomendado).
- [ ] Diferencial (qué la hace distinta; una frase).

**Servicios** (esto es lo más importante para que el asistente responda bien)
- [ ] Lista de servicios con: nombre, **precio**, **duración en minutos**, y cada cuántos
      días conviene repetirlo (recompra).

**Para conectar WhatsApp** (bloque técnico, lo hacés vos)
- [ ] Número de teléfono que va a usar el bot. Dos opciones:
  - **Coexistencia (recomendado):** el mismo número que ya usa en su WhatsApp Business.
    Sigue usando su celular normalmente y el bot atiende sobre el mismo número.
  - **Número dedicado:** un número nuevo, exclusivo para el bot.
- [ ] Que tenga (o cree) una cuenta de **Facebook Business** y le dé acceso a ConectaIA
      cuando se lo pidas.

**Preguntas frecuentes** (opcional al inicio, se puede cargar después)
- [ ] Las 5–10 dudas que más le hacen sus clientas, con la respuesta.

---

## BLOQUE 1 — El cliente crea su cuenta (lo hace la clienta, con tu guía)

1. El cliente entra a `https://bellaos-mvp-1.vercel.app/signup`.
2. Crea su usuario con **email + contraseña**.
3. Queda logueado y la app lo lleva a `/onboarding`.

---

## BLOQUE 2 — Cargar el negocio y los servicios (lo hace la clienta o vos)

En `/onboarding`:
1. Completá **Nombre, Tono, Diferencial, Horarios, Dirección**.
2. Cargá cada **servicio** con nombre, precio, duración y recompra (botón "+ Agregar servicio").
3. "Crear negocio". Esto crea el tenant, su perfil de marca y sus servicios en Supabase.

> Resultado: ya se puede probar el asistente en `/probador` (responde con reglas o con IA
> si `OPENROUTER_API_KEY` está activa), aunque WhatsApp real todavía no esté conectado.

---

## BLOQUE 3 — Conectar el WhatsApp del cliente (lo hacés VOS, en Meta)

Este es el único bloque técnico. Es el mismo proceso que hiciste con "Bella Estética".

### 3.1. En Meta (business.facebook.com → WhatsApp)
1. Entrá a la app de Meta **"BellaOS Asistente"** (App ID `2616978828760126`).
2. En la WABA correcta, agregá/registrá el **número del cliente**:
   - Si es **coexistencia**, seguí el flujo de Meta para número existente (mayo 2025+):
     el cliente conserva su WhatsApp Business app y el bot opera sobre el mismo número.
   - Si es **número dedicado**, dá de alta el número nuevo y verificalo por SMS/llamada.
3. Anotá el **Phone Number ID** del número (lo vas a necesitar).
4. **Suscribí la WABA** a la app (toggle "Suscribirse a webhooks" ON, campo `messages`).
5. **Registrá el número** con un PIN si Meta lo pide.

### 3.2. Token
- Usá el **token permanente** del System User "Bellaos whats" (ya tiene permisos
  `whatsapp_business_messaging` + `whatsapp_business_management`). Sirve para todos los
  números de la misma WABA. Si el cliente usa su propia WABA, necesitarás su token.

### 3.3. En Supabase (tabla `tenants`)
1. Buscá el tenant del cliente (por `name`).
2. Cargá el campo **`whatsapp_phone_id`** con el Phone Number ID del paso 3.1.
3. (Si el cliente tiene token propio) cargá **`whatsapp_token`**. Si usa el global de la
   plataforma, dejalo vacío y el sistema cae al `WHATSAPP_TOKEN` de entorno.

### 3.4. Probar de punta a punta
1. Mandá un WhatsApp real al número del cliente.
2. Confirmá que el asistente responde con **los datos de ese negocio** (precios/horarios propios).
3. Verificá en Supabase → `messages` que se guardó el entrante y la respuesta.

> Si responde genérico (sin datos del negocio), el `phone_id` entrante no está matcheando
> el `tenants.whatsapp_phone_id`. Revisá que sea exactamente el mismo ID.

---

## BLOQUE 4 — Asignar el plan y el cobro

1. En Supabase, poné el **`plan`** del cliente en la tabla `tenants`:
   `recepcion_ia` (800 msgs) · `recepcion_fidelizacion` (1500) · `marketing_full` (3000).
2. (Opcional) fijá un **`tope_marketing`** si el cliente quiere un límite de gasto.
3. Acordá el precio mensual y la forma de cobro (hoy manual; MercadoPago pendiente).

---

## BLOQUE 5 — Puesta a punto y entrega

1. Con el cliente, cargá **FAQs** en `/faqs` (las dudas más comunes de sus clientas).
2. Probá varios mensajes reales/ficticios en `/probador` y por WhatsApp.
3. Mostrale las 8 secciones del panel (o pasale `manuales/MANUAL_CLIENTE.md`).
4. Explicale el **consumo de mensajes** y dónde verlo (Informes / Reactivador).
5. ¡Listo! El cliente ya está atendiendo con IA.

---

## Checklist rápido de alta (para copiar por cada cliente)

```
[ ] Cliente creó usuario en /signup
[ ] Negocio + servicios cargados en /onboarding
[ ] Número de WhatsApp definido (coexistencia o dedicado)
[ ] Número dado de alta y registrado en Meta (app 2616978828760126)
[ ] WABA suscrita a webhooks (campo messages)
[ ] tenants.whatsapp_phone_id cargado en Supabase
[ ] tenants.whatsapp_token cargado (si aplica)
[ ] Prueba real por WhatsApp OK (responde con datos del negocio)
[ ] Mensaje guardado en tabla messages
[ ] tenants.plan asignado
[ ] FAQs cargadas
[ ] Cliente capacitado + manual entregado
```

---

## El futuro: onboarding self-service (Embedded Signup)

Cuando se implemente **WhatsApp Embedded Signup**, el BLOQUE 3 desaparece como trabajo
manual tuyo: el cliente va a `/onboarding`, toca **"Conectar WhatsApp"**, inicia sesión
con Facebook, elige/crea su número y da permiso — todo en pocos clics. El backend recibe
el código, obtiene el `phone_number_id` y el `waba_id`, los guarda en `tenants`, suscribe
la WABA y registra el número automáticamente. Eso es lo que te permite escalar a decenas
de clientes sin configurar cada uno a mano. Está detallado como máxima prioridad en
`HANDOFF_CLAUDE_CODE.md`.
