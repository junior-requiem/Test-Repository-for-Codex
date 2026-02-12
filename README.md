# Test-Repository-for-Codex

## Learning Flow
1. **Onboarding**: welcome, profile setup, and placement signals.
2. **Skill Tree**: visualize available skills and unlock paths.
3. **Lessons**: focused content for a selected skill.
4. **Practice**: interactive questions to apply the lesson.
5. **Review**: recap progress, spaced repetition, and feedback.

## Initial Screens
- Home
- SkillTree
- Lesson
- Practice
- Review
- Profile

## Frontend Supabase configuration
The frontend requires Supabase settings and supports two config patterns:

1. **Build-time env vars** (for bundlers):
   - `SUPABASE_URL` or `VITE_SUPABASE_URL`
   - `SUPABASE_ANON_KEY` or `VITE_SUPABASE_ANON_KEY`
2. **Injected runtime config** (for static hosting):
   - Define `window.__APP_CONFIG__ = { SUPABASE_URL, SUPABASE_ANON_KEY }` in `frontend/index.html` before loading `src/app.js`.

If these values are missing, the app shows a clear bootstrap configuration error and stops startup.

## Supabase project setup checklist
1. Create a Supabase project and copy:
   - Project URL (`SUPABASE_URL`)
   - Project anon/public key (`SUPABASE_ANON_KEY`)
2. In **Authentication → Providers**, enable your desired login providers (for example Email or Google).
3. In **Authentication → URL Configuration**, add your frontend URL(s):
   - Local: `http://localhost:4173`
   - Hosted app URL(s)
   - Login callback/redirect target(s) used by your app (for example `/login` return routes).
4. In **Authentication → Email Templates / SMTP settings**, configure sender details and (optionally) custom SMTP for production email delivery.
5. Verify sign-in and session refresh flow from the frontend before releasing.
