-- reactions on logs (Tier 1 — communion turns two-way).
-- small fixed vocabulary: respect, with_you, barely.
-- two warm + one spicy — holds the competitive-AND-bonding tension.
-- run this once in the Supabase SQL editor.

create table public.reactions (
  id uuid primary key default gen_random_uuid(),
  log_id uuid not null references public.logs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reaction text not null check (reaction in ('respect', 'with_you', 'barely')),
  created_at timestamptz not null default now(),
  -- one of each reaction-type per user per log (toggle behavior)
  unique (log_id, user_id, reaction)
);

create index reactions_log_id_idx on public.reactions(log_id);

alter table public.reactions enable row level security;

-- members of the log's circle can read all reactions on its logs
create policy "reactions: circle members can read"
  on public.reactions for select
  using (
    exists (
      select 1
      from public.logs l
      join public.circle_members cm on cm.circle_id = l.circle_id
      where l.id = reactions.log_id
      and cm.user_id = auth.uid()
      and cm.left_at is null
    )
  );

-- members can react to other people's logs in their circles (no self-react)
create policy "reactions: circle members can create on others' logs"
  on public.reactions for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.logs l
      join public.circle_members cm on cm.circle_id = l.circle_id
      where l.id = reactions.log_id
      and cm.user_id = auth.uid()
      and cm.left_at is null
      and l.user_id <> auth.uid()
    )
  );

-- users can remove their own reactions
create policy "reactions: users can delete own"
  on public.reactions for delete
  using (auth.uid() = user_id);

-- realtime broadcasts so reactions appear live without refresh
alter publication supabase_realtime add table public.reactions;
