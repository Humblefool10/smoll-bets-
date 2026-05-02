-- index for the activity feed pagination query.
-- pattern: where circle_id = ? [and logged_at < ?] order by logged_at desc limit N
-- existing index (circle_id, week_number) doesn't help — wrong sort column.
-- run this once in the Supabase SQL editor.

create index if not exists logs_circle_logged_at_idx
  on public.logs (circle_id, logged_at desc);
