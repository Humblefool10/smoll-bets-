-- fix infinite recursion in circle_members RLS policy

-- drop the broken policy
drop policy "circle_members: members can read" on public.circle_members;

-- simple fix: you can see your own memberships,
-- and you can see other members in circles you're in.
-- to avoid recursion, we use a security definer function.

create or replace function public.my_circle_ids()
returns setof uuid
language sql
security definer
stable
as $$
  select circle_id from public.circle_members
  where user_id = auth.uid() and left_at is null;
$$;

create policy "circle_members: members can read"
  on public.circle_members for select
  using (
    circle_id in (select public.my_circle_ids())
  );
