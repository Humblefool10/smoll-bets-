-- creator can delete logs in their own circle.
-- needed so the creator can reset progress when changing
-- target / duration_weeks on an active circle.
-- run this once in the Supabase SQL editor.

create policy "logs: creator can delete"
  on public.logs for delete
  using (
    exists (
      select 1 from public.circles
      where circles.id = logs.circle_id
      and circles.created_by = auth.uid()
    )
  );
