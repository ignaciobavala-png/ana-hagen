-- ============================================================
-- Patch: tabla contact_config
-- Ejecutar en Supabase > SQL Editor si ya corriste setup.sql
-- ============================================================

create table if not exists contact_config (
  id               int primary key default 1,
  booking_email    text not null default 'bookinganahagen@gmail.com',
  phone            text,
  instagram        text default 'https://www.instagram.com/anahagen__/',
  soundcloud       text,
  resident_advisor text,
  updated_at       timestamptz not null default now()
);

insert into contact_config (id, booking_email, instagram)
values (1, 'bookinganahagen@gmail.com', 'https://www.instagram.com/anahagen__/')
on conflict (id) do nothing;

alter table contact_config enable row level security;

create policy "public read contact"
  on contact_config for select
  using (true);

create policy "admin update contact"
  on contact_config for update
  using (auth.role() = 'authenticated');
