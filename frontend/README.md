# Frontend

Interactive single-page app with hash routes, Apple-style typography/layout, and Duolingo-inspired engagement patterns tuned for Oracle Fusion training.

## Routes
| Screen | Route |
| --- | --- |
| Home | `/` |
| Learn | `/skills` |
| Practice | `/practice` |
| Review | `/review` |
| Profile | `/profile` |

## UX highlights
- Apple-inspired visual hierarchy (SF/Apple system font stack, tokenized spacing, rounded cards).
- Duolingo-inspired Module Mastery Map with zig-zag lesson nodes and one-next-node unlocking.
- Right-rail progress node for Fusion Points, Implementation Streak, hearts, and quests so the lesson center area stays focused.
- Green animated success feedback for correct answers, gentle shake/error flash for mistakes, and concise supportive microcopy.

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
