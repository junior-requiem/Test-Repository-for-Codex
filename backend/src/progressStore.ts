import { UserProgress } from "./models";
import { createInitialProgress } from "./progressService";
import { supabaseAdmin } from "./supabaseAdmin";

interface UserProgressRow {
  user_id: string;
  xp: number;
  level: number;
  streak_count: number;
  last_active_date: string | null;
  hearts: number;
  badges: string[];
  updated_at?: string;
}

const toModel = (row: UserProgressRow): UserProgress => ({
  xp: row.xp,
  level: row.level,
  streakCount: row.streak_count,
  lastActiveDate: row.last_active_date,
  hearts: row.hearts,
  badges: row.badges ?? [],
});

const toRow = (userId: string, progress: UserProgress): UserProgressRow => ({
  user_id: userId,
  xp: progress.xp,
  level: progress.level,
  streak_count: progress.streakCount,
  last_active_date: progress.lastActiveDate,
  hearts: progress.hearts,
  badges: progress.badges,
});

export const getProgress = async (userId: string): Promise<UserProgress> => {
  const { data, error } = await supabaseAdmin
    .from("user_progress")
    .select("user_id, xp, level, streak_count, last_active_date, hearts, badges")
    .eq("user_id", userId)
    .maybeSingle<UserProgressRow>();

  if (error) {
    throw new Error(`Failed to fetch user progress: ${error.message}`);
  }

  return data ? toModel(data) : createInitialProgress();
};

export const setProgress = async (userId: string, updated: UserProgress): Promise<void> => {
  const { error } = await supabaseAdmin.from("user_progress").upsert(toRow(userId, updated), {
    onConflict: "user_id",
  });

  if (error) {
    throw new Error(`Failed to save user progress: ${error.message}`);
  }
};
