# Plan maestro — terminar BellaOS en Claude Code (paso a paso exacto)

Cómo usarlo: hacé los pasos **en orden**. En cada uno te digo (a) qué preparás vos, (b) el prompt para pegar en Claude Code, (c) cómo verificar. Los textos largos de cada "Bloque N" están en `GUIA_CLAUDE_CODE.md`, listos para copiar. No pases al siguiente hasta que el actual funcione.

## Regla base
- Una tarea por vez · verificá con `npm run build` y `npm run dev` · commiteá con git después de cada bloque OK · las claves van en `.env.local` (no a git).

---

## FASE 0 — Abrir Claude Code
- Instalar (una vez): `npm install -g @anthropic-ai/claude-code`
- `cd C:\Users\Gerardo\Documents\bellaos-mvp` → `claude` → iniciá sesión.
- Claude Code lee `CLAUDE.md` solo.

## FASE 1 — Estabilizar (no necesita cuentas)
1. Pegá **Bloque 0** (git + que compile). Verificar: `npm run build` sin errores.
2. Pegá **Bloque 1** (auditoría → AUDITORIA.md). Verificar: existe AUDITORIA.md.
3. Pegá **Bloque 2** (corregir Críticos/Altos). Verificar: build OK, sin Críticos abiertos.

## FASE 2 — Fundaciones (login + datos)
4. Pegá **Bloque 3** (login + RLS por tenant). Verificar: te registrás, entrás y solo ves tu negocio.
5. Pegá **Bloque 4** (guardar conversaciones + bandeja). Verificar: /conversaciones lista chats.
6. Pegá **Bloque 27** (auditoría interna + 2FA). Verificar: 2FA en el login.

## FASE 3 — Cerebro con IA
7. **Preparás vos:** creá cuenta en openrouter.ai → sacá una API key. Pegá en `.env.local` `OPENROUTER_API_KEY=...`.
   Prompt: "Verificá que el asistente responda con LLM ahora que cargué OPENROUTER_API_KEY; si no, arreglá la integración."
8. Pegá **Bloque 5** (cerebro v2 + pgvector + FAQs). Verificar: el probador responde mejor y usa el conocimiento cargado.

## FASE 4 — WhatsApp real
9. **Preparás vos:** elegí camino (BSP rápido tipo 360dialog/Twilio, o Cloud API directa — ver CONEXION_WHATSAPP_BSP.md). Conseguí `WHATSAPP_TOKEN` y `WHATSAPP_PHONE_ID`, ponelos en `.env.local`.
10. Pegá **Bloque 6** (HMAC + envío + plantillas + WHATSAPP.md). Verificar: mandás un WhatsApp de prueba y el bot responde.
11. Pegá **Bloque 7** (agenda v2: agenda sola + seña). Verificar: el bot agenda un turno desde el chat.

## FASE 5 — Pagos
12. **Preparás vos:** cuenta MercadoPago → `MP_ACCESS_TOKEN` en `.env.local`.
13. Pegá **Bloque 8** (cobros: abono + señas + webhook MP). Verificar: generás un link de pago y se confirma.

## FASE 6 — Configuración + features del negocio
14. Pegá **Bloque 15** (pantalla de configuración: incentivo, recordatorios, productos, límite). 
15. Pegá **Bloque 16** (recordatorios condicionales: estética + clienta).
16. Pegá **Bloque 17** (capa de envío seguro + warm-up).
17. Pegá **Bloque 18** (catálogo de productos).
18. Pegá **Bloque 19** (planes de membresía).
19. Pegá **Bloque 20** (gestión de membresías con confidencialidad).
20. Pegá **Bloque 21** (aplicar beneficios en agenda y precios).
21. Pegá **Bloque 22** (cobro de membresía por MercadoPago).
Verificar al final: creás un plan, asignás una membresía de regalo y NO aparece en listados públicos.

## FASE 7 — Más canales
22. **Preparás vos:** conectás Página de Facebook + Instagram Business (permisos). 
23. Pegá **Bloque 9** (Instagram + Facebook + chat web + comentarios). Verificar: un DM de IG entra a la bandeja.
24. Pegá **Bloque 30** (Historias IG/FB automáticas + semáforo de salud de cuentas). Verificar: publicás una Historia con aprobación 1-clic y ves el semáforo verde/amarillo/rojo.

## FASE 8 — Fidelización y anuncios
25. Pegá **Bloque 26** (disparadores: no-show, post-servicio, recompra).
26. Pegá **Bloque 10** (recompra inteligente, referidos, reseñas Google, opt-out).
27. Pegá **Bloque 11** (anuncios + Píxel + Conversions API + costo por turno).

## FASE 9 — Operación tipo plataforma
28. Pegá **Bloque 23** (team inbox / multi-agente).
29. Pegá **Bloque 24** (plantillas reutilizables + plantillas WhatsApp).
30. Pegá **Bloque 25** (etiquetas personalizables).

## FASE 10 — Pulido, tests y salir a internet
31. Pegá **Bloque 12** (pulido UX: estados de carga/vacío/error, responsive, diseño premium).
32. Pegá **Bloque 13** (tests básicos + npm test).
33. **Preparás vos:** cuenta en Vercel. Pegá **Bloque 14** (deploy + variables + cron + DEPLOY.md + checklist seguridad). Verificar: la app online en una URL, con login y datos.

## FASE 11 — Fase 2/3 (cuando ya esté vendiendo)
34. Pegá **Bloque 28** (constructor de flujos no-code + integraciones/API).
35. Pegá **Bloque 29** (white-label + app móvil/PWA).

---

## Checklist "terminado"
- [ ] Online en Vercel con dominio, login real, RLS por tenant.
- [ ] Asistente responde y agenda en WhatsApp real (+ IG/FB/web + Historias).
- [ ] Reactivador, recompra, referidos, reseñas, membresías OK.
- [ ] Pagos (abono + señas + membresía) OK.
- [ ] Semáforo de salud de cuentas + envío seguro/warm-up.
- [ ] Informes con datos reales. Auditoría sin Críticos/Altos. Backups activos.

## Recordatorio
Al cerrar cada fase grande: "actualizá CLAUDE.md con lo que cambió". Y guardá las claves solo en `.env.local`.
