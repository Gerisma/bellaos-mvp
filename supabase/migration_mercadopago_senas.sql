-- Migración: cobro de señas de turnos por MercadoPago.
-- Aditiva y segura (solo agrega columnas nullable, no toca datos existentes).
-- Correr en el SQL Editor de Supabase (proyecto BellaOS, kcslhhupssvetmbigorl)
-- o pedirle a Claude Code que la aplique con autorización explícita.

alter table tenants add column if not exists mp_access_token text;
-- Token de MercadoPago del propio negocio (Checkout Pro/Preapproval). Si es
-- null, el cobro cae al MP_ACCESS_TOKEN global de la plataforma (mismo
-- patrón que whatsapp_phone_id/whatsapp_token).

alter table appointments add column if not exists mp_payment_id text;
-- ID del pago en MercadoPago que confirmó la seña (idempotencia del webhook).

alter table appointments add column if not exists sena_monto numeric;
-- Monto de la seña cobrada (puede diferir del precio total del servicio).
