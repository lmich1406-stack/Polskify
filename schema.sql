-- POLSKIFY / SUPABASE
-- Uruchom ten plik w Supabase -> SQL Editor.
-- Potem ustaw swoje konto admina:
-- update public.profiles set is_admin = true where id = 'UUID_TWOJEGO_UŻYTKOWNIKA';

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'gracz',
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  xp integer not null default 0 check (xp >= 0),
  passed_regions jsonb not null default '{}'::jsonb,
  stats jsonb not null default '{}'::jsonb,
  streak_count integer not null default 0 check (streak_count >= 0),
  streak_best integer not null default 0 check (streak_best >= 0),
  streak_last_day date,
  active_days jsonb not null default '[]'::jsonb,
  weekly_xp integer not null default 0 check (weekly_xp >= 0),
  league text not null default 'bronze' check (league in ('bronze','silver','gold')),
  week_key date,
  updated_at timestamptz not null default now()
);

create table if not exists public.league_entries (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'gracz',
  weekly_xp integer not null default 0 check (weekly_xp >= 0),
  league text not null default 'bronze' check (league in ('bronze','silver','gold')),
  week_key date,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.progress enable row level security;
alter table public.league_entries enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.progress from anon, authenticated;
revoke all on table public.league_entries from anon, authenticated;

grant select on table public.profiles to authenticated;
grant insert on table public.profiles to authenticated;
grant update(display_name) on table public.profiles to authenticated;

grant select, insert, update on table public.progress to authenticated;
grant select, insert, update on table public.league_entries to authenticated;

drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
on public.profiles for select
to authenticated
using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "progress_select_own" on public.progress;
create policy "progress_select_own"
on public.progress for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "progress_insert_own" on public.progress;
create policy "progress_insert_own"
on public.progress for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "progress_update_own" on public.progress;
create policy "progress_update_own"
on public.progress for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "league_select_all_authenticated" on public.league_entries;
create policy "league_select_all_authenticated"
on public.league_entries for select
to authenticated
using (true);

drop policy if exists "league_insert_own" on public.league_entries;
create policy "league_insert_own"
on public.league_entries for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "league_update_own" on public.league_entries;
create policy "league_update_own"
on public.league_entries for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create index if not exists league_entries_board_idx
on public.league_entries (league, week_key, weekly_xp desc);
