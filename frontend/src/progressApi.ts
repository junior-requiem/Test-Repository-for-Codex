import { apiFetch } from "./apiClient";
import { ProgressStatus } from "./progressState";

export const fetchProgressStatus = async (): Promise<ProgressStatus> => apiFetch<ProgressStatus>("/progress");

export const postLessonComplete = async (payload: {
  xpEarned: number;
  heartsChange?: number;
  badgesEarned?: string[];
}): Promise<ProgressStatus> =>
  apiFetch<ProgressStatus>("/progress/lesson-complete", {
    method: "POST",
    body: JSON.stringify(payload),
  });
