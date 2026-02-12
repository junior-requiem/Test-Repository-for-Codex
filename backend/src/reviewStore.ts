import { QuestionAttempt, QuestionProgress } from "./models";
import { supabaseAdmin } from "./supabaseAdmin";

interface UserReviewState {
  questionProgress: Map<string, QuestionProgress>;
  attempts: QuestionAttempt[];
}

const reviewStateByUser = new Map<string, UserReviewState>();

const getUserState = (userId: string): UserReviewState => {
  const existing = reviewStateByUser.get(userId);
  if (existing) {
    return existing;
  }

  const initialState: UserReviewState = {
    questionProgress: new Map<string, QuestionProgress>(),
    attempts: [],
  };

  reviewStateByUser.set(userId, initialState);
  return initialState;
};

export const getQuestionProgress = (userId: string, questionId: string) => {
  return getUserState(userId).questionProgress.get(questionId);
};

export const setQuestionProgress = (userId: string, progress: QuestionProgress) => {
  getUserState(userId).questionProgress.set(progress.questionId, progress);
};

export const getAllQuestionProgress = (userId: string) => {
  return Array.from(getUserState(userId).questionProgress.values());
};

export const addAttempt = (userId: string, attempt: QuestionAttempt) => {
  getUserState(userId).attempts.push(attempt);
};

export const getAttempts = (userId: string) => {
  return getUserState(userId).attempts.slice();
};
