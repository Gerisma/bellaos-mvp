-- BellaOS — Esquema multi-tenant para Supabase (Postgres). Correr en el SQL Editor.
create extension if not exists "uuid-ossp";
create extension if not exists vector;

create table tenants (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  plan text not null default 'recepcion_ia',
  status text not null default 'trial',
  whatsapp_phone_id text,
  whatsapp_token text,
  created_at timestamptz default now()
);
create table brand_profiles (
  tenant_id uuid primary key references tenants(id) on delete cascade,
  tono text, diferencial text, horarios text, direccion text,
  datos jsonb default '{}', updated_at timestamptz default now()
);
create table services (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  nombre text not null, precio numeric, duracion_min int, recompra_dias int, activo boolean default true
);
create table contacts (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  nombre text, telefono text, canal text,
  stage text default 'lead_nuevo', ticket_prom numeric, ultima_visita date,
  opt_out boolean default false, created_at timestamptz default now()
);
create index on contacts(tenant_id, stage);
alter table contacts add constraint contacts_tenant_telefono_unique unique (tenant_id, telefono);
create table conversations (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  contact_id uuid references contacts(id) on delete cascade,
  canal text, estado text default 'abierta', created_at timestamptz default now()
);
create table messages (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  conversation_id uuid references conversations(id) on delete cascade,
  rol text, texto text, intent text, created_at timestamptz default now()
);
create table appointments (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  contact_id uuid references contacts(id), service_id uuid references services(id),
  inicio timestamptz not null, estado text default 'agendado',
  sena_pagada boolean default false, recordatorio_24h boolean default false, recordatorio_2h boolean default false
);
create index on appointments(tenant_id, inicio);
create table campaigns (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  nombre text, estado text default 'borrador', plantilla text, created_at timestamptz default now()
);
create table campaign_targets (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references campaigns(id) on delete cascade,
  contact_id uuid references contacts(id) on delete cascade,
  estado text default 'pendiente', enviado_at timestamptz
);
create table knowledge_base (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  pregunta text, respuesta text, embedding vector(1536)
);
create table usage_metrics (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  periodo date, mensajes_marketing int default 0, mensajes_utility int default 0, posts_generados int default 0
);

-- Perfil de usuario: vincula auth.users con un tenant. Sin auth.jwt() custom
-- claims (requerirían un Auth Hook) — el aislamiento se resuelve siempre vía
-- esta tabla y auth.uid(), que Supabase Auth siempre provee.
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid references tenants(id) on delete set null,
  email text,
  created_at timestamptz default now()
);
alter table profiles enable row level security;
create policy profiles_select_own on profiles for select using (id = auth.uid());

-- Crea el profile (sin tenant) al registrarse. tenant_id solo lo asigna el
-- server con service_role durante el alta de negocio — no hay policy de
-- update para el usuario, así nadie puede auto-asignarse un tenant ajeno.
create function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end; $$ language plpgsql security definer set search_path = public;
create trigger on_auth_user_created after insert on auth.users
  for each row execute procedure public.handle_new_user();
-- Solo la debe poder invocar el trigger, no clientes vía /rest/v1/rpc/handle_new_user.
revoke execute on function public.handle_new_user() from anon, authenticated, public;

alter table tenants enable row level security;
alter table brand_profiles enable row level security;
alter table services enable row level security;
alter table contacts enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table appointments enable row level security;
alter table campaigns enable row level security;
alter table campaign_targets enable row level security;
alter table knowledge_base enable row level security;
alter table usage_metrics enable row level security;

create policy tenants_select_own on tenants
  for select using (id = (select tenant_id from profiles where id = auth.uid()));

create policy tenant_isolation on contacts
  using (tenant_id = (select tenant_id from profiles where id = auth.uid()))
  with check (tenant_id = (select tenant_id from profiles where id = auth.uid()));
create policy tenant_isolation on brand_profiles
  using (tenant_id = (select tenant_id from profiles where id = auth.uid()))
  with check (tenant_id = (select tenant_id from profiles where id = auth.uid()));
create policy tenant_isolation on services
  using (tenant_id = (select tenant_id from profiles where id = auth.uid()))
  with check (tenant_id = (select tenant_id from profiles where id = auth.uid()));
create policy tenant_isolation on conversations
  using (tenant_id = (select tenant_id from profiles where id = auth.uid()))
  with check (tenant_id = (select tenant_id from profiles where id = auth.uid()));
create policy tenant_isolation on messages
  using (tenant_id = (select tenant_id from profiles where id = auth.uid()))
  with check (tenant_id = (select tenant_id from profiles where id = auth.uid()));
create policy tenant_isolation on appointments
  using (tenant_id = (select tenant_id from profiles where id = auth.uid()))
  with check (tenant_id = (select tenant_id from profiles where id = auth.uid()));
create policy tenant_isolation on campaigns
  using (tenant_id = (select tenant_id from profiles where id = auth.uid()))
  with check (tenant_id = (select tenant_id from profiles where id = auth.uid()));
create policy tenant_isolation_ct on campaign_targets
  using (exists (select 1 from campaigns c where c.id = campaign_targets.campaign_id and c.tenant_id = (select tenant_id from profiles where id = auth.uid())))
  with check (exists (select 1 from campaigns c where c.id = campaign_targets.campaign_id and c.tenant_id = (select tenant_id from profiles where id = auth.uid())));
create policy tenant_isolation on knowledge_base
  using (tenant_id = (select tenant_id from profiles where id = auth.uid()))
  with check (tenant_id = (select tenant_id from profiles where id = auth.uid()));
create policy tenant_isolation on usage_metrics
  using (tenant_id = (select tenant_id from profiles where id = auth.uid()))
  with check (tenant_id = (select tenant_id from profiles where id = auth.uid()));
