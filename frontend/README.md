# Frontend

Interactive single-page app with hash routes, Apple-style typography/layout, and a Duolingo-inspired learning path.

## Routes
| Screen | Route |
| --- | --- |
| Home | `/` |
| Learn | `/skills` |
| Practice | `/practice` |
| Review | `/review` |
| Profile | `/profile` |

## UX highlights
- Apple-inspired visual hierarchy (SF/Apple system font stack, clean spacing, rounded cards).
- Duolingo-inspired zig-zag lesson path with one-next-node unlocking.
- Green animated success feedback on correct answers and lightweight confetti burst.
- Persistent daily progress strip with XP, streak, hearts, and quest bars.

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
