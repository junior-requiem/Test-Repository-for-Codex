export interface UserProgress {
  xp: number;
  level: number;
  streakCount: number;
  lastActiveDate: string | null;
  hearts: number;
  badges: string[];
}

export interface ProgressStatus {
  progress: UserProgress;
  xpToNextLevel: number;
  levelUp?: boolean;
}

export interface ProgressState {
  progress: UserProgress;
  xpToNextLevel: number;
  levelUpEvent: boolean;
}

const LEVEL_THRESHOLDS = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200];

export const initialProgressState: ProgressState = {
  progress: {
    xp: 0,
    level: 1,
    streakCount: 0,
    lastActiveDate: null,
    hearts: 5,
    badges: [],
  },
  xpToNextLevel: 100,
  levelUpEvent: false,
};

const getLevelFloor = (level: number) => LEVEL_THRESHOLDS[level - 1] ?? 0;
const getLevelCeiling = (level: number) => LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];

export const updateProgressState = (state: ProgressState, status: ProgressStatus): ProgressState => ({
  progress: status.progress,
  xpToNextLevel: status.xpToNextLevel,
  levelUpEvent: Boolean(status.levelUp),
});

export const clearLevelUpEvent = (state: ProgressState): ProgressState => ({
  ...state,
  levelUpEvent: false,
});

export const buildProgressViewModel = (state: ProgressState) => {
  const { progress, xpToNextLevel, levelUpEvent } = state;
  const levelFloor = getLevelFloor(progress.level);
  const levelCeiling = getLevelCeiling(progress.level);
  const xpIntoLevel = Math.max(progress.xp - levelFloor, 0);
  const xpRange = Math.max(levelCeiling - levelFloor, 1);
  const xpPercent = Math.min(Math.round((xpIntoLevel / xpRange) * 100), 100);

  return {
    streakCount: progress.streakCount,
    hearts: progress.hearts,
    xp: progress.xp,
    level: progress.level,
    xpToNextLevel,
    xpPercent,
    levelUpEvent,
  };
};
