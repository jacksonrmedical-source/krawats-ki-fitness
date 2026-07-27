# Practice — Fitness Course Platform

An interface-first course platform: the site works with **zero courses**
loaded and stays fully functional as courses are added later through
`/admin` — no code changes needed to publish new content.

## Stack
- **Next.js 14** (App Router) — frontend + server components
- **Supabase** — Postgres DB, Auth, Row Level Security
- **Bunny Stream** — video hosting with signed, expiring, domain-locked URLs
- **Razorpay** — payments (checkout route not yet wired — see below)
- **Tailwind CSS** — styling, using the token system in `tailwind.config.ts`

## Getting started
1. `npm install`
2. Create a Supabase project, then run `supabase/schema.sql` in the SQL editor
3. Copy `.env.example` to `.env.local` and fill in your keys
4. In Supabase, manually set your own user's `profiles.role` to `'admin'`
   after your first sign-up, so you can access `/admin`
5. `npm run dev`

## What's built
- `/` — homepage (hero, YouTube bridge section, course preview)
- `/courses` — full catalog, dynamic, has an empty state
- `/courses/[slug]` — syllabus page, renders any course's modules/lessons
- `/learn/[lessonId]` — video player with free-preview + enrollment gating
- `/admin` — course list
- `/admin/courses/new` — create a course
- `/admin/courses/[id]` — add modules, add lessons, attach video IDs,
  toggle free preview per lesson, publish/unpublish the course

## Checkout (Razorpay — test mode)
- `app/api/checkout/create-order/route.ts` — creates a Razorpay order
  server-side; price is always looked up from the DB, never trusted from
  the client
- `app/api/checkout/verify/route.ts` — verifies the payment signature
  server-side before writing the `enrollments` row (free courses skip
  Razorpay and enroll directly)
- `components/EnrollButton.tsx` — opens the Razorpay checkout widget,
  calls verify on success

### Demo setup (test mode, no live account needed)
1. Sign up at https://dashboard.razorpay.com — the account starts in
   **Test Mode** by default, no approval wait
2. Dashboard → Settings → API Keys → **Generate Test Key** — copy the
   Key ID and Key Secret into `.env.local` as `RAZORPAY_KEY_ID` /
   `RAZORPAY_KEY_SECRET`
3. Publish a course with a non-zero price from `/admin`, visit its
   `/courses/[slug]` page, click Enroll
4. Use Razorpay's published test card (any future expiry, any CVV;
   check "Test Card Numbers" in their docs — the number itself isn't
   secret, it's just a sandbox value) to complete a fake payment
5. On success you'll see the enrollment row appear in Supabase's
   `enrollments` table and the lesson pages unlock immediately

Swap the test keys for her live keys later — no code changes needed,
just new environment variables.

## Not yet built (next steps)
- Student `/dashboard` (progress rings, resume-where-left-off) — nav
  currently links to `/dashboard` but the page doesn't exist yet
- Image/thumbnail upload for course covers (Supabase Storage)
- Certificate-of-completion PDF generation
- Admin drag-to-reorder for modules/lessons (currently uses `sort_order`,
  set manually)

## Video protection
`lib/video.ts` signs Bunny Stream playback URLs so they expire after an
hour and only play from your domain — this is what stops the client's
paid, copyrighted content from being freely reshared. Set the same
signing key in the Bunny Stream dashboard under the video library's
security settings.

## Design tokens
See `tailwind.config.ts` — palette is grounded in dawn/dusk practice
light (deep ink blue, sunrise gold, clay, sage) rather than a generic
template look. The "breath ring" animation in `globals.css` is the
signature motion element, used for the hero and can be extended to
progress indicators.
