import { apiFetch } from "./apiClient";
import { QuestionProgress, ReviewSummary } from "./reviewState";

export const fetchReviewQueue = async (payload: {
  availableQuestions: Array<{ questionId: string; skillId: string }>;
}): Promise<ReviewSummary> =>
  apiFetch<ReviewSummary>("/review/queue", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const postQuestionAttempt = async (payload: {
  questionId: string;
  skillId: string;
  correct: boolean;
  timeToCompleteMs: number;
}): Promise<QuestionProgress> =>
  apiFetch<QuestionProgress>("/review/attempt", {
    method: "POST",
    body: JSON.stringify(payload),
  });
