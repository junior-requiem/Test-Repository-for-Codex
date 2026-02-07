import { UserProgress } from "./models";

const LEVEL_THRESHOLDS = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200];
const MAX_HEARTS = 5;

const normalizeDate = (date: Date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const toDateString = (date: Date) => normalizeDate(date).toISOString();

const daysBetween = (from: Date, to: Date) => {
  const start = normalizeDate(from).getTime();
  const end = normalizeDate(to).getTime();
  return Math.round((end - start) / (24 * 60 * 60 * 1000));
};

export const getLevelForXp = (xp: number) => {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i -= 1) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
};

export const getXpToNextLevel = (xp: number) => {
  const level = getLevelForXp(xp);
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  return Math.max(nextThreshold - xp, 0);
};

export const getStreakUpdate = (lastActiveDate: string | null, today: Date) => {
  if (!lastActiveDate) {
    return "start";
  }

  const lastActive = new Date(lastActiveDate);
  const diff = daysBetween(lastActive, today);

  if (diff === 0) {
    return "same";
  }

  if (diff === 1) {
    return "increment";
  }

  return "reset";
};

export const applyLessonCompletion = (
  progress: UserProgress,
  payload: { xpEarned: number; heartsChange?: number; badgesEarned?: string[] },
  now = new Date(),
) => {
  const xpEarned = Math.max(payload.xpEarned, 0);
  const streakUpdate = getStreakUpdate(progress.lastActiveDate, now);
  const newStreak = (() => {
    switch (streakUpdate) {
      case "same":
        return progress.streakCount;
      case "increment":
        return progress.streakCount + 1;
      case "reset":
      case "start":
      default:
        return 1;
    }
  })();

  const heartsChange = payload.heartsChange ?? 0;
  const newHearts = Math.min(Math.max(progress.hearts + heartsChange, 0), MAX_HEARTS);

  const updatedXp = progress.xp + xpEarned;
  const updatedLevel = getLevelForXp(updatedXp);
  const newBadges = payload.badgesEarned ?? [];

  return {
    updatedProgress: {
      ...progress,
      xp: updatedXp,
      level: updatedLevel,
      streakCount: newStreak,
      lastActiveDate: toDateString(now),
      hearts: newHearts,
      badges: Array.from(new Set([...progress.badges, ...newBadges])),
    },
    levelUp: updatedLevel > progress.level,
  };
};

export const createInitialProgress = (): UserProgress => ({
  xp: 0,
  level: 1,
  streakCount: 0,
  lastActiveDate: null,
  hearts: MAX_HEARTS,
  badges: [],
});

export { LEVEL_THRESHOLDS, MAX_HEARTS };
