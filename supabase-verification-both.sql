-- extend circles.verification to accept 'both' (creator allows honor or photo per log).
-- run this once in the Supabase SQL editor.

alter table public.circles
  drop constraint if exists circles_verification_check;

alter table public.circles
  add constraint circles_verification_check
  check (verification in ('honor', 'proof', 'both'));

-- new circles default to 'both' — most permissive, matches the new UX.
-- existing circles keep their current setting.
alter table public.circles
  alter column verification set default 'both';
