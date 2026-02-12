import { UserProgress } from "./models";
import { createInitialProgress } from "./progressService";
import { supabaseAdmin } from "./supabaseAdmin";

const progressByUserId = new Map<string, UserProgress>();

export const getProgress = (userId: string) => {
  const existing = progressByUserId.get(userId);
  if (existing) {
    return existing;
  }

  const initial = createInitialProgress();
  progressByUserId.set(userId, initial);
  return initial;
};

export const setProgress = (userId: string, updated: UserProgress) => {
  progressByUserId.set(userId, updated);
};
