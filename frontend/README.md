# Frontend

Interactive single-page app with hash routes, a Duolingo-style section path, and animated green success feedback for correct answers.

## Routes
| Screen | Route |
| --- | --- |
| Home | `/` |
| Learn | `/skills` |
| Practice | `/practice` |
| Review | `/review` |
| Profile | `/profile` |

## Ordered learning path
- Unit 1: Core HR foundations
- Unit 2: Benefits and payroll
- Unit 3: Talent and performance

Each lesson node is locked until all previous lessons are completed.

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


## Interaction highlights
- Duolingo-inspired section cards and alternating path nodes.
- Only the next lesson node is unlocked at a time.
- Correct answers trigger green success animations and lesson completion states.
