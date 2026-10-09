-- À exécuter dans Supabase > SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.staff_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  is_admin boolean not null default false
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  rp_name text not null check (char_length(rp_name) between 1 and 100),
  rp_age integer not null check (rp_age between 18 and 99),
  discord_tag text not null check (char_length(discord_tag) between 1 and 80),
  game_id text,
  backstory text not null,
  motivation text not null,
  experience text not null,
  roleplay_answer text not null,
  availability text not null,
  has_mic text not null check (has_mic in ('Oui','Non')),
  conflict text not null,
  rules_accepted boolean not null default false,
  privacy_accepted boolean not null default false,
  status text not null default 'En attente' check (status in ('En attente','Acceptée','Refusée')),
  staff_note text
);

alter table public.staff_profiles enable row level security;
alter table public.applications enable row level security;

-- Les visiteurs peuvent déposer une candidature, mais ne peuvent pas lire/modifier les candidatures.
grant insert on public.applications to anon, authenticated;
grant select, update on public.applications to authenticated;
revoke all on public.staff_profiles from anon, authenticated;
grant select on public.staff_profiles to authenticated;

drop policy if exists "Public can submit applications" on public.applications;
create policy "Public can submit applications" on public.applications
for insert to anon, authenticated
with check (rules_accepted = true and privacy_accepted = true);

drop policy if exists "Only admins can read applications" on public.applications;
create policy "Only admins can read applications" on public.applications
for select to authenticated
using (exists (select 1 from public.staff_profiles p where p.user_id = auth.uid() and p.is_admin = true));

drop policy if exists "Only admins can update applications" on public.applications;
create policy "Only admins can update applications" on public.applications
for update to authenticated
using (exists (select 1 from public.staff_profiles p where p.user_id = auth.uid() and p.is_admin = true))
with check (exists (select 1 from public.staff_profiles p where p.user_id = auth.uid() and p.is_admin = true));

drop policy if exists "Staff can read own staff profile" on public.staff_profiles;
create policy "Staff can read own staff profile" on public.staff_profiles
for select to authenticated using (user_id = auth.uid());

-- IMPORTANT : après avoir créé le compte staff dans Authentication > Users,
-- remplace UUID_DU_COMPTE par son User UID et exécute :
-- insert into public.staff_profiles (user_id, is_admin)
-- values ('UUID_DU_COMPTE', true)
-- on conflict (user_id) do update set is_admin = true;
--
-- Ne jamais mettre la clé service_role/secret dans config.js ou dans le site.
-- Pour production, ajoute des limites anti-spam/captcha côté serveur et une politique de conservation des données.
