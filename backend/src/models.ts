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
