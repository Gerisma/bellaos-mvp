# Guía para terminar BellaOS en Claude Code

Pegá los prompts de abajo **en orden, uno por uno**. Después de cada uno, verificá que funcione antes de pasar al siguiente. Claude Code lee `CLAUDE.md` solo, así que ya arranca con todo el contexto.

## Reglas de oro (leé esto primero)
- **Una tarea por vez.** No pidas todo junto; pegá un bloque, esperá, revisá.
- **Verificá siempre:** después de cada cambio, que corra `npm run build` sin errores y probá en `npm run dev`.
- **Usá control de versiones (git):** así cada avance queda guardado y se puede deshacer. Primer paso, Bloque 0.
- **Revisá los cambios** que propone antes de aceptarlos.
- **Claves:** nunca en archivos que se suben a git; van en `.env.local`.
- Para cambios grandes, pedí primero un plan: escribí `/plan` y después la tarea.

---

## BLOQUE 0 — Preparar (git + que compile)
```
Inicializá git si no está (git init, primer commit con todo). Después verificá que el proyecto compile: corré npm run build. Si hay errores, listámelos y arreglalos uno por uno, sin cambiar funcionalidad, hasta que compile limpio. Al final, commiteá.
```

## BLOQUE 1 — Auditoría (modo auditor)
```
Actuá como auditor senior de software. Leé CLAUDE.md y revisá TODO el proyecto BellaOS. Auditá: (a) bugs y errores, (b) seguridad (claves expuestas, uso de service_role, RLS por tenant, validación de inputs, firma HMAC del webhook de WhatsApp), (c) manejo de errores y estados de carga/vacío en la UI, (d) consistencia y buenas prácticas de Next.js. Entregá un informe priorizado (Crítico/Alto/Medio/Bajo) en un archivo AUDITORIA.md. Por ahora solo auditá, no corrijas.
```

## BLOQUE 2 — Corregir lo importante
```
Tomá AUDITORIA.md y resolvé todos los puntos Críticos y Altos, uno por uno, corriendo npm run build después de cada arreglo. Actualizá AUDITORIA.md marcando lo resuelto y commiteá cada arreglo.
```

## BLOQUE 3 — Login y multi-tenant real
```
Implementá autenticación con Supabase Auth (email + contraseña), con registro y login (respetando el diseño de design/reference-demo.html). Cada usuario pertenece a un negocio (tenant): guardá tenant_id en el perfil del usuario y usalo para que cada negocio vea SOLO sus datos. Activá las policies RLS por tenant y dejá de usar service_role para las lecturas del panel. Protegé todas las páginas y APIs.
```

## BLOQUE 4 — Guardar conversaciones
```
Hacé que el webhook de WhatsApp y /api/chat guarden cada mensaje entrante y cada respuesta en las tablas conversations y messages (creando o reusando la conversación del contacto). Creá una página /conversaciones tipo bandeja unificada, con el diseño premium, para ver los chats.
```

## BLOQUE 5 — Cerebro v2 (IA + conocimiento)
```
Mejorá el cerebro: usá pgvector para buscar en knowledge_base las FAQs más parecidas al mensaje y sumalas al prompt. Mejorá el clasificador de intención. Agregá una pantalla para cargar FAQs por negocio. Verificá que con OPENROUTER_API_KEY responda con LLM y sin ella por reglas.
```

## BLOQUE 6 — WhatsApp real
```
Dejá el WhatsApp listo para producción: validá la firma HMAC (X-Hub-Signature-256) del webhook, implementá el envío con plantillas aprobadas para mensajes iniciados por el negocio, y documentá en WHATSAPP.md el paso a paso para dar de alta el número (WABA) y crear las 6 plantillas. Dejalo testeable con variables de entorno.
```

## BLOQUE 7 — Agenda v2 (que agende sola)
```
Hacé que el asistente agende solo: que del mensaje detecte servicio y fecha/hora (parseo en español), consulte disponibilidad evitando choques en appointments, ofrezca 2-3 opciones y al confirmar cree el turno y cambie la etapa de la clienta a turno_agendado. Sumá recordatorios y dejá lista la seña (cobro detrás de MP_ACCESS_TOKEN).
```

## BLOQUE 8 — Pagos (MercadoPago)
```
Integrá MercadoPago: creación de preferencia de pago para el abono mensual del negocio y para señas de turnos, con webhook de confirmación que actualice el estado. Todo detrás de MP_ACCESS_TOKEN en .env.local. Documentá cómo obtener el token.
```

## BLOQUE 9 — Más canales (v1.5)
```
Agregá los adapters de Instagram y Facebook Messenger reusando el mismo responder, más un widget de chat web embebible para el sitio del cliente. Sumá responder comentarios de IG/FB y llevarlos al privado. Unificá todo en la bandeja /conversaciones con filtro por canal.
```

## BLOQUE 10 — Fidelización
```
Implementá: recompra inteligente (un cron que, según services.recompra_dias y la última visita, le escribe a la clienta para volver a reservar), programa de referidos, pedido automático de reseña en Google después de cada servicio, y respeto del opt-out en todos los envíos.
```

## BLOQUE 11 — Anuncios + medición
```
Agregá el módulo de anuncios: integración de Píxel + Conversions API de Meta para medir los turnos generados por cada campaña, y un panel de resultados con costo por turno. Documentá la configuración.
```

## BLOQUE 12 — Pulido final (UX)
```
Repasá toda la app: estados de carga, vacío y error en cada página; diseño responsive; accesibilidad básica; y que todo respete design/reference-demo.html. Corregí cualquier inconsistencia visual.
```

## BLOQUE 13 — Tests
```
Agregá tests básicos del responder/cerebro y de las APIs principales, con un script para correrlos (npm test). Documentá cómo se usan.
```

## BLOQUE 14 — Deploy a producción
```
Prepará el deploy en Vercel: configurá las variables de entorno, el cron de recordatorios (vercel.json), y escribí DEPLOY.md con el paso a paso para subirlo y conectar un dominio. Agregá un checklist de pre-lanzamiento (seguridad, RLS, backups de Supabase).
```

---

## Listo cuando… (definición de "terminado")
- [ ] Compila y deploya sin errores, online en Vercel con dominio.
- [ ] Login real; cada negocio ve solo sus datos (RLS por tenant).
- [ ] El asistente responde y agenda en WhatsApp real (IG/FB/web también).
- [ ] Reactivador, recompra, referidos y reseñas funcionando.
- [ ] Pagos (abono + señas) operativos.
- [ ] Informes con datos reales.
- [ ] Auditoría sin puntos Críticos ni Altos abiertos.

## Consejo
Cada vez que termines un bloque importante, pedile a Claude Code: "actualizá CLAUDE.md con lo que cambió". Así el contexto se mantiene fresco para la próxima sesión.

---

# FEATURES v2 (membresía, incentivos, recordatorios, límites)
La base de datos ya está creada (migración aplicada). Detalle completo en `FEATURES_v2_SPEC.md`. Pegá estos bloques después del 14.

## BLOQUE 15 — Configuración del negocio
```
Creá una pantalla /configuracion (con el diseño premium) donde la estética configure: el incentivo (descuento % o servicio de regalo, y en qué contextos aplica), los toggles de recordatorios 24h y 2h, el catálogo de productos on/off (tenants.productos_activos) y el override de límite diario de WhatsApp. Guardá en las columnas de tenants ya creadas (incentivo jsonb, recordatorio_24h_on, recordatorio_2h_on, limite_diario_wa, productos_activos).
```

## BLOQUE 16 — Recordatorios condicionales
```
Hacé que el cron /api/cron/recordatorios envíe el recordatorio 24h o 2h solo si la estética lo habilitó (tenants.recordatorio_24h_on / _2h_on) Y la clienta lo aceptó (contacts.recordatorios_pref). Al agendar un turno, preguntale una vez a la clienta si quiere recibir recordatorios y guardá su preferencia.
```

## BLOQUE 17 — Capa de envío seguro + warm-up
```
Implementá una capa de "envío seguro" para no causar bloqueos: contador diario de mensajes business-initiated por negocio y canal; respetar el nivel/tier de WhatsApp (arranca ~250/24h y escala); aplicar warm-up gradual en números nuevos; respetar override manual (tenants.limite_diario_wa); y límites de Instagram (~200 DMs/h, ~750 respuestas a comentarios/h, ventana 24h) y publicación (~25/día, ~20 min entre posts). Repartir las campañas en tandas a lo largo del día. Ver números en FEATURES_v2_SPEC.md sección C.
```

## BLOQUE 18 — Catálogo de productos
```
Si tenants.productos_activos está en true, agregá un ABM de productos (tabla products ya creada: nombre, precio, stock) y mostralo en la configuración del negocio. Los beneficios de membresía (descuentos/regalos) podrán referirse a estos productos.
```

## BLOQUE 19 — Planes de membresía
```
Creá el ABM de planes de membresía (tabla membership_plans): nombre, nivel, precio_mensual, publico (visible a todas), activo y beneficios (jsonb: prioridad_reserva, desc_servicios, desc_productos, regalos, beneficio_cumple, extras). Permití uno o varios niveles, opcionales. UI con el diseño premium.
```

## BLOQUE 20 — Gestión de membresías (con privacidad)
```
Implementá asignar/gestionar membresías (tabla memberships): tipo 'pago' o 'regalo'. Las de regalo son confidenciales (confidencial=true): NO deben aparecer en ningún listado, informe o respuesta pública; solo las ve la dueña y esa clienta. Marcá contacts.es_premium cuando tenga una membresía activa. Respetá esta regla de privacidad en TODAS las consultas.
```

## BLOQUE 21 — Aplicar beneficios
```
Aplicá los beneficios de membresía: prioridad de reserva en la agenda para clientas premium; descuentos de servicios/productos en los precios al agendar o comprar; y que el asistente reconozca a una clienta premium para darle sus beneficios y, si el plan es público, pueda ofrecer la membresía.
```

## BLOQUE 22 — Cobro de membresía (MercadoPago)
```
Cuando MercadoPago esté conectado, implementá el cobro recurrente de la membresía de pago (suscripción/preapproval), guardando memberships.mp_preapproval_id y actualizando el estado según los webhooks de MP.
```

---

# Bloques competitivos (inspirados en Botwoot) — fase de mercado
## BLOQUE 23 — Team Inbox / multi-agente
```
Agregá a /conversaciones modo multi-agente: asignar una conversación a un agente, notas internas privadas, y estados (abierta/pendiente/resuelta). Roles: dueña, recepción, agencia.
```
## BLOQUE 24 — Plantillas de mensajes reutilizables
```
Creá una biblioteca de plantillas de mensajes por negocio (respuestas rápidas) y la gestión de plantillas de WhatsApp (las que aprueba Meta), para insertarlas con un clic en la bandeja y en campañas.
```
## BLOQUE 25 — Etiquetas personalizables
```
Permití etiquetas (tags) libres por negocio sobre contactos y conversaciones, además de las etapas del embudo. Filtros por etiqueta en CRM y campañas.
```
## BLOQUE 26 — Disparadores por evento
```
Implementá automatizaciones por evento: no-show (turno marcado ausente → mensaje de recuperación), post-servicio (pedir reseña), recompra (según services.recompra_dias). Usá la capa de envío seguro.
```
## BLOQUE 27 — Auditoría y 2FA
```
Agregá un registro de auditoría (quién hizo qué y cuándo) y autenticación de dos factores (2FA) en el login. Reforzá RLS y validación de webhooks.
```
## BLOQUE 28 (fase 2) — Constructor de flujos + integraciones
```
Constructor visual de flujos no-code para ajustar el bot, y conectores/API: webhooks salientes, Zapier/Make, Google Sheets. Documentá la API REST.
```
## BLOQUE 29 (fase 3) — White-label + app móvil
```
White-label (marca propia por agencia/negocio, dominio propio) y PWA instalable en el celular.
```

## BLOQUE 30 — Historias automáticas de IG/FB + semáforo de salud
```
1) Publicación de Historias (Stories) de Instagram y Facebook desde el módulo de contenido, con aprobación 1-clic del cliente: usar la Content Publishing API (IG: media_type=STORIES para imagen/video; FB Page stories). Respetar el límite ~25 publicaciones/24h.
2) Semáforo de salud de cuentas: leer de WhatsApp quality_rating y nivel de límite (y los webhooks phone_number_quality_update / account_update), y de IG/FB los headers X-Business-Use-Case-Usage / X-App-Usage. Mostrar verde/amarillo/rojo y % de uso por cuenta, y regular envíos/campañas/anuncios según el margen (subir si hay cupo, frenar si está cerca). Integrar con la capa de envío seguro del Bloque 17. Ver SALUD_CUENTAS_META.md.
```
