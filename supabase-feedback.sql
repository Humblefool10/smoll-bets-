-- in-app feedback inbox. lightweight: signed-in users can submit, only the
-- maintainer reads via the supabase dashboard / SQL editor (no admin UI yet).
-- run this once in the Supabase SQL editor.

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  email text not null,
  message text not null check (length(message) between 1 and 4000),
  created_at timestamptz not null default now(),
  replied_at timestamptz,
  status text not null default 'new' check (status in ('new', 'replied', 'closed'))
);

create index feedback_status_created_idx on public.feedback (status, created_at desc);

alter table public.feedback enable row level security;

-- signed-in users can submit; the user_id is forced to match their auth uid so
-- nobody can submit "from" someone else.
create policy "feedback: signed-in users can insert"
  on public.feedback for insert
  with check (auth.uid() = user_id);

-- no public read policy. you (the maintainer) read from the supabase
-- dashboard's SQL editor, which uses service-role and bypasses RLS.
