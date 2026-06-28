# Primera sesión en Claude Code — arranque

## 1. Abrir
En la ventana negra (cmd):
```
cd C:\Users\Gerardo\Documents\bellaos-mvp
claude
```
(La primera vez instalá: `npm install -g @anthropic-ai/claude-code`, y al abrir, iniciá sesión.)

## 2. Pegá estos 3 pedidos, de a uno, esperando que termine cada uno

**A) Que compile y quede versionado:**
```
Inicializá git si no está y hacé el primer commit con todo. Después corré npm run build y, si hay errores, arreglalos uno por uno sin cambiar funcionalidad hasta que compile limpio. Commiteá al final.
```

**B) Auditoría (modo auditor):**
```
Leé CLAUDE.md. Actuá como auditor senior: revisá bugs, seguridad (claves, RLS por tenant, firma del webhook de WhatsApp, uso de service_role), manejo de errores y estados de la UI, y buenas prácticas de Next.js. Escribí un informe priorizado (Crítico/Alto/Medio/Bajo) en AUDITORIA.md. No corrijas todavía.
```

**C) Corregir lo importante:**
```
Resolvé los puntos Críticos y Altos de AUDITORIA.md, uno por uno, corriendo npm run build después de cada arreglo y commiteando. Actualizá AUDITORIA.md marcando lo resuelto.
```

## 3. Sesión 1 terminada cuando…
- `npm run build` pasa sin errores.
- Existe AUDITORIA.md y no quedan puntos Críticos ni Altos abiertos.
- Todo commiteado en git.

## 4. Siguiente sesión
Seguí con el BLOQUE 3 en adelante de `GUIA_CLAUDE_CODE.md` (Login y multi-negocio, conversaciones, cerebro v2, WhatsApp, pagos, canales, fidelización, anuncios, pulido, tests, deploy).

## Recordá
- Una tarea por vez; probá antes de seguir.
- Las claves van en .env.local (ya está cargado Supabase). No las subas a git.
- Al cerrar cada bloque grande: "actualizá CLAUDE.md con lo que cambió".
