-- ============================================================
-- Ana Hagen DJ — Supabase Schema Setup
-- Pegar y ejecutar completo en: Supabase > SQL Editor > New query
-- ============================================================

-- ==================== TABLAS ====================

create table if not exists events (
  id          uuid primary key default gen_random_uuid(),
  date        date not null,
  venue       text not null,
  city        text not null,
  ticket_link text,
  flyer_url   text,
  published   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists booking_requests (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  event_type  text not null,
  event_date  date,
  message     text not null,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  confirmed   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists hero_config (
  id          int primary key default 1,
  media_type  text not null default 'video' check (media_type in ('video', 'image')),
  media_url   text not null default '',
  updated_at  timestamptz not null default now()
);

-- Fila inicial del hero (siempre es la fila id=1)
insert into hero_config (id, media_type, media_url)
values (1, 'video', '')
on conflict (id) do nothing;


-- ==================== ROW LEVEL SECURITY ====================

alter table events enable row level security;
alter table booking_requests enable row level security;
alter table subscribers enable row level security;
alter table hero_config enable row level security;

-- Events: lectura pública (solo publicados), admin todo
create policy "public read published events"
  on events for select
  using (published = true);

create policy "admin full access events"
  on events for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Booking requests: insert público, leer/actualizar solo admin
create policy "public insert booking"
  on booking_requests for insert
  with check (true);

create policy "admin read bookings"
  on booking_requests for select
  using (auth.role() = 'authenticated');

create policy "admin update bookings"
  on booking_requests for update
  using (auth.role() = 'authenticated');

-- Subscribers: insert público, leer solo admin
create policy "public subscribe"
  on subscribers for insert
  with check (true);

create policy "admin read subscribers"
  on subscribers for select
  using (auth.role() = 'authenticated');

-- Hero config: lectura pública, actualizar solo admin
create policy "public read hero"
  on hero_config for select
  using (true);

create policy "admin update hero"
  on hero_config for update
  using (auth.role() = 'authenticated');


-- ==================== STORAGE ====================
-- Crear buckets públicos para hero y flyers

insert into storage.buckets (id, name, public)
values
  ('hero', 'hero', true),
  ('flyers', 'flyers', true)
on conflict (id) do nothing;

-- Policies de storage: lectura pública, upload solo autenticados

create policy "public read hero"
  on storage.objects for select
  using (bucket_id = 'hero');

create policy "admin upload hero"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'hero');

create policy "admin update hero"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'hero');

create policy "admin delete hero"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'hero');

create policy "public read flyers"
  on storage.objects for select
  using (bucket_id = 'flyers');

create policy "admin upload flyers"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'flyers');

create policy "admin update flyers"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'flyers');

create policy "admin delete flyers"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'flyers');
