-- ============================================================
-- security fixes: settlement permissions + log rate limiting
-- run this in Supabase SQL Editor
-- ============================================================

-- ── fix 1: allow any active member to create settlements ────
-- previously only the circle creator could insert settlements,
-- but settlement is triggered by whoever first opens an expired
-- circle. now any active member can write the settlement.

drop policy "settlements: creator can create" on public.settlements;

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

-- ── fix 2: one log per user per circle per day ──────────────
-- prevents spamming logs to game the system.
-- a user can log once per day per circle (max).

create unique index logs_one_per_user_per_day
  on public.logs (circle_id, user_id, (logged_at::date));
