# Frontend

Interactive single-page app with hash routes, Apple-style typography/layout, and Duolingo-inspired engagement patterns tuned for Oracle Fusion training.

## Required Supabase configuration
Set Supabase values with either build-time variables or runtime injection:

### Option A: Build-time environment variables
- `SUPABASE_URL` (or `VITE_SUPABASE_URL`)
- `SUPABASE_ANON_KEY` (or `VITE_SUPABASE_ANON_KEY`)

### Option B: Runtime injected configuration
In `frontend/index.html`, define:

```html
<script>
  window.__APP_CONFIG__ = {
    SUPABASE_URL: "https://your-project.supabase.co",
    SUPABASE_ANON_KEY: "your-anon-key"
  };
</script>
```

The app fails fast at bootstrap with a clear UI error if required values are missing.

## Auth gate toggle (for review/testing)
You can enable/disable route auth gating without code changes:

- URL query override: append `?authGate=off` (or `?authGate=on`) when loading the app.
- Browser console helper: run `toggleAuthGate(false)` to disable and `toggleAuthGate(true)` to re-enable.
- Runtime config: set `window.__APP_CONFIG__.AUTH_GATE_ENABLED = false` before app load.

The selected value is persisted in `localStorage` under `learning-flow-auth-gate-enabled`.

## Routes
| Screen | Route |
| --- | --- |
| Home | `/` |
| Learn | `/skills` |
| Practice | `/practice` |
| Review | `/review` |
| Developer Mode | `/developer` |
| Profile | `/profile` |

## UX highlights
- Apple-inspired visual hierarchy (SF/Apple system font stack, tokenized spacing, rounded cards).
- Duolingo-inspired Module Mastery Map with zig-zag lesson nodes and one-next-node unlocking.
- Right-rail progress node for Fusion Points, Implementation Streak, hearts, and quests so the lesson center area stays focused.
- Green animated success feedback for correct answers, gentle shake/error flash for mistakes, and concise supportive microcopy.
- Developer Mode no-code builder for creating custom units, lessons, and text-answer questions directly in the UI.

## Run locally
From the repository root:

```bash
python3 -m http.server 4173 --directory frontend
```

Then open: `http://localhost:4173`.

## Run from repository root

```bash
python3 -m http.server 4173
```

Then open: `http://localhost:4173` (auto-redirects to `frontend/index.html`).
