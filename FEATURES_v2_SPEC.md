# BellaOS — Especificación de features v2 (membresía, incentivos, recordatorios, límites)

Estado: **base de datos ya creada** (migración `membership_incentivos_limites` aplicada en Supabase). Falta la **lógica/UI**, a construir en Claude Code. Esta spec define el comportamiento exacto.

---

## A. Incentivo configurable (descuento o regalo)
Cada negocio configura un incentivo **opcional**, guardado en `tenants.incentivo` (jsonb):
```
{ "tipo": "descuento" | "regalo" | "ninguno",
  "valor": 15,                 // % si es descuento
  "servicio": "Lifting",       // si es regalo (uno de sus services)
  "contextos": ["reactivacion","cumpleanos","recompra","promo_global"] }
```
- El asistente lo incluye en los mensajes de los contextos activados.
- Todo opcional: la estética activa qué es y dónde aplica.

## B. Recordatorios 24 h / 2 h (modalidad "ambas")
- La estética habilita cada uno: `tenants.recordatorio_24h_on`, `tenants.recordatorio_2h_on`.
- La clienta confirma su preferencia: `contacts.recordatorios_pref` (true/false). Al agendar, se le pregunta una vez.
- El cron `/api/cron/recordatorios` envía solo si: el recordatorio está habilitado por la estética **Y** la clienta lo aceptó. Así la estética ahorra costo si lo apaga.

## C. Límites anti-bloqueo (modalidad "mixto")
Capa de "envío seguro" que respeta los límites reales de Meta y permite override manual.
**WhatsApp (business-initiated):** nuevo número arranca ~250 contactos/24 h y sube por niveles (1.000 → 10.000 → 100.000 → ilimitado) según calidad/volumen; los límites son por portfolio; responder a la clienta es ilimitado.
**Instagram:** DMs automáticos ~200/hora; respuestas privadas a comentarios ~750/hora; ventana de 24 h.
**Facebook/Instagram publicar:** ~25 posts/día, ~20 min entre posts.
**Implementación:**
- Tabla/contador diario de envíos por negocio y canal (puede reusarse `usage_metrics` o una tabla `send_log`).
- Antes de enviar, chequear el cupo del día. Repartir campañas en **tandas a lo largo del día**.
- **Warm-up** para números nuevos: empezar bajo y subir gradualmente (ej. 50 → 100 → 250 → …) si la calidad se mantiene.
- **Override manual**: `tenants.limite_diario_wa` (si está, manda hasta ese tope). Si es null, automático.
- Respetar opt-out y la ventana de 24 h siempre.

## D. Membresía premium (módulo nuevo)
La estética puede ofrecer una **membresía** a sus clientas con beneficios configurables.

### Tablas (ya creadas)
- `membership_plans` (por negocio, 1..N niveles): `nombre`, `nivel`, `precio_mensual`, `publico`, `activo`, `beneficios` (jsonb).
- `memberships` (por clienta): `plan_id`, `tipo` (pago|regalo), `estado`, `confidencial`, `inicio`, `vence`, `mp_preapproval_id`.
- `products` (catálogo opcional): `nombre`, `precio`, `stock`, `activo`. Se habilita con `tenants.productos_activos`.
- `contacts.es_premium` (atajo para saber si la clienta tiene membresía activa).

### Modalidades (ambas, opcionales, las configura la estética)
1. **Pago:** suscripción mensual que la clienta paga a la estética. Si `membership_plans.publico = true`, se ofrece a todas. Cobro por **MercadoPago** (suscripción/preapproval → `mp_preapproval_id`). Pendiente: conectar MP.
2. **Regalo:** la estética asigna la membresía gratis a una clienta. **Confidencial**: `memberships.confidencial = true` → NO se muestra en vistas públicas ni se difunde; solo la estética y esa clienta la ven. (En toda consulta pública, excluir `confidencial = true`.)

### Beneficios (en `membership_plans.beneficios`, todos opcionales, la estética agrega/quita)
```
{ "prioridad_reserva": true,
  "desc_servicios": 15,        // %
  "desc_productos": 10,        // %
  "regalos": ["Producto X"],   // productos de regalo
  "beneficio_cumple": "Servicio gratis en el cumple",
  "extras": ["texto libre que la estética quiera sumar"] }
```
- **Prioridad de reserva:** las clientas premium ven/acceden a horarios antes (o tienen cupos reservados).
- **Descuentos** en servicios y productos: se aplican en el precio al agendar/comprar.
- **Regalos** de productos y **beneficio de cumpleaños**.
- **Extras** libres que la estética decida.

### Niveles (mixto, opcional)
- Puede haber **un** plan o **varios** (Plata/Oro/VIP), cada uno con su precio y beneficios. Activar varios es opcional.

### Privacidad (regla dura)
- Las membresías `confidencial = true` (regalos) nunca aparecen en listados generales, informes públicos ni se mencionan a terceros. Solo visibles para la estética (dueña) y la clienta titular.

### Dónde se aplica
- **Agenda:** prioridad de reserva para premium.
- **Precios/checkout:** aplicar descuentos de servicios/productos.
- **Asistente:** puede ofrecer la membresía (si es pública) y reconocer a una clienta premium para darle sus beneficios.
- **Informes:** cantidad de socias, ingresos por membresías (sin exponer las confidenciales individualmente).

---

## Bloques sugeridos para Claude Code (en este orden)
1. **Config del negocio:** pantalla de ajustes con incentivo, toggles de recordatorios, productos on/off y override de límite diario. (A, B, C parte UI)
2. **Recordatorios condicionales:** que el cron respete estética + preferencia de la clienta. (B)
3. **Capa de envío seguro + warm-up + contador diario.** (C)
4. **Catálogo de productos** (si `productos_activos`). (D)
5. **Planes de membresía:** ABM de planes con beneficios (jsonb). (D)
6. **Asignar/gestionar membresías** (pago y regalo confidencial), con la regla de privacidad. (D)
7. **Aplicar beneficios** en agenda (prioridad) y en precios (descuentos). (D)
8. **Cobro de membresía por MercadoPago** (suscripción) — cuando MP esté conectado. (D)
