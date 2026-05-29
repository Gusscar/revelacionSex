-- Ejecutar en Supabase SQL Editor
create table if not exists guest_accounts (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  name_key    text not null unique,   -- nombre normalizado para login
  password_hash text not null,
  created_at  timestamptz default now()
);

alter table guest_accounts enable row level security;

create policy "Insertar cuenta de invitado"
  on guest_accounts for insert with check (true);

create policy "Consultar cuenta de invitado"
  on guest_accounts for select using (true);
