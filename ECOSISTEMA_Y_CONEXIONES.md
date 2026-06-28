# BellaOS — Ecosistema y conexiones

Cómo se conecta todo: WhatsApp, Instagram, Facebook, anuncios, agenda, pagos, y la seguridad/resguardo de los datos. Lenguaje claro, técnicamente correcto.

## 1. Mapa general
La app (Next.js en Vercel) es el centro. A su alrededor:
- **Supabase** → base de datos, login y archivos (el "cerebro de datos").
- **Meta** (WhatsApp + Instagram + Facebook) → mensajería y anuncios.
- **OpenRouter** → la IA que redacta las respuestas.
- **MercadoPago** → cobros (abono del negocio y señas).
- **Vercel Cron** → tareas automáticas (recordatorios, recompra, campañas).
Todo se comunica por **webhooks** (Meta/MP te avisan cuando pasa algo) y por **APIs** (vos les pedís acciones).

## 2. WhatsApp (Cloud API de Meta)
**Qué se necesita:** una cuenta de Meta Business, una WhatsApp Business Account (WABA), un número de teléfono y una app en Meta for Developers.
**Cómo conecta:**
1. Cada negocio conecta su número con un proceso guiado (Embedded Signup). Vos guardás su `phone_number_id` y su token.
2. En Meta configurás la **URL del webhook** apuntando a `/api/webhook/whatsapp`. Cuando alguien escribe, Meta te manda el mensaje ahí.
3. La app identifica de qué negocio es (por el `phone_number_id`), arma la respuesta con el cerebro y la envía con la **Graph API**.
**Reglas clave:** si el cliente escribe primero, podés responder libre por 24 h. Para escribir vos primero (recordatorios, promos) se usan **plantillas aprobadas** por Meta.
**Anuncios → WhatsApp:** los anuncios "click-to-WhatsApp" abren un chat; ese mensaje llega al webhook como cualquier otro y el asistente responde solo.

## 3. Instagram y Facebook (Messenger + DM + comentarios)
**Qué se necesita:** una Página de Facebook + una cuenta de Instagram Business vinculada, y permisos en tu app de Meta (`pages_messaging`, `instagram_manage_messages`, `instagram_manage_comments`, `pages_manage_metadata`).
**Cómo conecta:**
1. El negocio hace "Conectar mi Instagram/Facebook" → inicia sesión con Facebook y te da permiso (OAuth). Guardás el token de su Página.
2. Mismo webhook de Meta recibe **DMs y comentarios** de IG y FB.
3. La app responde: a un **DM** contesta en privado; a un **comentario** puede responder público y además mandar un privado para cerrar el turno.
**Anuncios:** las campañas se corren desde la Página (Ads Manager). Los leads (click-to-Messenger / IG / WhatsApp) caen en el webhook y el asistente los atiende. Todo desde la **misma bandeja unificada** de la app.

## 4. Publicidad y medición (Meta Ads)
- **MVP:** las campañas se crean en el Administrador de Anuncios de Meta; la app se encarga de **recibir y contestar** los leads.
- **Medición (clave):** se instala el **Píxel de Meta** en la landing/sitio y se usa la **Conversions API (CAPI)** para mandarle a Meta los eventos del servidor (ej.: "turno agendado"). Así Meta optimiza los anuncios y vos ves el **costo por turno** real.
- **Fase 2:** con la **Marketing API** se pueden crear y gestionar campañas desde la propia app.

## 5. Sistema de agendamiento
- **Fuente de verdad:** la tabla `appointments` de la app. El asistente consulta disponibilidad (evita choques de horario) y crea el turno.
- **Recordatorios:** un **cron** (Vercel Cron) revisa los turnos próximos y manda el aviso 24 h y 2 h antes por WhatsApp.
- **Seña:** al confirmar, se genera un link de pago de MercadoPago (ver §6).
- **Opcional:** sincronizar con **Google Calendar** (para que la dueña lo vea en su calendario) o integrarse con AgendaPro/Fresha si ya usa una. No es necesario para el MVP.

## 6. Pagos (MercadoPago)
**Qué se necesita:** cuenta de MercadoPago y su `access_token`.
**Cómo conecta:**
1. La app crea una **preferencia de pago** (checkout) con la API de MP → devuelve un **link de pago**.
2. Ese link se manda a la clienta (seña del turno) o al negocio (abono mensual).
3. MP avisa por **webhook** cuando el pago se aprueba → la app marca la seña pagada o el abono al día.
**Dos usos:** (a) **seña** de turnos para bajar ausencias; (b) **abono mensual** del negocio (suscripción recurrente con "preapproval"). Si cobrás en nombre de cada estética, se usa el esquema de **Marketplace/split** o cada una conecta su propia cuenta.

## 7. El ecosistema completo (resumen)
| Capa | Servicio | Para qué |
| :-- | :-- | :-- |
| App (front + APIs) | Next.js en Vercel | El producto y los webhooks |
| Datos + Auth + Storage | Supabase (Postgres) | Negocios, clientas, turnos, login |
| IA | OpenRouter | Respuestas del asistente |
| Mensajería + Ads | Meta (WhatsApp/IG/FB) | Atención y captación |
| Pagos | MercadoPago | Abonos y señas |
| Tareas automáticas | Vercel Cron | Recordatorios, recompra, campañas |
| Secretos | Vercel Env / Doppler | Guardar claves seguras |
| Monitoreo | Logs + Sentry + healthcheck | Ver errores y caídas |

## 8. Seguridad y resguardo de datos (contra hackeos y fugas)
**Aislamiento de datos (lo más importante):**
- **RLS (Row Level Security) por negocio** en Supabase: cada estética solo puede ver SUS datos, aunque compartan la misma base. Es la barrera principal.
- **Mínimo privilegio:** la clave `service_role` (acceso total) vive solo en el servidor, nunca en el navegador.

**Protección de accesos:**
- Login con Supabase Auth, contraseñas fuertes y opción de **2FA**.
- **HTTPS** en todo (Vercel lo da por defecto).
- **Validación de firmas** en los webhooks (Meta y MP firman sus pedidos: se verifica HMAC) para que nadie falsifique mensajes.
- **Rate limiting** y validación de entradas en los endpoints públicos (evita abuso e inyección).

**Datos personales (Ley argentina 25.326):**
- Guardar solo lo necesario, con **consentimiento** y **opt-out** respetado.
- Derecho de la clienta a pedir el **borrado** de sus datos.
- Política de privacidad y términos publicados.

**Resguardo (backups):**
- **Backups automáticos** de Supabase (los planes pagos suman *Point-in-Time Recovery*, restaurar a un minuto exacto).
- **Exportación periódica** extra (por las dudas) y **probar la restauración** cada tanto (un backup que no se probó no sirve).

**Operación y monitoreo:**
- **Secretos rotables**: si se filtra una clave, se rota sin tocar el código.
- **Monitoreo y alertas** (errores con Sentry, caídas con un healthcheck).
- **Actualizar dependencias** y registrar accesos (audit log).
- **Plan de incidente:** si pasa algo, rotar claves, revisar logs, avisar a los afectados.
- **WhatsApp:** "calentar" números nuevos y respetar políticas para evitar baneos.

## 9. Orden recomendado para conectar todo
1. Supabase (ya hecho) → 2. OpenRouter → 3. WhatsApp Cloud API → 4. MercadoPago → 5. Instagram/Facebook → 6. Píxel + CAPI (medición) → 7. Deploy en Vercel con todas las variables → 8. Endurecer seguridad (RLS, firmas, backups, monitoreo).
