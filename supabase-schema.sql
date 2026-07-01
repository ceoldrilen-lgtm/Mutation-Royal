-- Bunu Supabase panelinde SQL Editor -> New query içine yapıştırıp
-- "Run" butonuna bas. Lider tablosu için gereken her şeyi kurar.

create table public.leaderboard (
  id bigint generated always as identity primary key,
  player_id text not null unique,
  nickname text not null,
  mutant_name text not null,
  score integer not null check (score >= 0 and score <= 100000),
  updated_at timestamptz not null default now()
);

-- Row Level Security: herkes okuyabilir, herkes kendi kaydını
-- ekleyip güncelleyebilir (player_id ile eşleşen).
alter table public.leaderboard enable row level security;

create policy "Herkes okuyabilir"
  on public.leaderboard for select
  using (true);

create policy "Herkes yeni kayit ekleyebilir"
  on public.leaderboard for insert
  with check (true);

create policy "Herkes kendi kaydini guncelleyebilir"
  on public.leaderboard for update
  using (true)
  with check (true);
