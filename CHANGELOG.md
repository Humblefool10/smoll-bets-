# changelog

what's shipped to smoll-bets.vercel.app, in reverse chronological order. each entry is a single commit unless noted. for the *why* behind these changes, see `/Users/shuvam/smoll-bets/PRD.md`.

---

## 2026-05-06

**`3cf6d36` — remove draft banner from privacy and terms pages**
The "draft, needs lawyer review" callout came off both legal pages. Content stays unchanged.

**`2ef2956` — polish round + account lifecycle + feedback modal**
Big bundle. Three independent threads landed together:

- *Account deletion.* New `/api/delete-account` route. Profile screen footer link opens a confirm modal that names the consequences (leaving circles, logs disappearing, IOUs to friends staying real-world). Bearer-token verified, supabase service role deletes the auth user, FK cascades handle the rest.
- *Privacy and terms pages* at `/privacy` and `/terms`. Plain-english draft content, linkable from anywhere. Contact channel points at the in-app feedback flow.
- *In-app feedback modal* on the profile screen. Email prefills from the verified auth account, format-validated on submit, stored in a `feedback` table (insert-only RLS, maintainer reads via supabase SQL editor).
- *Popover replaces bottom-sheet* on the three-dot menus in circle and circle-lobby (was a 2-item modal, now a small anchored popover via new `PopoverItem` component). Two modal-by-reflex instances removed.
- *Tiny body text bumped* per the slop catalog floor (11px → 13px on stats sublabels, member "no logs yet", and char counters; body 12px → 13px on feed timeAgo and footer links). Label-shape 12s kept.
- *Semantic h1 / h2 sweep* across every screen and modal. Visually pixel-identical (tailwind preflight zeroes heading defaults), real screen-reader navigation gain.

**Tried and reverted same day:** Cabinet Grotesk font. Decided to stay on Space Grotesk.

---

## 2026-05-02

A polish blitz. Six commits over the day, all production-readiness work.

**`7f6002e` — a11y sweep: form labels, aria-pressed, file input label, space-key activation**
Every input in edit-circle-dialog gets an `htmlFor`-linked label. Verification toggle group becomes `role="group"` with `aria-pressed` on each button. Hidden file input picks up an `aria-label`. Div-as-button patterns (home cards, log buttons) now respond to Space in addition to Enter.

**`1b048db` — optimize feed photo thumbs via next/image (5:4 fixed aspect, lazy loaded)**
Photo proofs in the activity feed switched from raw `<img>` to `<Image>` with fill mode in a 5:4 container. Browsers get webp/avif when supported, photos lazy-load below the fold, and the feed stops jumping around as different aspect ratios load. UX shift: photos now crop to a consistent 5:4 thumbnail (was variable height). Fits the "proof, not portfolio" framing.

**`d7d8dd6` — wire sentry for client + server + edge runtime error tracking**
Sentry SDK in for all three Next.js runtimes. Tracing off, sample rate 100%, source maps disabled (wizard skipped). Tunnel route `/monitoring` bypasses ad blockers. User context tagged with the supabase user uuid only (no email, no name, privacy-respecting). Filtered known noise: ResizeObserver, AbortError, websocket reconnects.

**`11ed329` — modals get focus trap, escape to close, focus restore, dialog aria**
New `useModalA11y` hook in `src/lib/use-modal-a11y.ts`. Applied to six modals: options sheet, leave confirm, edit dialog, nested reset confirm, lobby options, delete confirm. Each gains focus trap, Escape, focus restore, and proper `role="dialog"` + `aria-modal` + `aria-labelledby`.

**`b05e17c` — paginate the activity feed (cursor on logged_at, 20 per page)**
`fetchCircleFeed` now takes `{ before, limit }` opts. Circle screen loads first page of 20, shows a "load older" pill at the bottom that cursor-fetches the next page. Realtime keeps refetching the first page and merges over the current feed so older pages don't vanish on every reaction. New supabase index `(circle_id, logged_at desc)`.

**`1edd706` — add ritual moment cards and home narrative cues (tier 2)**
The bet lives in the background except at five punctuation moments. Circle screen surfaces a small read-only card during initiation (first 48h), midpoint (3-day window), final push (last 7 days), or stumble (anyone behind expected pace). Home list pill replaces the generic "active / waiting / done" with a narrative cue ("week 4 of 8", "halfway through", "3 days left"). New `src/lib/beats.ts`. Pure derivation, no schema, no realtime.

**`4fa758d` — add reactions on logs (tier 1) — small named vocabulary, picker hidden by default**
New `reactions` table. Three named options across the whole app: `respect`, `with you`, `barely` (two warm + one spicy). Chips render only when count > 0; a small dashed `+ react` pill expands a picker showing the three options. On your own log: chips only, no picker (encodes the witness rule). Realtime drives counts.

---

## 2026-05-01

**`e1572ee` — ship communion (caption, today's room, photo thumbs, both-verification) and active-circle edit with reset warning**
Tier 0 of the 2026-04-27 design conversation lands. Logs gain captions and render with photo thumbnails in a new `FeedCard` chassis. Submitting a log drops you into "today's room" (3 most recent logs from the circle), not a success toast. Verification gains a third option, "either", which becomes the new default. Plus the extended Tier 3: creator can edit an active circle, with cosmetic fields saving silently and target / duration triggering a warning + reset-on-confirm. Three-dot menu replaces the one-shot leave button.

---

## 2026-04-26

The week of polishing the invite + auth experience and getting the live alpha into a state worth showing to the partner.

**`495e166` — sync screen state with browser history so back button works**
**`387f51b` — recognize returning users on splash, breathe room into invite header**
**`aa2a9e0` — add escape hatch to invite page, wrap long stakes pill**
**`09a2cce` — escape apostrophes in delete confirmation copy**
**`25b1262` — realtime updates, lobby edit/delete, real invite URL on create, dialog feedback**
**`8478249` — redirect to invite page if pendingInvite exists after magic link auth**
**`dd7f7e4` — fix invite flow: google redirect back to invite page, google sign-in first**
**`a9687ba` — add photo proof upload: camera capture, preview, supabase storage**
**`c409193` — use neutral background for google sign-in button**
**`f509325` — make google sign-in primary, magic link secondary**
**`e919d68` — security fixes: settlement permissions, log rate limiting, tightened RLS**
**`255d01e` — wire all screens to supabase, add invite flow, settlement, and quality fixes**

---

## 2026-04-24

**`ed43c26` — add delight animations, sound design, and quality hardening**
The first pass of brutal-shadow micro-interactions, the celebrate-pop on successful logs, and the ambient sound on log submission. Plus security and quality cleanup.

**`3282e1f` — smoll bets prototype — all core flows, accessibility, and security**
The full functional prototype landed in one commit: auth, circle creation, invite, log, leaderboard, settlement, profile, accessibility baseline, and a security pass.

---

## 2026-04-22

**`180eea7` — Initial commit from Create Next App**
Day zero.

---

## supabase migrations (run in the supabase SQL editor)

These ship as `.sql` files in the repo root and need to be applied in order to the supabase project. Idempotent unless noted.

| file | run for | added |
|---|---|---|
| `supabase-schema.sql` | initial schema | day zero |
| `supabase-fix-rls.sql` | RLS hardening | early |
| `supabase-security-fixes.sql` | further RLS + indexes | early |
| `supabase-verification-both.sql` | adds `verification = 'both'` value and default | 2026-04-27 (tier 0) |
| `supabase-creator-can-delete-logs.sql` | needed for `resetCircleProgress` to actually delete | 2026-05-01 (active-circle edit) |
| `supabase-reactions.sql` | reactions table + RLS + realtime | 2026-05-02 (tier 1) |
| `supabase-logs-pagination-index.sql` | `(circle_id, logged_at desc)` index | 2026-05-02 (pagination) |
| `supabase-feedback.sql` | feedback table + insert-only RLS | 2026-05-06 (account lifecycle bundle) |

---

## environment variables

Required in both `.env.local` and Vercel project settings.

| name | scope | what it is |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | public | supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | supabase anon key (RLS-protected) |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | needed by `/api/delete-account` to delete auth users. never prefix with `NEXT_PUBLIC_` |
| `NEXT_PUBLIC_SENTRY_DSN` | public | sentry DSN. without this, prod sentry silently no-ops |
