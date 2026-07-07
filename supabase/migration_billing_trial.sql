-- Migración: prueba de 15 días con tarjeta guardada, suscripción mensual
-- automática al confirmar, cuentas "cortesía" con seguimiento de consumo,
-- panel admin multi-negocio y logo personalizado por negocio.
-- Aditiva y segura (solo agrega columnas nullable / con default, no toca
-- filas existentes salvo el backfill explícito de más abajo).

alter table tenants add column if not exists billing_status text not null default 'trial';
-- valores: 'trial' (prueba activa) | 'bloqueado' (prueba vencida, sin confirmar)
-- | 'activo' (suscripción mensual corriendo) | 'cortesia' (gratis, nunca se
-- bloquea, se factura a mano) | 'cancelado'.

alter table tenants add column if not exists trial_ends_at timestamptz;
alter table tenants add column if not exists mp_customer_id text;
alter table tenants add column if not exists mp_card_id text;
alter table tenants add column if not exists mp_card_last4 text;
alter table tenants add column if not exists mp_card_brand text;
alter table tenants add column if not exists mp_preapproval_id text;
alter table tenants add column if not exists precio_mensual numeric;
alter table tenants add column if not exists logo_url text;

alter table profiles add column if not exists is_platform_admin boolean not null default false;

-- Backfill: los negocios que ya existían ANTES de este sistema de prueba no
-- se tienen que bloquear retroactivamente. Quedan como "activo" (curso
-- normal, cobro manual como hasta ahora).
update tenants set billing_status = 'activo' where trial_ends_at is null;

-- Bucket público de Storage para los logos de cada negocio (solo lectura
-- pública; la escritura queda restringida por política a service_role, ya
-- que el upload lo hace la ruta de servidor, no el cliente directo).
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;
