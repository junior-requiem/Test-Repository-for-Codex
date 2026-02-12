create table if not exists public.user_progress (
  user_id text primary key,
  xp integer not null default 0,
  level integer not null default 1,
  streak_count integer not null default 0,
  last_active_date timestamptz,
  hearts integer not null default 5,
  badges text[] not null default '{}',
  updated_at timestamptz not null default now(),
  constraint user_progress_xp_non_negative check (xp >= 0),
  constraint user_progress_level_positive check (level >= 1),
  constraint user_progress_streak_non_negative check (streak_count >= 0),
  constraint user_progress_hearts_non_negative check (hearts >= 0)
);

create table if not exists public.question_progress (
  user_id text not null,
  question_id text not null,
  skill_id text not null,
  last_seen_at timestamptz,
  correct_count integer not null default 0,
  incorrect_count integer not null default 0,
  correct_streak integer not null default 0,
  last_correct_at timestamptz,
  last_incorrect_at timestamptz,
  interval_days integer not null default 1,
  next_review_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, question_id),
  constraint question_progress_correct_count_non_negative check (correct_count >= 0),
  constraint question_progress_incorrect_count_non_negative check (incorrect_count >= 0),
  constraint question_progress_correct_streak_non_negative check (correct_streak >= 0),
  constraint question_progress_interval_days_positive check (interval_days > 0)
);

create table if not exists public.question_attempts (
  id bigint generated always as identity primary key,
  user_id text not null,
  question_id text not null,
  skill_id text not null,
  correct boolean not null,
  time_to_complete_ms integer not null default 0,
  attempted_at timestamptz not null,
  constraint question_attempts_time_non_negative check (time_to_complete_ms >= 0)
);

create index if not exists idx_question_progress_user_next_review
  on public.question_progress (user_id, next_review_at);

create index if not exists idx_question_progress_user_question
  on public.question_progress (user_id, question_id);

create index if not exists idx_question_attempts_user_attempted
  on public.question_attempts (user_id, attempted_at desc);

create index if not exists idx_question_attempts_user_question_attempted
  on public.question_attempts (user_id, question_id, attempted_at desc);
