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

const toQuestionProgressModel = (row: QuestionProgressRow): QuestionProgress => ({
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

const toQuestionProgressRow = (userId: string, progress: QuestionProgress): QuestionProgressRow => ({
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

const toAttemptModel = (row: QuestionAttemptRow): QuestionAttempt => ({
  questionId: row.question_id,
  skillId: row.skill_id,
  correct: row.correct,
  timeToCompleteMs: row.time_to_complete_ms,
  attemptedAt: row.attempted_at,
});

const toAttemptRow = (userId: string, attempt: QuestionAttempt): QuestionAttemptRow => ({
  user_id: userId,
  question_id: attempt.questionId,
  skill_id: attempt.skillId,
  correct: attempt.correct,
  time_to_complete_ms: attempt.timeToCompleteMs,
  attempted_at: attempt.attemptedAt,
});

export const getQuestionProgress = async (
  userId: string,
  questionId: string,
): Promise<QuestionProgress | undefined> => {
  const { data, error } = await supabaseAdmin
    .from("question_progress")
    .select(
      "user_id, question_id, skill_id, last_seen_at, correct_count, incorrect_count, correct_streak, last_correct_at, last_incorrect_at, interval_days, next_review_at",
    )
    .eq("user_id", userId)
    .eq("question_id", questionId)
    .maybeSingle<QuestionProgressRow>();

  if (error) {
    throw new Error(`Failed to fetch question progress: ${error.message}`);
  }

  return data ? toQuestionProgressModel(data) : undefined;
};

export const setQuestionProgress = async (userId: string, progress: QuestionProgress): Promise<void> => {
  const { error } = await supabaseAdmin.from("question_progress").upsert(toQuestionProgressRow(userId, progress), {
    onConflict: "user_id,question_id",
  });

  if (error) {
    throw new Error(`Failed to save question progress: ${error.message}`);
  }
};

export const getAllQuestionProgress = async (
  userId: string,
  questionIds: string[],
): Promise<QuestionProgress[]> => {
  if (!questionIds.length) {
    return [];
  }

  const { data, error } = await supabaseAdmin
    .from("question_progress")
    .select(
      "user_id, question_id, skill_id, last_seen_at, correct_count, incorrect_count, correct_streak, last_correct_at, last_incorrect_at, interval_days, next_review_at",
    )
    .eq("user_id", userId)
    .in("question_id", questionIds);

  if (error) {
    throw new Error(`Failed to fetch question progress list: ${error.message}`);
  }

  return (data ?? []).map((row) => toQuestionProgressModel(row as QuestionProgressRow));
};

export const addAttempt = async (userId: string, attempt: QuestionAttempt): Promise<void> => {
  const { error } = await supabaseAdmin.from("question_attempts").insert(toAttemptRow(userId, attempt));

  if (error) {
    throw new Error(`Failed to insert question attempt: ${error.message}`);
  }
};

export const getAttempts = async (userId: string): Promise<QuestionAttempt[]> => {
  const { data, error } = await supabaseAdmin
    .from("question_attempts")
    .select("user_id, question_id, skill_id, correct, time_to_complete_ms, attempted_at")
    .eq("user_id", userId)
    .order("attempted_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch attempts: ${error.message}`);
  }

  return (data ?? []).map((row) => toAttemptModel(row as QuestionAttemptRow));
};
