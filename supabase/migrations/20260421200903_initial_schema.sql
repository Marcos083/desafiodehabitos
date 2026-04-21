-- ============================================================================
-- Initial schema for Habit Partner App
-- Tables: profiles, partnerships, partnership_members, habits, check_ins, notifications
-- RLS enabled on every table from this migration.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- profiles (extends auth.users)
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth.users row is inserted.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- partnerships + partnership_members
-- ----------------------------------------------------------------------------
create table public.partnerships (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text unique not null default upper(substr(md5(random()::text), 1, 6)),
  created_at timestamptz not null default now()
);

create table public.partnership_members (
  partnership_id uuid not null references public.partnerships(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (partnership_id, user_id)
);

create index idx_partnership_members_user on public.partnership_members(user_id);

-- Helper: returns true if the given user is a member of the given partnership.
-- SECURITY DEFINER avoids RLS recursion when called from policies on
-- partnership_members itself.
create or replace function public.is_partnership_member(
  p_partnership_id uuid,
  p_user_id uuid
)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.partnership_members
    where partnership_id = p_partnership_id
      and user_id = p_user_id
  );
$$;

-- Helper: returns true if auth.uid() shares any partnership with the given user.
create or replace function public.is_partner_of(p_user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.partnership_members pm_me
    join public.partnership_members pm_other
      on pm_me.partnership_id = pm_other.partnership_id
    where pm_me.user_id = auth.uid()
      and pm_other.user_id = p_user_id
  );
$$;

-- ----------------------------------------------------------------------------
-- habits
-- ----------------------------------------------------------------------------
create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  partnership_id uuid not null references public.partnerships(id) on delete cascade,
  name text not null,
  description text,
  frequency_type text not null default 'daily'
    check (frequency_type in ('daily', 'specific_days')),
  -- 0 = Sunday .. 6 = Saturday
  active_days smallint[] not null default '{0,1,2,3,4,5,6}',
  points integer not null default 1 check (points > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  archived_at timestamptz
);

create index idx_habits_user_partnership
  on public.habits(user_id, partnership_id)
  where is_active;

create index idx_habits_partnership
  on public.habits(partnership_id)
  where is_active;

-- ----------------------------------------------------------------------------
-- check_ins (the core)
-- ----------------------------------------------------------------------------
create table public.check_ins (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  partnership_id uuid not null references public.partnerships(id) on delete cascade,
  date date not null default current_date,
  completed boolean not null default true,
  note text,
  created_at timestamptz not null default now(),
  unique (habit_id, date)
);

create index idx_check_ins_user_date on public.check_ins(user_id, date desc);
create index idx_check_ins_partnership_date on public.check_ins(partnership_id, date desc);

-- ----------------------------------------------------------------------------
-- notifications
-- ----------------------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_notifications_recipient_unread
  on public.notifications(recipient_id, created_at desc)
  where read_at is null;

-- ----------------------------------------------------------------------------
-- RPC helpers (atomic partnership create/join)
-- ----------------------------------------------------------------------------

-- Creates a partnership and adds the caller as owner. Returns the new id.
create or replace function public.create_partnership(p_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_partnership_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  insert into public.partnerships (name)
  values (p_name)
  returning id into v_partnership_id;

  insert into public.partnership_members (partnership_id, user_id, role)
  values (v_partnership_id, auth.uid(), 'owner');

  return v_partnership_id;
end;
$$;

-- Joins an existing partnership by invite code. Returns the partnership id.
create or replace function public.join_partnership(p_invite_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_partnership_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  select id into v_partnership_id
  from public.partnerships
  where invite_code = upper(p_invite_code);

  if v_partnership_id is null then
    raise exception 'invalid_invite_code';
  end if;

  insert into public.partnership_members (partnership_id, user_id, role)
  values (v_partnership_id, auth.uid(), 'member')
  on conflict (partnership_id, user_id) do nothing;

  return v_partnership_id;
end;
$$;

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.profiles              enable row level security;
alter table public.partnerships          enable row level security;
alter table public.partnership_members   enable row level security;
alter table public.habits                enable row level security;
alter table public.check_ins             enable row level security;
alter table public.notifications         enable row level security;

-- ----------------------------------------------------------------------------
-- profiles: own profile + profiles of partners
-- ----------------------------------------------------------------------------
create policy profiles_select_own_or_partner
  on public.profiles for select
  using (
    id = auth.uid()
    or public.is_partner_of(id)
  );

create policy profiles_update_own
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- ----------------------------------------------------------------------------
-- partnerships: only members can see their partnerships.
-- Creation/joining handled by SECURITY DEFINER RPC functions above.
-- ----------------------------------------------------------------------------
create policy partnerships_select_members
  on public.partnerships for select
  using (public.is_partnership_member(id, auth.uid()));

create policy partnerships_update_owner
  on public.partnerships for update
  using (
    exists (
      select 1 from public.partnership_members
      where partnership_id = partnerships.id
        and user_id = auth.uid()
        and role = 'owner'
    )
  )
  with check (
    exists (
      select 1 from public.partnership_members
      where partnership_id = partnerships.id
        and user_id = auth.uid()
        and role = 'owner'
    )
  );

-- ----------------------------------------------------------------------------
-- partnership_members: visible to co-members; user can leave (delete self).
-- ----------------------------------------------------------------------------
create policy partnership_members_select_same
  on public.partnership_members for select
  using (public.is_partnership_member(partnership_id, auth.uid()));

create policy partnership_members_delete_self
  on public.partnership_members for delete
  using (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- habits: all members of the partnership can see; only the owner can write.
-- ----------------------------------------------------------------------------
create policy habits_select_in_partnership
  on public.habits for select
  using (public.is_partnership_member(partnership_id, auth.uid()));

create policy habits_insert_own
  on public.habits for insert
  with check (
    user_id = auth.uid()
    and public.is_partnership_member(partnership_id, auth.uid())
  );

create policy habits_update_own
  on public.habits for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy habits_delete_own
  on public.habits for delete
  using (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- check_ins: all partnership members can see; only the owner can write.
-- ----------------------------------------------------------------------------
create policy check_ins_select_in_partnership
  on public.check_ins for select
  using (public.is_partnership_member(partnership_id, auth.uid()));

create policy check_ins_insert_own
  on public.check_ins for insert
  with check (
    user_id = auth.uid()
    and public.is_partnership_member(partnership_id, auth.uid())
  );

create policy check_ins_update_own
  on public.check_ins for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy check_ins_delete_own
  on public.check_ins for delete
  using (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- notifications: recipient-only.
-- ----------------------------------------------------------------------------
create policy notifications_select_recipient
  on public.notifications for select
  using (recipient_id = auth.uid());

create policy notifications_update_recipient
  on public.notifications for update
  using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());
