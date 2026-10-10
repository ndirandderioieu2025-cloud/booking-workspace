-- Booking Workspace, Stage 4
-- Run this migration before supabase/seed.sql.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  workspace_type text not null check (workspace_type in ('cafe', 'study', 'coworking', 'meeting-room')),
  neighborhood text not null,
  city text not null default 'Madrid',
  address text not null,
  image_path text not null,
  description text not null,
  price_per_hour numeric(8,2) not null check (price_per_hour >= 0),
  price_unit text not null check (price_unit in ('person', 'desk', 'room')),
  capacity integer not null check (capacity > 0),
  sample_score numeric(2,1) not null,
  recommended_rank integer not null,
  open_time time not null,
  close_time time not null,
  open_days integer[] not null,
  amenities jsonb not null default '{}'::jsonb,
  facilities text[] not null default '{}',
  payment_methods text[] not null,
  purchase_condition text,
  cancellation_policy text not null,
  cancellation_hours integer not null default 0 check (cancellation_hours >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workspaces_hours check (close_time > open_time),
  constraint workspaces_payment_methods check (payment_methods <@ array['free', 'pay-online', 'pay-at-venue']::text[])
);

create table if not exists public.workspace_availability (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  availability_date date not null,
  is_closed boolean not null default false,
  open_time time,
  close_time time,
  capacity integer check (capacity > 0),
  created_at timestamptz not null default now(),
  unique (workspace_id, availability_date),
  constraint availability_hours check (is_closed or open_time is null or close_time is null or close_time > open_time)
);

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id),
  workspace_slug text not null,
  booking_date date not null,
  start_time time not null,
  duration_hours integer not null check (duration_hours between 1 and 8),
  people integer not null check (people > 0),
  option_id text not null,
  option_label text not null,
  unit_price numeric(8,2) not null check (unit_price >= 0),
  total_price numeric(10,2) not null check (total_price >= 0),
  payment_method text not null check (payment_method in ('free', 'pay-online', 'pay-at-venue')),
  payment_status text not null check (payment_status in ('paid-simulated', 'pay-at-venue', 'not-required')),
  booking_status text not null default 'confirmed' check (booking_status in ('confirmed', 'cancelled')),
  legacy_reference text,
  created_at timestamptz not null default now(),
  cancelled_at timestamptz,
  constraint reservations_free_payment check ((total_price = 0 and payment_method = 'free') or (total_price > 0 and payment_method <> 'free'))
);

create index if not exists reservations_workspace_time_idx on public.reservations (workspace_id, booking_date, start_time) where booking_status = 'confirmed';
create index if not exists reservations_user_date_idx on public.reservations (user_id, booking_date desc);
create unique index if not exists reservations_legacy_once_idx on public.reservations (user_id, legacy_reference) where legacy_reference is not null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_availability enable row level security;
alter table public.reservations enable row level security;

-- New Supabase projects can disable automatic Data API exposure. Grants and
-- RLS are separate layers, so explicitly expose only the operations used by
-- the application. All reservation writes remain restricted to the RPCs.
grant usage on schema public to anon, authenticated;
revoke all on table public.profiles from anon, authenticated;
revoke all on table public.workspaces from anon, authenticated;
revoke all on table public.workspace_availability from anon, authenticated;
revoke all on table public.reservations from anon, authenticated;
grant select, update on table public.profiles to authenticated;
grant select on table public.workspaces to anon, authenticated;
grant select on table public.workspace_availability to anon, authenticated;
grant select on table public.reservations to authenticated;

drop policy if exists "Profiles are visible to their owner" on public.profiles;
create policy "Profiles are visible to their owner" on public.profiles for select to authenticated using ((select auth.uid()) = id);
drop policy if exists "Profiles are editable by their owner" on public.profiles;
create policy "Profiles are editable by their owner" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "Active workspaces are public" on public.workspaces;
create policy "Active workspaces are public" on public.workspaces for select to anon, authenticated using (is_active);
drop policy if exists "Workspace availability is public" on public.workspace_availability;
create policy "Workspace availability is public" on public.workspace_availability for select to anon, authenticated using (true);

drop policy if exists "Reservations are visible to their owner" on public.reservations;
create policy "Reservations are visible to their owner" on public.reservations for select to authenticated using ((select auth.uid()) = user_id);

create or replace function public.create_reservation(
  p_workspace_slug text,
  p_booking_date date,
  p_start_time time,
  p_duration_hours integer,
  p_people integer,
  p_option_id text,
  p_option_label text,
  p_payment_method text,
  p_legacy_reference text default null
)
returns public.reservations
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_workspace public.workspaces%rowtype;
  v_override public.workspace_availability%rowtype;
  v_open time;
  v_close time;
  v_capacity integer;
  v_end_time time;
  v_slot timestamp;
  v_occupied integer;
  v_total numeric(10,2);
  v_payment_status text;
  v_reference text;
  v_reservation public.reservations%rowtype;
begin
  if v_user_id is null then raise exception 'Sign in before confirming your reservation.'; end if;
  if p_booking_date is null or p_start_time is null then raise exception 'Choose a valid date and start time.'; end if;
  if p_duration_hours not between 1 and 8 or p_people < 1 then raise exception 'Invalid duration or group size.'; end if;
  if extract(minute from p_start_time)::integer not in (0, 30) or extract(second from p_start_time) <> 0 then raise exception 'Start times must use 30-minute intervals.'; end if;
  if p_option_id is null or length(trim(p_option_id)) = 0 or p_option_label is null or length(trim(p_option_label)) = 0 then raise exception 'Choose a valid workspace option.'; end if;

  select * into v_workspace from public.workspaces where slug = p_workspace_slug and is_active for update;
  if not found then raise exception 'Workspace not found.'; end if;
  if p_payment_method is null or not (p_payment_method = any(v_workspace.payment_methods)) then raise exception 'This payment method is not supported.'; end if;
  if p_people > v_workspace.capacity then raise exception 'This workspace can host a maximum of % people.', v_workspace.capacity; end if;
  if p_legacy_reference is not null and exists (select 1 from public.reservations where user_id = v_user_id and legacy_reference = p_legacy_reference) then
    raise exception 'This local booking was already imported.';
  end if;

  v_open := v_workspace.open_time;
  v_close := v_workspace.close_time;
  v_capacity := v_workspace.capacity;
  select * into v_override from public.workspace_availability where workspace_id = v_workspace.id and availability_date = p_booking_date;
  if found then
    if v_override.is_closed then raise exception 'This workspace is closed on the selected day.'; end if;
    v_open := coalesce(v_override.open_time, v_open);
    v_close := coalesce(v_override.close_time, v_close);
    v_capacity := coalesce(v_override.capacity, v_capacity);
  elsif not (extract(dow from p_booking_date)::integer = any(v_workspace.open_days)) then
    raise exception 'This workspace is closed on the selected day.';
  end if;
  if p_people > v_capacity then raise exception 'This workspace can host a maximum of % people on the selected date.', v_capacity; end if;

  if (p_booking_date + p_start_time) <= timezone('Europe/Madrid', now()) then raise exception 'Bookings must start in the future.'; end if;
  v_end_time := p_start_time + make_interval(hours => p_duration_hours);
  if p_start_time < v_open or v_end_time > v_close or v_end_time <= p_start_time then raise exception 'The selected time is outside opening hours.'; end if;

  if v_workspace.workspace_type = 'meeting-room' then
    if exists (
      select 1 from public.reservations r
      where r.workspace_id = v_workspace.id and r.booking_date = p_booking_date and r.booking_status = 'confirmed'
        and p_start_time < r.start_time + make_interval(hours => r.duration_hours)
        and v_end_time > r.start_time
    ) then raise exception 'This private room is already reserved during part of the selected time.'; end if;
  else
    for v_slot in select generate_series(p_booking_date + p_start_time, p_booking_date + p_start_time + make_interval(hours => p_duration_hours) - interval '30 minutes', interval '30 minutes') loop
      select coalesce(sum(r.people), 0)::integer into v_occupied
      from public.reservations r
      where r.workspace_id = v_workspace.id and r.booking_date = p_booking_date and r.booking_status = 'confirmed'
        and (r.booking_date + r.start_time) <= v_slot
        and (r.booking_date + r.start_time + make_interval(hours => r.duration_hours)) > v_slot;
      if v_occupied + p_people > v_capacity then raise exception 'Only % places are available during this time.', greatest(0, v_capacity - v_occupied); end if;
    end loop;
  end if;

  v_total := round(v_workspace.price_per_hour * p_duration_hours * case when v_workspace.price_unit = 'room' then 1 else p_people end, 2);
  if v_total = 0 and p_payment_method <> 'free' then raise exception 'This workspace requires a free reservation.'; end if;
  if v_total > 0 and p_payment_method = 'free' then raise exception 'This is a paid workspace.'; end if;
  v_payment_status := case p_payment_method when 'pay-online' then 'paid-simulated' when 'pay-at-venue' then 'pay-at-venue' else 'not-required' end;

  loop
    v_reference := 'BW-' || to_char(p_booking_date, 'YYMMDD') || '-' || upper(substr(encode(extensions.gen_random_bytes(6), 'hex'), 1, 6));
    exit when not exists (select 1 from public.reservations where reference = v_reference);
  end loop;

  insert into public.reservations (
    reference, user_id, workspace_id, workspace_slug, booking_date, start_time, duration_hours, people,
    option_id, option_label, unit_price, total_price, payment_method, payment_status, legacy_reference
  ) values (
    v_reference, v_user_id, v_workspace.id, v_workspace.slug, p_booking_date, p_start_time, p_duration_hours, p_people,
    trim(p_option_id), trim(p_option_label), v_workspace.price_per_hour, v_total, p_payment_method, v_payment_status, p_legacy_reference
  ) returning * into v_reservation;
  return v_reservation;
end;
$$;

create or replace function public.cancel_reservation(p_reference text)
returns public.reservations
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_reservation public.reservations%rowtype;
  v_cancellation_hours integer;
begin
  if v_user_id is null then raise exception 'Sign in to cancel this booking.'; end if;
  select r.* into v_reservation from public.reservations r where r.reference = p_reference and r.user_id = v_user_id for update;
  if not found then raise exception 'Booking not found.'; end if;
  if v_reservation.booking_status <> 'confirmed' then raise exception 'This booking is already cancelled.'; end if;
  select cancellation_hours into v_cancellation_hours from public.workspaces where id = v_reservation.workspace_id;
  if timezone('Europe/Madrid', now()) >= (v_reservation.booking_date + v_reservation.start_time - make_interval(hours => v_cancellation_hours)) then
    raise exception 'This reservation can no longer be cancelled under the workspace policy.';
  end if;
  update public.reservations set booking_status = 'cancelled', cancelled_at = now() where id = v_reservation.id returning * into v_reservation;
  return v_reservation;
end;
$$;

create or replace function public.get_workspace_available_slots(
  p_workspace_slug text,
  p_booking_date date,
  p_duration_hours integer,
  p_people integer
)
returns table(start_time time, available boolean, remaining_capacity integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_workspace public.workspaces%rowtype;
  v_override public.workspace_availability%rowtype;
  v_open time;
  v_close time;
  v_capacity integer;
  v_candidate timestamp;
  v_check_slot timestamp;
  v_occupied integer;
  v_max_occupied integer;
  v_available boolean;
begin
  if p_booking_date is null or p_duration_hours not between 1 and 8 or p_people < 1 then return; end if;
  select * into v_workspace from public.workspaces where slug = p_workspace_slug and is_active;
  if not found or p_people > v_workspace.capacity then return; end if;
  v_open := v_workspace.open_time; v_close := v_workspace.close_time; v_capacity := v_workspace.capacity;
  select * into v_override from public.workspace_availability where workspace_id = v_workspace.id and availability_date = p_booking_date;
  if found then
    if v_override.is_closed then return; end if;
    v_open := coalesce(v_override.open_time, v_open); v_close := coalesce(v_override.close_time, v_close); v_capacity := coalesce(v_override.capacity, v_capacity);
  elsif not (extract(dow from p_booking_date)::integer = any(v_workspace.open_days)) then return;
  end if;
  if p_people > v_capacity then return; end if;

  for v_candidate in select generate_series(p_booking_date + v_open, p_booking_date + v_close - make_interval(hours => p_duration_hours), interval '30 minutes') loop
    v_available := v_candidate > timezone('Europe/Madrid', now());
    v_max_occupied := 0;
    if v_available and v_workspace.workspace_type = 'meeting-room' then
      v_available := not exists (
        select 1 from public.reservations r where r.workspace_id = v_workspace.id and r.booking_date = p_booking_date and r.booking_status = 'confirmed'
          and v_candidate::time < r.start_time + make_interval(hours => r.duration_hours)
          and (v_candidate + make_interval(hours => p_duration_hours))::time > r.start_time
      );
      if not v_available then v_max_occupied := v_capacity; end if;
    elsif v_available then
      for v_check_slot in select generate_series(v_candidate, v_candidate + make_interval(hours => p_duration_hours) - interval '30 minutes', interval '30 minutes') loop
        select coalesce(sum(r.people), 0)::integer into v_occupied from public.reservations r
        where r.workspace_id = v_workspace.id and r.booking_date = p_booking_date and r.booking_status = 'confirmed'
          and (r.booking_date + r.start_time) <= v_check_slot
          and (r.booking_date + r.start_time + make_interval(hours => r.duration_hours)) > v_check_slot;
        v_max_occupied := greatest(v_max_occupied, v_occupied);
      end loop;
      v_available := v_max_occupied + p_people <= v_capacity;
    end if;
    start_time := v_candidate::time;
    available := v_available;
    remaining_capacity := greatest(0, v_capacity - v_max_occupied);
    return next;
  end loop;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.create_reservation(text, date, time, integer, integer, text, text, text, text) from public, anon, authenticated;
grant execute on function public.create_reservation(text, date, time, integer, integer, text, text, text, text) to authenticated;
revoke all on function public.cancel_reservation(text) from public, anon, authenticated;
grant execute on function public.cancel_reservation(text) to authenticated;
revoke all on function public.get_workspace_available_slots(text, date, integer, integer) from public, anon, authenticated;
grant execute on function public.get_workspace_available_slots(text, date, integer, integer) to anon, authenticated;
