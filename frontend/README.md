# Frontend

Interactive single-page app with hash routes and a Duolingo-style HCM learning path.

## Routes
| Screen | Route |
| --- | --- |
| Home | `/` |
| Path | `/skills` |
| Practice | `/practice` |
| Review | `/review` |
| Profile | `/profile` |

## Ordered HCM path
1. Core HR
2. Benefits
3. Payroll
4. Talent

Each lesson node is locked until all previous lessons are completed.

## Run locally
From the repository root:

```bash
python3 -m http.server 4173 --directory frontend
```

Then open: `http://localhost:4173`.
