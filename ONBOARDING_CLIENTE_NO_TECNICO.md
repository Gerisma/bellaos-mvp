# Qué tiene que hacer el cliente (estética) — pensado para que NO sepa de tecnología

Regla: el cliente toca lo mínimo. Casi todo es "Conectar con Facebook" (una vez) y después aprobar con un clic. Vos (ConectaIA Pro) hacés el resto.

## 1. Conexiones que el cliente autoriza UNA sola vez (con tu ayuda)
Son flujos de "iniciar sesión y dar permiso" (OAuth), sin instalar nada:
1. **WhatsApp:** botón "Conectar WhatsApp" → Embedded Signup de Meta → elige/crea su número de WhatsApp Business y da permiso. (Si ya tiene número, se migra.)
2. **Instagram + Facebook:** botón "Conectar con Facebook" → inicia sesión → autoriza su Página de Facebook y su Instagram Business (mensajes, comentarios y publicación).
3. **Anuncios:** autoriza su cuenta publicitaria (para que puedas crear y publicar anuncios por él).
4. **Pagos (MercadoPago):** conecta su cuenta para cobrar señas/membresías (cuando se active).

Cada uno es un botón → login → "Aceptar". Nada de código ni claves a mano.

## 2. El flujo de trabajo del día a día (todo con clics)
1. **Vos** preparás propuestas de anuncios y de contenido en BellaOS.
2. **El cliente** entra, ve las propuestas (texto + imagen + a qué red va).
3. Da el **OK con un clic** → "Aprobar".
4. Con otro clic, **autoriza la publicación** → BellaOS la **sube directo** a Instagram/Facebook (y programa o publica) y activa el anuncio en Meta.
   - Técnicamente: BellaOS usa la **API de publicación de contenido** (IG/FB) y la **Marketing API** (anuncios) con los permisos que el cliente ya autorizó. El cliente no ve nada de esto: solo aprueba.

## 3. WhatsApp y los "estados" (importante, dato verificado)
- **No se pueden automatizar los Estados de WhatsApp por la vía oficial.** La Cloud API de Meta **no tiene** un endpoint para publicar Estados; solo permite enviar mensajes/plantillas y responder. (Hay librerías no oficiales, pero **arriesgan el baneo** del número: no se usan en un producto serio.)
- Qué SÍ se puede en WhatsApp: responder 24/7, agendar, recordatorios y **difusiones/campañas** con plantillas aprobadas.
- Alternativa para "estados": BellaOS puede **recordarle a la dueña** que suba un estado (con el texto/imagen ya listos), o enfocar la publicación automática en **Historias de Instagram/Facebook**, que SÍ tienen API.

## 4. Qué hacés vos vs. qué hace el cliente
| Tarea | Cliente | Vos (ConectaIA) | Automático (BellaOS) |
| :-- | :-: | :-: | :-: |
| Conectar WhatsApp/IG/FB/Ads/MP | ✅ (1 clic c/u) | acompañás | — |
| Crear propuestas de anuncios/contenido | — | ✅ | asistido por IA |
| Aprobar y autorizar publicación | ✅ (1 clic) | — | — |
| Publicar en IG/FB + activar anuncio | — | — | ✅ |
| Atender, agendar, reactivar | — | — | ✅ |
| Subir Estado de WhatsApp | ✅ (manual) | recordatorio | (no API) |
