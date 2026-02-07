export type QuestionType = "multiple_choice" | "fill_in" | "matching";

export interface Skill {
  id: string;
  name: string;
  description: string;
  prerequisites: string[];
  lessonIds: string[];
  unlockCriteria: string;
}

export interface Lesson {
  id: string;
  skillId: string;
  title: string;
  summary: string;
  contentBlocks: string[];
  questionIds: string[];
}

export interface QuestionBase {
  id: string;
  lessonId: string;
  type: QuestionType;
  prompt: string;
}

export interface MultipleChoiceQuestion extends QuestionBase {
  type: "multiple_choice";
  options: Array<{ id: string; text: string }>;
  correctOptionIds: string[];
}

export interface FillInQuestion extends QuestionBase {
  type: "fill_in";
  correctAnswer: string;
  acceptableAnswers?: string[];
}

export interface MatchingQuestion extends QuestionBase {
  type: "matching";
  pairs: Array<{ left: string; right: string }>;
}

export type Question =
  | MultipleChoiceQuestion
  | FillInQuestion
  | MatchingQuestion;

export interface UserProgress {
  xp: number;
  level: number;
  streakCount: number;
  lastActiveDate: string | null;
  hearts: number;
  badges: string[];
}

export interface QuestionAttempt {
  questionId: string;
  skillId: string;
  correct: boolean;
  timeToCompleteMs: number;
  attemptedAt: string;
}

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

export interface ReviewQueueItem {
  questionId: string;
  skillId: string;
  priority: number;
  reason: string;
  nextReviewAt: string | null;
}

export interface ReviewSummary {
  queue: ReviewQueueItem[];
  weakSkills: string[];
  analytics: ReviewAnalytics;
  questionProgress: QuestionProgress[];
}
