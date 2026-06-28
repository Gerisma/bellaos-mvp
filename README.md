# BellaOS — MVP

Plataforma multi-tenant de automatizacion con IA para estetica/bienestar.
Stack: Next.js (App Router) + Supabase (Postgres, RLS) + OpenRouter (LLM) + WhatsApp Cloud API.

> Supabase YA esta conectado: el `.env.local` trae la URL y las claves del proyecto BellaOS.
> Falta solo (opcional) la clave de OpenRouter para usar el LLM; sin ella el asistente responde con reglas.

## Puesta en marcha

```
npm install
npm run dev
```
Abrir http://localhost:3000

## Pantallas

- `/`            inicio con accesos
- `/onboarding`  alta de un negocio (crea tenant + marca + servicios)
- `/probador`    chat de prueba con el asistente (cerebro)
- `/panel`       contactos (clientas)
- `/agenda`      turnos: ver y crear (escribe en la tabla appointments)
- `/reactivador` detecta inactivas, crea y envia campañas por tandas

## API

- `GET/POST /api/tenants`            listar / crear negocios
- `GET      /api/tenant-data`        contactos + servicios de un tenant
- `POST     /api/chat`               probar el asistente (cerebro)
- `GET/POST /api/appointments`       listar / crear turnos
- `GET/POST/PATCH /api/campaigns`    inactivas / crear campaña / enviar tanda
- `GET      /api/cron/recordatorios` marca recordatorios 24h y 2h (Vercel Cron, ver vercel.json)
- `GET/POST /api/webhook/whatsapp`   webhook de WhatsApp (usa el mismo cerebro)

## El cerebro

`src/lib/responder.js` carga el negocio + servicios desde Supabase, clasifica la intencion
(precio, turno, horario, cancelar, queja) y responde. Con OPENROUTER_API_KEY usa el LLM;
sin ella, responde con reglas usando los datos reales del negocio.

## Base de datos

`supabase/schema.sql` (11 tablas + RLS) ya aplicado en el proyecto BellaOS.
`supabase/seed.sql` datos de prueba (Estetica Demo).

## Roadmap

Hecho: onboarding, cerebro, probador, panel, agenda, reactivador, recordatorios.
Sigue: Informes in-system, IG/FB/web, pagos (MercadoPago), recompra/referidos/resenas, anuncios.
