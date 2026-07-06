-- Migración: onboarding self-service de WhatsApp (Embedded Signup).
-- Aditiva y segura (solo agrega una columna nullable).
-- Correr en el SQL Editor de Supabase (proyecto BellaOS, kcslhhupssvetmbigorl)
-- o pedirle a Claude Code que la aplique con autorización explícita.

alter table tenants add column if not exists waba_id text;
-- ID de la WhatsApp Business Account del cliente, devuelto por el Embedded
-- Signup. Se usa para suscribir la WABA a los webhooks de la app
-- (POST /{waba_id}/subscribed_apps). whatsapp_phone_id sigue siendo el
-- Phone Number ID (ya existía), que identifica el número puntual.
