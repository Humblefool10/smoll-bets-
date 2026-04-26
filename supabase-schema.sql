-- ============================================================
-- smoll bets database schema
-- run this in Supabase SQL Editor (all at once)
-- ============================================================

-- ── profiles ────────────────────────────────────────────────
-- mirrors supabase auth.users, stores display info.
-- id matches the auth user's UUID so we can join them.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  avatar_url text,
  created_at timestamptz not null default now()
);

-- auto-create a profile when someone signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── circles ─────────────────────────────────────────────────
-- each circle/challenge. the social contract.

create table public.circles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  habit text not null,
  target int not null default 3,
  duration_weeks int not null default 4,
  stakes text not null,
  verification text not null default 'proof' check (verification in ('honor', 'proof')),
  max_members int not null default 4 check (max_members between 2 and 6),
  created_by uuid not null references public.profiles(id),
  status text not null default 'waiting' check (status in ('waiting', 'active', 'completed')),
  invite_code text not null default encode(gen_random_bytes(6), 'hex'),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- index for invite link lookups
create unique index circles_invite_code_idx on public.circles(invite_code);

-- ── circle_members ──────────────────────────────────────────
-- who's in which circle. the join table.

create table public.circle_members (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('creator', 'member')),
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  unique(circle_id, user_id)
);

-- ── logs ────────────────────────────────────────────────────
-- every habit log. the evidence.

create table public.logs (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null default 'honor' check (type in ('honor', 'photo')),
  photo_url text,
  note text,
  week_number int not null default 1,
  logged_at timestamptz not null default now()
);

-- index for fetching logs by circle + week
create index logs_circle_week_idx on public.logs(circle_id, week_number);

-- one log per user per circle per day (prevents gaming)
create unique index logs_one_per_user_per_day
  on public.logs (circle_id, user_id, (logged_at::date));

-- ── settlements ─────────────────────────────────────────────
-- weekly settlement results.

create table public.settlements (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete cascade,
  week_number int not null,
  outcome text not null check (outcome in ('all-clear', 'someone-owes', 'nobody-showed')),
  results jsonb not null default '[]',
  created_at timestamptz not null default now(),
  unique(circle_id, week_number)
);

-- ============================================================
-- Row Level Security (RLS) policies
-- every table has RLS enabled by default (supabase setting).
-- these policies control who can see and do what.
-- ============================================================

-- ── profiles RLS ────────────────────────────────────────────

alter table public.profiles enable row level security;

-- anyone can read profiles (needed to show avatars, names)
create policy "profiles: anyone can read"
  on public.profiles for select
  using (true);

-- users can only update their own profile
create policy "profiles: users update own"
  on public.profiles for update
  using (auth.uid() = id);

-- ── circles RLS ─────────────────────────────────────────────

alter table public.circles enable row level security;

-- members can read circles they're in
create policy "circles: members can read"
  on public.circles for select
  using (
    exists (
      select 1 from public.circle_members
      where circle_members.circle_id = circles.id
      and circle_members.user_id = auth.uid()
      and circle_members.left_at is null
    )
  );

-- anyone can read a circle by invite code (needed for invite page)
create policy "circles: anyone can read by invite"
  on public.circles for select
  using (true);

-- authenticated users can create circles
create policy "circles: authenticated can create"
  on public.circles for insert
  with check (auth.uid() = created_by);

-- only creator can update circle
create policy "circles: creator can update"
  on public.circles for update
  using (auth.uid() = created_by);

-- ── circle_members RLS ──────────────────────────────────────

alter table public.circle_members enable row level security;

-- members can see who else is in their circles
create policy "circle_members: members can read"
  on public.circle_members for select
  using (
    exists (
      select 1 from public.circle_members as cm
      where cm.circle_id = circle_members.circle_id
      and cm.user_id = auth.uid()
    )
  );

-- authenticated users can join circles (insert themselves)
create policy "circle_members: users can join"
  on public.circle_members for insert
  with check (auth.uid() = user_id);

-- members can update their own membership (e.g., leaving)
create policy "circle_members: users update own"
  on public.circle_members for update
  using (auth.uid() = user_id);

-- ── logs RLS ────────────────────────────────────────────────

alter table public.logs enable row level security;

-- circle members can read logs in their circles
create policy "logs: members can read"
  on public.logs for select
  using (
    exists (
      select 1 from public.circle_members
      where circle_members.circle_id = logs.circle_id
      and circle_members.user_id = auth.uid()
      and circle_members.left_at is null
    )
  );

-- members can create logs in their circles
create policy "logs: members can create"
  on public.logs for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.circle_members
      where circle_members.circle_id = logs.circle_id
      and circle_members.user_id = auth.uid()
      and circle_members.left_at is null
    )
  );

-- ── settlements RLS ─────────────────────────────────────────

alter table public.settlements enable row level security;

-- circle members can read settlements
create policy "settlements: members can read"
  on public.settlements for select
  using (
    exists (
      select 1 from public.circle_members
      where circle_members.circle_id = settlements.circle_id
      and circle_members.user_id = auth.uid()
    )
  );

-- active members can create settlements (first to open expired circle triggers it)
create policy "settlements: active members can create"
  on public.settlements for insert
  with check (
    exists (
      select 1 from public.circle_members
      where circle_members.circle_id = settlements.circle_id
      and circle_members.user_id = auth.uid()
      and circle_members.left_at is null
    )
  );

-- ============================================================
-- Storage bucket for photo proofs
-- ============================================================

insert into storage.buckets (id, name, public)
values ('proof-photos', 'proof-photos', true);

-- members can upload photos to their circle's folder
create policy "proof-photos: members can upload"
  on storage.objects for insert
  with check (
    bucket_id = 'proof-photos'
    and auth.role() = 'authenticated'
  );

-- members can view photos in their circles
create policy "proof-photos: members can view"
  on storage.objects for select
  using (
    bucket_id = 'proof-photos'
    and auth.role() = 'authenticated'
  );
