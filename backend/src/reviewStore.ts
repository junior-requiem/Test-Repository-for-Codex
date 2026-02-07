import { QuestionAttempt, QuestionProgress } from "./models";

const questionProgress = new Map<string, QuestionProgress>();
const attempts: QuestionAttempt[] = [];

const buildKey = (questionId: string) => questionId;

export const getQuestionProgress = (questionId: string) => questionProgress.get(buildKey(questionId));

export const setQuestionProgress = (progress: QuestionProgress) => {
  questionProgress.set(buildKey(progress.questionId), progress);
};

export const getAllQuestionProgress = () => Array.from(questionProgress.values());

export const addAttempt = (attempt: QuestionAttempt) => {
  attempts.push(attempt);
};

export const getAttempts = () => attempts.slice();
