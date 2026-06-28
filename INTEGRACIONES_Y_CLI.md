# Integraciones y herramientas — CLI primero, API cuando no hay (para optimizar y bajar costos)

Criterio: usar **CLI** donde exista (automatiza, gratis, scriptable); donde no, **API key/SDK**. Self-host y free-tiers para reducir costos.

## Con CLI (recomendado)
| Herramienta | CLI | Para qué | Costo |
| :-- | :-- | :-- | :-- |
| Supabase | `supabase` | migraciones, tipos, local dev, backups | Free→USD25 |
| Vercel | `vercel` | deploy, env vars, logs | Free→USD20 |
| GitHub | `gh` | repos, releases, PRs, Actions | Free |
| OmniRoute | `omniroute` | gateway IA local (fallback + compresión = ahorro) | Free (MIT) |
| Doppler | `doppler` | secretos centralizados | Free |
| Cloudflared / ngrok | `cloudflared`/`ngrok` | exponer el webhook en pruebas locales | Free |
| Inngest (opcional) | `inngest-cli` | jobs/colas en dev | Free al inicio |
| Stripe (si se usa) | `stripe` | pagos/test webhooks | por uso |

## Sin CLI oficial → API key / SDK
| Servicio | Cómo | Para qué |
| :-- | :-- | :-- |
| WhatsApp Cloud API (Meta) | Graph API + token | enviar/recibir WhatsApp |
| Instagram / Facebook | Graph API + page token (OAuth) | DMs, comentarios, publicar |
| Meta Marketing API | API + permiso de ad account | crear/medir anuncios |
| MercadoPago | SDK/API + access token | señas, abonos, membresías |
| OpenRouter | API key | LLM del asistente |
| Pinecone (opcional) | API key | (no necesario: usamos pgvector en Supabase) |

## Para reducir costos
- **LLM:** modelo económico por defecto + tope de tokens; evaluar **OmniRoute/LiteLLM** (compresión + routing barato) cuando crezca el volumen.
- **Vectores:** **pgvector en Supabase** (no pagar Pinecone).
- **Colas:** cron de Vercel al inicio (no pagar Inngest hasta que haga falta).
- **WhatsApp:** Cloud API directa (sin margen de BSP) cuando convenga; mensajes "service" (responder) son gratis; el costo es el marketing → control de tope/excedente ya implementado.
- **Infra:** todo en free-tier al arranque (~USD 0–45/mes).
