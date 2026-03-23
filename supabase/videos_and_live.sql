-- ============================================================
-- Ana Hagen DJ — Galería de videos + Live streaming
-- Ejecutar en: Supabase > SQL Editor > New query
-- ============================================================

-- ==================== VIDEOS ====================

create table if not exists videos (
  id          uuid primary key default gen_random_uuid(),
  title       text,
  youtube_id  text not null,
  published   boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- Migrar los 4 videos hardcodeados
insert into videos (youtube_id, sort_order) values
  ('SEHgRWobQVU', 0),
  ('h7KmYYeH7zw', 1),
  ('Sv6nqPmncFE', 2),
  ('cZZQ21lkjdI', 3)
on conflict do nothing;

alter table videos enable row level security;

create policy "public read published videos"
  on videos for select
  using (published = true);

create policy "admin full access videos"
  on videos for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');


-- ==================== LIVE STREAMING ====================

create table if not exists live_config (
  id            int primary key default 1,
  is_live       boolean not null default false,
  stream_title  text,
  started_at    timestamptz,
  updated_at    timestamptz not null default now()
);

-- Fila única (siempre id=1)
insert into live_config (id) values (1)
on conflict (id) do nothing;

alter table live_config enable row level security;

create policy "public read live config"
  on live_config for select
  using (true);

create policy "admin update live config"
  on live_config for update
  using (auth.role() = 'authenticated');


-- ==================== REALTIME ====================
-- Habilitar Realtime en live_config para que el frontend
-- se actualice automáticamente cuando is_live cambia.
-- Ir a: Supabase Dashboard → Database → Replication
-- y agregar la tabla live_config a la publicación supabase_realtime.
