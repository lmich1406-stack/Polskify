-- POLSKIFY 2.0 — PROFILE / COINS / DAILY REWARD / SHOP
-- Wklej w Supabase SQL Editor i kliknij Run.

create table if not exists public.user_meta (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar text not null default '🇵🇱',
  frame text not null default 'basic',
  coins integer not null default 0 check (coins >= 0),
  owned_items jsonb not null default '["frame-basic","avatar-pl"]'::jsonb,
  theme text not null default 'dark' check (theme in ('dark','light')),
  daily_reward_date date,
  daily jsonb not null default '{}'::jsonb,
  lifetime jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_meta enable row level security;

revoke all on table public.user_meta from anon, authenticated;
grant select, insert, update on table public.user_meta to authenticated;

drop policy if exists "user_meta_select_own" on public.user_meta;
create policy "user_meta_select_own"
on public.user_meta for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "user_meta_insert_own" on public.user_meta;
create policy "user_meta_insert_own"
on public.user_meta for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "user_meta_update_own" on public.user_meta;
create policy "user_meta_update_own"
on public.user_meta for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create or replace function public.claim_daily_reward()
returns table(coins integer, reward_date date)
language plpgsql
security definer
set search_path=public
as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;

  insert into public.user_meta(user_id)
  values(v_uid)
  on conflict(user_id) do nothing;

  update public.user_meta
  set coins = coins + 20,
      daily_reward_date = current_date,
      updated_at = now()
  where user_id = v_uid
    and daily_reward_date is distinct from current_date;

  select m.coins,m.daily_reward_date
  into coins,reward_date
  from public.user_meta m
  where m.user_id=v_uid;

  return next;
end;
$$;

revoke all on function public.claim_daily_reward() from public,anon;
grant execute on function public.claim_daily_reward() to authenticated;

create or replace function public.buy_shop_item(p_item_id text,p_price integer)
returns table(coins integer, owned_items jsonb)
language plpgsql
security definer
set search_path=public
as $$
declare v_uid uuid:=auth.uid();
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  if p_price < 0 or p_price > 500 then raise exception 'Invalid price'; end if;

  insert into public.user_meta(user_id)
  values(v_uid)
  on conflict(user_id) do nothing;

  if exists(
    select 1 from public.user_meta
    where user_id=v_uid
      and owned_items ? p_item_id
  ) then
    select m.coins,m.owned_items into coins,owned_items
    from public.user_meta m where m.user_id=v_uid;
    return next; return;
  end if;

  update public.user_meta
  set coins=coins-p_price,
      owned_items=owned_items || to_jsonb(p_item_id),
      updated_at=now()
  where user_id=v_uid and coins>=p_price;

  if not found then raise exception 'Not enough coins'; end if;

  select m.coins,m.owned_items into coins,owned_items
  from public.user_meta m where m.user_id=v_uid;
  return next;
end;
$$;

revoke all on function public.buy_shop_item(text,integer) from public,anon;
grant execute on function public.buy_shop_item(text,integer) to authenticated;
