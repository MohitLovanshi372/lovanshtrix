# LOVANSTRIX redesign notes

## What changed
- Light-blue premium theme (electric blue #155EEF, navy #102B59, violet accent), white cards, soft shadows.
- New homepage (`src/components/HomePage.tsx`): hero, 6 service cards, 5 solutions, portfolio, 5-step process,
  about (mission/vision), careers/internships, FAQ, enquiry form (existing `ContactQuoteSection`), contact CTA, footer.
- Motion: animated headline + typing line, 3D pointer-tilt cards, slide/tilt reveals, parallax glow background,
  scroll progress bar, once-per-session intro splash (skippable, disabled for reduced-motion users).
- Hero visual is pure SVG/CSS (no WebGL), so three.js is no longer in the main bundle (~1.59 MB -> ~0.98 MB).
  `Interactive3DCore.tsx` and `HeroGeometricIllustration` are kept in the repo but no longer used on the home page.

## Security changes (server.ts)
- Admin API fails closed: with no `ADMIN_PASSCODE` every `/api/admin/*` route returns 503 (previously an open "preview mode").
- Signed, expiring, role-scoped tokens (HMAC with `SESSION_SECRET`); constant-time passcode compare; login rate limits.
- Rate limits and length caps on enquiry / career-interest / scope-estimator endpoints.
- Placeholder GitHub/LinkedIn links from the old seed are removed on load; admin-entered links are kept.
- `data/` (JSON store + private resumes) is now git-ignored.

## Needs configuration before production
- `ADMIN_PASSCODE` (16+ chars) and `SESSION_SECRET` (`openssl rand -hex 32`) in the server environment.
- `SMTP_WEBHOOK_URL` for email delivery of enquiries (otherwise they are saved only; the UI says so).
- `COMPANY_WHATSAPP` for the WhatsApp button (hidden until set).
- `GEMINI_API_KEY` for the AI scope estimator (server-side only).
- Authorized signatory name/designation in Internship Admin (needed for offer letters and certificates).
- Real portfolio demo/GitHub links and openings via the Admin Console. Nothing is invented.
- Storage is the server's JSON file, not Firebase. `firestore.rules` is a reference only; no Firebase client is wired in.
- The host needs a persistent disk, otherwise data resets on redeploy.
