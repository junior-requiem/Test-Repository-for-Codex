import { QuestionAttempt, QuestionProgress } from "./models";
import { supabaseAdmin } from "./supabaseAdmin";

interface QuestionProgressRow {
  user_id: string;
  question_id: string;
  skill_id: string;
  last_seen_at: string | null;
  correct_count: number;
  incorrect_count: number;
  correct_streak: number;
  last_correct_at: string | null;
  last_incorrect_at: string | null;
  interval_days: number;
  next_review_at: string | null;
}

interface QuestionAttemptRow {
  user_id: string;
  question_id: string;
  skill_id: string;
  correct: boolean;
  time_to_complete_ms: number;
  attempted_at: string;
}

const progressRowToModel = (row: QuestionProgressRow): QuestionProgress => ({
  questionId: row.question_id,
  skillId: row.skill_id,
  lastSeenAt: row.last_seen_at,
  correctCount: row.correct_count,
  incorrectCount: row.incorrect_count,
  correctStreak: row.correct_streak,
  lastCorrectAt: row.last_correct_at,
  lastIncorrectAt: row.last_incorrect_at,
  intervalDays: row.interval_days,
  nextReviewAt: row.next_review_at,
});

const progressModelToRow = (userId: string, progress: QuestionProgress): QuestionProgressRow => ({
  user_id: userId,
  question_id: progress.questionId,
  skill_id: progress.skillId,
  last_seen_at: progress.lastSeenAt,
  correct_count: progress.correctCount,
  incorrect_count: progress.incorrectCount,
  correct_streak: progress.correctStreak,
  last_correct_at: progress.lastCorrectAt,
  last_incorrect_at: progress.lastIncorrectAt,
  interval_days: progress.intervalDays,
  next_review_at: progress.nextReviewAt,
});

const attemptRowToModel = (row: QuestionAttemptRow): QuestionAttempt => ({
  questionId: row.question_id,
  skillId: row.skill_id,
  correct: row.correct,
  timeToCompleteMs: row.time_to_complete_ms,
  attemptedAt: row.attempted_at,
});

const attemptModelToRow = (userId: string, attempt: QuestionAttempt): QuestionAttemptRow => ({
  user_id: userId,
  question_id: attempt.questionId,
  skill_id: attempt.skillId,
  correct: attempt.correct,
  time_to_complete_ms: attempt.timeToCompleteMs,
  attempted_at: attempt.attemptedAt,
});

export const getQuestionProgress = async (userId: string, questionId: string) => {
  const { data, error } = await supabaseAdmin
    .from("question_progress")
    .select(
      "user_id,question_id,skill_id,last_seen_at,correct_count,incorrect_count,correct_streak,last_correct_at,last_incorrect_at,interval_days,next_review_at",
    )
    .eq("user_id", userId)
    .eq("question_id", questionId)
    .maybeSingle<QuestionProgressRow>();

  if (error) {
    throw new Error(`Failed to load question progress: ${error.message}`);
  }

  return data ? progressRowToModel(data) : undefined;
};

export const setQuestionProgress = async (userId: string, progress: QuestionProgress) => {
  const payload = progressModelToRow(userId, progress);
  const { error } = await supabaseAdmin
    .from("question_progress")
    .upsert(payload, { onConflict: "user_id,question_id" });

  if (error) {
    throw new Error(`Failed to persist question progress: ${error.message}`);
  }
};

export const getAllQuestionProgress = async (userId: string) => {
  const { data, error } = await supabaseAdmin
    .from("question_progress")
    .select(
      "user_id,question_id,skill_id,last_seen_at,correct_count,incorrect_count,correct_streak,last_correct_at,last_incorrect_at,interval_days,next_review_at",
    )
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to list question progress: ${error.message}`);
  }

  return (data ?? []).map((row) => progressRowToModel(row as QuestionProgressRow));
};

export const addAttempt = async (userId: string, attempt: QuestionAttempt) => {
  const payload = attemptModelToRow(userId, attempt);
  const { error } = await supabaseAdmin.from("question_attempts").insert(payload);

  if (error) {
    throw new Error(`Failed to persist question attempt: ${error.message}`);
  }
};

export const getAttempts = async (userId: string) => {
  const { data, error } = await supabaseAdmin
    .from("question_attempts")
    .select("user_id,question_id,skill_id,correct,time_to_complete_ms,attempted_at")
    .eq("user_id", userId)
    .order("attempted_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to list attempts: ${error.message}`);
  }

  return (data ?? []).map((row) => attemptRowToModel(row as QuestionAttemptRow));
};
