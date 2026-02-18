# Backend

## Data Model Overview
The backend tracks skills and lessons plus question types for practice sessions. See `src/models.ts` for the initial schema definitions.

## Supabase persistence
Set the following environment variables for the backend:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Apply the SQL schema in `supabase/schema.sql` to create persistence tables and indexes for progress and review flows.
