# BellaOS vs Botwoot — comparación e ideas para salir al mercado
(Actualizado leyendo el sitio renderizado, jun-2026.)

## Qué es Botwoot
**Plataforma de comunicación omnicanal horizontal** (cualquier rubro), respaldada por Arango International Holdings. Posicionamiento: "automatizá WhatsApp/IG/FB con IA, sin código". Es **BSP oficial de Meta** (API Cloud) y lo usa como argumento central: "cero riesgo de bloqueos". Apunta a **corporaciones, agencias, e-commerce y startups**.

## Funciones que ofrece (reales del sitio)
- **Editor de flujos drag & drop** (no-code) — su bandera.
- **IA nativa + entrenamiento con PDFs** (subís docs y el bot aprende) + Agentes/Asistentes IA configurables.
- **Team Inbox** (bandeja colaborativa en tiempo real, varios agentes).
- **Bandeja de comentarios** de redes (IG/FB).
- **Difusiones / broadcasts** (envíos masivos).
- **Contactos / CRM**, **Historial**, **Dashboard / Analytics Pro**.
- **Módulo de Ventas / e-commerce** (recuperación de carritos, tracking).
- **Soporte / tickets**, **Auditoría** (log de trazabilidad), **Facturación** (planes y pagos).
- **Eventos** (webhooks entrantes / automatización por eventos), **Webhooks/API REST salientes**.
- **Integraciones premium** (OpenAI, Google Sheets, Zapier, Make).
- **White-label / branding**, **dominios personalizados**, **app iOS/Android**, **2FA**, **SLA** (99.5–99.95%).

## Precios (en EUR, caros y por "ejecuciones de flujo")
- Free: €4 (tasa única) · 100 conv/mes · 30 días retención.
- Starter: **€49/mes** · 150K ejecuciones · SLA 99.5%.
- Pro (popular): **€99/mes** · conv. ilimitadas · 200 simultáneas · 100 flujos · 1.5M ejecuciones · dominios propios.
- Business: **€299/mes** · 1000 simultáneas · 500 flujos · 15M ejecuciones · white-label.

## Comparación directa
| Tema | Botwoot | BellaOS |
| :-- | :-- | :-- |
| Enfoque | Horizontal (caja de herramientas para cualquiera) | **Vertical estética/bienestar (pensado y calibrado)** |
| A quién le habla | Corporaciones, agencias, e-commerce, devs | **Dueña de estética** (no técnica) |
| Bot | Vos armás los flujos (no-code) | **Cerebro ya listo del rubro** + reglas/LLM |
| Agenda con seña | No (es genérico) | **Sí** |
| Reactivador / recompra | Difusiones genéricas | **Reactivador + recompra inteligente del rubro** |
| Membresías premium | No | **Sí (con confidencialidad)** |
| Multi-canal | Sí | Sí (WhatsApp + IG/FB/web) |
| Team inbox / multi-agente | **Sí** | Pendiente (recomendado) |
| Plantillas / API / integraciones | **Sí** | Pendiente (fase 2) |
| White-label (agencias) | **Sí** | Pendiente (fase 3) |
| BSP oficial de Meta | **Sí** (anti-bloqueo) | A definir (ir por BSP confiable) |
| Precio | €49–299/mes | **USD 39–89/mes (más barato)** |

## Lecturas clave
1. **Tu ventaja es la verticalización + precio + "hecho para vos".** Botwoot te da una caja de herramientas premium y en euros; vos le das a la estética la solución armada, más barata y en su idioma. Para ese cliente, eso gana.
2. **Botwoot valida varias de nuestras ideas** (omnicanal, comentarios, IA con documentos, control anti-bloqueo). Vamos bien encaminados.
3. **El argumento "BSP oficial de Meta = cero bloqueos" es fuerte.** Conviene que BellaOS use un BSP confiable y lo comunique igual, además de la capa de warm-up/límites que ya diseñamos.

## Ideas para adoptar (priorizadas, para salir al mercado)
**Alta (cierra la brecha operativa):**
- Team Inbox / multi-agente (asignar chats, notas internas, estados).
- Plantillas de mensajes reutilizables (incluye plantillas de WhatsApp).
- Ir por un **BSP oficial de Meta** y comunicarlo como sello de confianza.

**Media (suman pronto):**
- Entrenamiento de la IA subiendo PDFs/FAQs (ya tenemos knowledge_base + pgvector previsto).
- Disparadores por evento (no-show, post-servicio, recompra) — webhooks/eventos.
- Auditoría/trazabilidad (log) y 2FA (ya en el plan de seguridad).
- Módulo de ventas de productos en el chat (ya dejamos la tabla products).

**Fase 2/3 (no bloquean el lanzamiento):**
- Constructor visual de flujos (no-code) para ajustar el bot.
- Integraciones (Zapier/Make/Sheets) + API/Webhooks salientes.
- White-label para que vos (ConectaIA Pro) o agencias revendan.
- App móvil (PWA primero).

## Para el roadmap de Claude Code (bloques 23+)
- B23 Team Inbox / multi-agente · B24 Plantillas reutilizables · B25 Etiquetas personalizables · B26 Disparadores por evento · B27 Auditoría + 2FA · B28 (fase 2) Constructor de flujos + integraciones/API · B29 (fase 3) White-label + app móvil.
