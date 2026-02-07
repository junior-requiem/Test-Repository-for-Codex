export interface QuestionProgress {
  questionId: string;
  skillId: string;
  lastSeenAt: string | null;
  correctCount: number;
  incorrectCount: number;
  correctStreak: number;
  lastCorrectAt: string | null;
  lastIncorrectAt: string | null;
  intervalDays: number;
  nextReviewAt: string | null;
}

export interface ReviewQueueItem {
  questionId: string;
  skillId: string;
  priority: number;
  reason: string;
  nextReviewAt: string | null;
}

export interface SkillAccuracy {
  skillId: string;
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
  averageTimeMs: number;
}

export interface ReviewAnalytics {
  accuracyBySkill: SkillAccuracy[];
  overallAccuracy: number;
  averageTimeMs: number;
}

export interface ReviewSummary {
  queue: ReviewQueueItem[];
  weakSkills: string[];
  analytics: ReviewAnalytics;
  questionProgress: QuestionProgress[];
}

export interface ReviewState {
  queue: ReviewQueueItem[];
  weakSkills: string[];
  analytics: ReviewAnalytics;
  questionProgress: QuestionProgress[];
  lastUpdated: string | null;
}

export const initialReviewState: ReviewState = {
  queue: [],
  weakSkills: [],
  analytics: {
    accuracyBySkill: [],
    overallAccuracy: 0,
    averageTimeMs: 0,
  },
  questionProgress: [],
  lastUpdated: null,
};

export const updateReviewState = (state: ReviewState, summary: ReviewSummary): ReviewState => ({
  ...state,
  queue: summary.queue,
  weakSkills: summary.weakSkills,
  analytics: summary.analytics,
  questionProgress: summary.questionProgress,
  lastUpdated: new Date().toISOString(),
});

export const buildReviewViewModel = (state: ReviewState) => ({
  queue: state.queue,
  weakSkills: state.weakSkills,
  analytics: state.analytics,
  questionProgress: state.questionProgress,
  lastUpdated: state.lastUpdated,
});
