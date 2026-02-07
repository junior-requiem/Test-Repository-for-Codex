import { QuestionProgress, ReviewSummary } from "./reviewState";

export const fetchReviewQueue = async (payload: {
  availableQuestions: Array<{ questionId: string; skillId: string }>;
}): Promise<ReviewSummary> => {
  const response = await fetch("/review/queue", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch review queue");
  }

  return response.json();
};

export const postQuestionAttempt = async (payload: {
  questionId: string;
  skillId: string;
  correct: boolean;
  timeToCompleteMs: number;
}): Promise<QuestionProgress> => {
  const response = await fetch("/review/attempt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to record review attempt");
  }

  return response.json();
};
