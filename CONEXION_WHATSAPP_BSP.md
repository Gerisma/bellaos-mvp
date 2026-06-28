# WhatsApp: BSP vs Cloud API directa (decisión documentada)

## Verificado (jun-2026)
- **No estás obligado a un BSP.** Meta ofrece la **Cloud API directa** (alojada por Meta): te conectás vos, sin intermediario. La Cloud API es gratis; solo le pagás a Meta las conversaciones.
- Un **BSP / Tech Provider** (socio certificado de Meta) agrega onboarding fácil, panel, soporte y cumplimiento, a cambio de un costo extra.
- "Directo" es *bare metal*: vos manejás webhook, plantillas, límites, políticas y mantenimiento — que es justo lo que **BellaOS ya hace**.

## Recomendación
- **Arrancar con un BSP confiable** (alta rápida, menos fricción): ej. 360dialog, Twilio, Gupshup, Meta Tech Providers locales.
- **Migrar a Cloud API directa** cuando convenga por costo/control. La arquitectura con "adapter" de BellaOS permite cambiar sin reescribir.
- Ningún proveedor garantiza "cero bloqueos": depende del buen uso (plantillas aprobadas, opt-out, warm-up, no spam) — lo cubre nuestra capa de envío seguro.

## Pros/contras
| | BSP | Cloud API directa |
| :-- | :-- | :-- |
| Alta | Rápida, asistida | Vos la hacés |
| Costo | Meta + margen del BSP | Solo Meta (más barato) |
| Control | Menor | Total |
| Mantenimiento | Lo hace el BSP | Tuyo (ya lo tenés en BellaOS) |
| Ideal para | Arrancar / validar | Escala / bajar costos |
