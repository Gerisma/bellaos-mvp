# Salud de cuentas y números (Meta/WhatsApp) — saber si están "calientes" y subir de límite sin baneos

Basado en la documentación oficial de Meta (WhatsApp messaging-limits, account quality, Graph API rate-limit headers). Resumen accionable para BellaOS.

## A. WhatsApp — ¿el número está sano/"caliente"?
**Sí, Meta lo expone oficialmente. Dos vías:**
1. **WhatsApp Manager (panel de Meta):** muestra la **calidad** del número y su **nivel de mensajería**.
2. **Por la API (lo que usa BellaOS):**
   - `GET /{phone-number-id}?fields=quality_rating,messaging_limit_tier`
     - `quality_rating`: **GREEN** (sana) · **YELLOW** (en observación) · **RED** (en riesgo) · UNKNOWN.
     - nivel de límite (campo histórico `messaging_limit_tier`; Meta lo está migrando a un campo nuevo de "messaging limit"): te dice cuántos **contactos únicos por 24 h** podés iniciar.
   - **Webhooks proactivos:** Meta avisa solo cuando cambia la calidad o el nivel — eventos `phone_number_quality_update` y `account_update`. Así BellaOS se entera **antes** de que sea un problema.

### Niveles (business-initiated) y cómo progresar SIN perder envíos
- Nuevo sin verificar: **250** contactos/24 h → con **verificación del negocio** saltás a **1.000** → **10.000** → **100.000** → **ilimitado**.
- **Para subir:** usá al menos el **50% de tu límite actual en 7 días** manteniendo calidad **alta**. Meta revisa cada ~6 h y sube solo.
- Desde **oct-2025** los límites son **por portfolio** (todos tus números comparten el cupo).
- **RED** bloquea la subida de nivel (pero ya no baja de nivel automáticamente si no hay infracciones de política).

### Dato clave para NO perder publicidad
- El **límite por nivel afecta solo a los mensajes que vos iniciás** (plantillas/campañas).
- **Responder** a quien te escribió (incluidos los leads de los anuncios click-to-WhatsApp) es **ilimitado** y **gratis** dentro de las 24 h. → Tus **anuncios y la atención NO se ven afectados por el nivel**; solo se limitan las campañas masivas. Por eso podés pautar tranquilo y, si una campaña masiva no entra hoy, se reparte en tandas.

### Cómo evitar baneos
- Plantillas **aprobadas**, **opt-out** siempre respetado, no comprar listas frías, mensajes relevantes, y **warm-up** gradual. Mantener verde la calidad.

## B. Instagram / Facebook — salud y límites en vivo
- **Account Quality** (panel de Meta Business) muestra el estado de la Página/cuenta y restricciones.
- **Por la API:** cada respuesta de la Graph API trae headers de uso:
  - `X-Business-Use-Case-Usage` (por business: `call_count`, `total_cputime`, `total_time`, y `estimated_time_to_regain_access` si te frenaron).
  - `X-App-Usage` y `X-Ad-Account-Usage`.
  - BellaOS lee el **% consumido** y, si se acerca a 100, **frena/reparte**; si hay margen, **sube** el ritmo.
- Límites prácticos: IG DMs automáticos ~200/h, respuestas a comentarios ~750/h/Página, ventana 24 h; publicar ~25/día.

## C. Qué construye BellaOS con esto (sumar al Bloque 17)
- **Semáforo por cuenta** en el panel: verde/amarillo/rojo (WhatsApp) y % de uso (IG/FB), leídos de la API/headers + webhooks de calidad.
- **Regulador automático:** antes de cada envío/campaña, chequea cupo y calidad → manda hasta el cupo seguro, reparte el resto, y **sugiere subir o bajar** anuncios/campañas según el margen.
- **Warm-up** de números nuevos con escalado gradual.
