# OmniRoute — análisis (github.com/diegosouzapw/OmniRoute)

## Qué es
Un **gateway de IA local y open-source (MIT)**: un solo endpoint (OpenAI-compatible, localhost:20128/v1) que conecta tus herramientas a **231 proveedores de IA (50+ gratis, 11 gratis para siempre)**, con:
- **Auto-fallback** entre proveedores (si uno se queda sin cuota, sigue otro → cero caídas).
- **Compresión de tokens** (RTK + Caveman) que ahorra **15–95%** → baja costo.
- **Routing por costo** (elige el modelo más barato que funcione).
- CLI + MCP + A2A. Corre en npm/Docker/escritorio/Termux/PWA. Privado y local.

## ¿Te conviene? Sí, pero para dos usos distintos
1. **Para DESARROLLO (Claude Code, Cursor, etc.):** muy útil para **bajar tu costo de programar** — enrutás tus herramientas a modelos gratis/baratos con fallback y compresión. Recomendado para tu trabajo diario de construcción.
   - Aviso honesto: muchos "gratis" son free-tiers con límites y calidad variable; para tareas críticas conviene un modelo bueno. Úsalo para ahorrar, no para todo.
2. **Para PRODUCCIÓN (el cerebro de BellaOS):** es OpenAI-compatible, así que BellaOS **podría** apuntar sus llamadas de IA a un OmniRoute self-hosted en vez de OpenRouter, ahorrando con compresión + routing barato + fallback. **Pero** para un SaaS con clientes pagos prioriza la **fiabilidad**: implica self-hostearlo en un VPS y mantenerlo. Hoy el costo de IA de BellaOS ya es de centavos por conversación.

## Recomendación
- **Dev (ya):** probalo para tus sesiones de Claude Code y bajar costos. (npm install -g omniroute → omniroute → apuntás Claude Code a localhost:20128/v1).
- **Producción (después):** seguí con OpenRouter por simplicidad/fiabilidad ahora; evaluá OmniRoute (o LiteLLM) como gateway self-hosted cuando el volumen justifique optimizar costo de IA.

## ¿Hay algo mejor?
- **OpenRouter** (lo que usás): el más simple para producción. 
- **LiteLLM** (open-source): gateway muy usado, más orientado a producción/observabilidad — buena alternativa self-hosted.
- **Portkey / Cloudflare AI Gateway**: gateways gestionados con métricas, caché y guardrails (menos mantenimiento que self-host).
- OmniRoute brilla en **maximizar gratis + compresión** (ideal dev); LiteLLM/Portkey brillan en **producción**.
