import {
  QuestionAttempt,
  QuestionProgress,
  ReviewAnalytics,
  ReviewQueueItem,
  ReviewSummary,
} from "./models";
import { addAttempt, getAttempts, getQuestionProgress, setQuestionProgress } from "./reviewStore";

const REVIEW_INTERVALS = [1, 3, 7, 14, 30];
const WEAK_SKILL_THRESHOLD = 0.7;
const MISSED_LOOKBACK_DAYS = 7;

const toIso = (date: Date) => date.toISOString();

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const daysSince = (from: Date, to: Date) => Math.floor((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000));

const computeIntervalDays = (correctStreak: number, wasCorrect: boolean) => {
  if (!wasCorrect) {
    return REVIEW_INTERVALS[0];
  }
  const index = Math.min(correctStreak - 1, REVIEW_INTERVALS.length - 1);
  return REVIEW_INTERVALS[index];
};

const buildDefaultProgress = (questionId: string, skillId: string): QuestionProgress => ({
  questionId,
  skillId,
  lastSeenAt: null,
  correctCount: 0,
  incorrectCount: 0,
  correctStreak: 0,
  lastCorrectAt: null,
  lastIncorrectAt: null,
  intervalDays: REVIEW_INTERVALS[0],
  nextReviewAt: null,
});

export const recordQuestionAttempt = (
  userId: string,
  payload: Omit<QuestionAttempt, "attemptedAt">,
  now = new Date(),
) => {
  const attemptedAt = toIso(now);
  const attempt: QuestionAttempt = { ...payload, attemptedAt };
  addAttempt(userId, attempt);

  const existing = getQuestionProgress(userId, payload.questionId) ?? buildDefaultProgress(payload.questionId, payload.skillId);
  const wasCorrect = payload.correct;
  const correctStreak = wasCorrect ? existing.correctStreak + 1 : 0;
  const intervalDays = computeIntervalDays(correctStreak, wasCorrect);
  const nextReviewAt = toIso(addDays(now, intervalDays));

  const updated: QuestionProgress = {
    ...existing,
    skillId: payload.skillId,
    lastSeenAt: attemptedAt,
    correctCount: existing.correctCount + (wasCorrect ? 1 : 0),
    incorrectCount: existing.incorrectCount + (wasCorrect ? 0 : 1),
    correctStreak,
    lastCorrectAt: wasCorrect ? attemptedAt : existing.lastCorrectAt,
    lastIncorrectAt: wasCorrect ? existing.lastIncorrectAt : attemptedAt,
    intervalDays,
    nextReviewAt,
  };

  setQuestionProgress(userId, updated);
  return updated;
};

export const buildReviewAnalytics = (attempts: QuestionAttempt[]): ReviewAnalytics => {
  const skillBuckets = new Map<
    string,
    { total: number; correct: number; timeTotal: number }
  >();
  let totalAttempts = 0;
  let totalCorrect = 0;
  let totalTime = 0;

  attempts.forEach((attempt) => {
    const bucket = skillBuckets.get(attempt.skillId) ?? { total: 0, correct: 0, timeTotal: 0 };
    bucket.total += 1;
    bucket.correct += attempt.correct ? 1 : 0;
    bucket.timeTotal += Math.max(attempt.timeToCompleteMs, 0);
    skillBuckets.set(attempt.skillId, bucket);
    totalAttempts += 1;
    totalCorrect += attempt.correct ? 1 : 0;
    totalTime += Math.max(attempt.timeToCompleteMs, 0);
  });

  const accuracyBySkill = Array.from(skillBuckets.entries()).map(([skillId, bucket]) => ({
    skillId,
    totalAttempts: bucket.total,
    correctAttempts: bucket.correct,
    accuracy: bucket.total ? bucket.correct / bucket.total : 0,
    averageTimeMs: bucket.total ? Math.round(bucket.timeTotal / bucket.total) : 0,
  }));

  return {
    accuracyBySkill,
    overallAccuracy: totalAttempts ? totalCorrect / totalAttempts : 0,
    averageTimeMs: totalAttempts ? Math.round(totalTime / totalAttempts) : 0,
  };
};

const buildQueueItem = (
  progress: QuestionProgress,
  now: Date,
  weakSkillIds: Set<string>,
): ReviewQueueItem => {
  const isNew = !progress.lastSeenAt;
  const lastIncorrectAt = progress.lastIncorrectAt ? new Date(progress.lastIncorrectAt) : null;
  const missedRecently = lastIncorrectAt ? daysSince(lastIncorrectAt, now) <= MISSED_LOOKBACK_DAYS : false;
  const nextReviewAt = progress.nextReviewAt ? new Date(progress.nextReviewAt) : null;
  const isDue = nextReviewAt ? nextReviewAt <= now : false;

  let priority = 0;
  let reason = "scheduled";

  if (isNew) {
    priority = 100;
    reason = "new";
  } else if (missedRecently) {
    priority = 90;
    reason = "missed recently";
  } else if (isDue) {
    priority = 80;
    reason = "due";
  }

  if (weakSkillIds.has(progress.skillId)) {
    priority += 10;
    reason = reason === "scheduled" ? "weak skill" : `${reason} + weak skill`;
  }

  return {
    questionId: progress.questionId,
    skillId: progress.skillId,
    priority,
    reason,
    nextReviewAt: progress.nextReviewAt,
  };
};

export const buildReviewSummary = (
  userId: string,
  availableQuestions: Array<{ questionId: string; skillId: string }>,
  now = new Date(),
): ReviewSummary => {
  const attempts = getAttempts(userId);
  const analytics = buildReviewAnalytics(attempts);
  const weakSkills = analytics.accuracyBySkill
    .filter((skill) => skill.totalAttempts === 0 || skill.accuracy < WEAK_SKILL_THRESHOLD)
    .map((skill) => skill.skillId);

  const weakSkillSet = new Set(weakSkills);
  const progressList = availableQuestions.map((question) => {
    const existing = getQuestionProgress(userId, question.questionId);
    return existing ?? buildDefaultProgress(question.questionId, question.skillId);
  });

  const queue = progressList
    .map((progress) => buildQueueItem(progress, now, weakSkillSet))
    .sort((a, b) => b.priority - a.priority);

  return {
    queue,
    weakSkills,
    analytics,
    questionProgress: progressList,
  };
};
