import { ProgressStatus } from "./progressState";

export const fetchProgressStatus = async (): Promise<ProgressStatus> => {
  const response = await fetch("/progress");
  if (!response.ok) {
    throw new Error("Failed to fetch progress");
  }
  return response.json();
};

export const postLessonComplete = async (payload: {
  xpEarned: number;
  heartsChange?: number;
  badgesEarned?: string[];
}): Promise<ProgressStatus> => {
  const response = await fetch("/progress/lesson-complete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to update progress");
  }

  return response.json();
};
