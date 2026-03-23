-- ============================================================
-- Ana Hagen DJ — Playlist / Reproductor
-- Ejecutar en: Supabase > SQL Editor > New query
-- ============================================================

create table if not exists playlist_tracks (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  artist         text not null default 'Ana Hagen',
  soundcloud_url text not null,
  cover_url      text,
  sort_order     int not null default 0,
  published      boolean not null default true,
  created_at     timestamptz not null default now()
);

alter table playlist_tracks enable row level security;

create policy "public read published tracks"
  on playlist_tracks for select
  using (published = true);

create policy "admin full access tracks"
  on playlist_tracks for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
