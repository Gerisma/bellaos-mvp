-- Migración: Conexiones (WhatsApp/IG/FB/notificaciones/Google Calendar),
-- Tienda (productos tangibles + carrito + pedidos) y catálogo de servicios
-- ampliado (categoría/sub-categoría/tiempos de reserva y limpieza).
-- Aditiva y segura: solo agrega columnas nullable/con default y tablas nuevas,
-- no toca filas existentes.

-- 1) Conexiones ------------------------------------------------------------
alter table tenants add column if not exists slug text unique;
-- Identificador público para la URL de la tienda (/tienda/<slug>). Se
-- completa con el backfill de más abajo para los negocios existentes.
alter table tenants add column if not exists notif_whatsapp_telefono text;
-- Número de WhatsApp de la DUEÑA (no de la clienta) donde quiere recibir
-- avisos internos (turno nuevo, handoff a humano, etc.). Reusa el mismo
-- envío de WhatsApp que ya usa el asistente, sin credenciales nuevas.
alter table tenants add column if not exists notif_email text;
-- Email para notificaciones. Guardado ya, el envío real depende de
-- configurar un proveedor de email (pendiente, ver TAREAS_PENDIENTES.md).
alter table tenants add column if not exists google_calendar_id text;
alter table tenants add column if not exists google_refresh_token text;
alter table tenants add column if not exists google_calendar_connected boolean not null default false;
alter table tenants add column if not exists fb_page_id text;
alter table tenants add column if not exists fb_page_token text;
alter table tenants add column if not exists ig_business_id text;
alter table tenants add column if not exists ig_connected boolean not null default false;

update tenants set slug = regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g') || '-' || substr(id::text, 1, 4)
  where slug is null;

-- 2) Catálogo de servicios ampliado ----------------------------------------
alter table services add column if not exists categoria text;
alter table services add column if not exists subcategoria text;
alter table services add column if not exists tiempo_limpieza_min int not null default 5;
alter table services add column if not exists tiempo_reserva_dias int not null default 30;
-- tiempo_reserva_dias: hasta cuántos días de anticipación se puede reservar
-- este servicio. tiempo_limpieza_min: minutos de limpieza/preparación que
-- ocupan la agenda después del turno (no se muestran a la clienta, se usan
-- para no chocar turnos consecutivos).

-- 3) Tienda: productos tangibles + pedidos ---------------------------------
-- La tabla products YA EXISTE (de una migración anterior no versionada en el
-- repo: membership_incentivos_limites) con tenant_id/nombre/precio/stock/
-- activo/created_at + RLS ya habilitada con policy tenant_isolation. Solo le
-- suma lo que falta para el catálogo de la tienda.
alter table products add column if not exists descripcion text;
alter table products add column if not exists imagen_url text;

create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  contact_nombre text,
  contact_telefono text,
  estado text not null default 'pendiente', -- pendiente | pagado | cancelado
  total numeric not null default 0,
  mp_payment_id text,
  mp_preference_id text,
  created_at timestamptz default now()
);
create index if not exists orders_tenant_idx on orders(tenant_id);

create table if not exists order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id),
  nombre text not null, -- copia del nombre al momento de la compra (por si el producto cambia después)
  cantidad int not null default 1,
  precio_unitario numeric not null
);

alter table orders enable row level security;
alter table order_items enable row level security;

-- products ya tiene RLS + policy tenant_isolation de antes, no se toca.
create policy tenant_isolation on orders
  using (tenant_id = (select tenant_id from profiles where id = auth.uid()))
  with check (tenant_id = (select tenant_id from profiles where id = auth.uid()));
create policy tenant_isolation_oi on order_items
  using (exists (select 1 from orders o where o.id = order_items.order_id and o.tenant_id = (select tenant_id from profiles where id = auth.uid())))
  with check (exists (select 1 from orders o where o.id = order_items.order_id and o.tenant_id = (select tenant_id from profiles where id = auth.uid())));
-- Nota: la tienda pública (clienta sin login viendo el catálogo y comprando)
-- NO usa estas políticas — pasa siempre por rutas de servidor con
-- supabaseAdmin() (service_role, bypassea RLS), igual que el webhook de
-- WhatsApp ya hace con tenants. Así nunca se expone el anon key a filas de
-- otros negocios ni a columnas sensibles (tokens, etc.) de la tabla tenants.
