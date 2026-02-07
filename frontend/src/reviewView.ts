import { buildReviewViewModel, ReviewState } from "./reviewState";

const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

export const renderReviewSummary = (state: ReviewState) => {
  const viewModel = buildReviewViewModel(state);
  const queueSummary = viewModel.queue
    .slice(0, 5)
    .map((item) => `${item.questionId} (${item.reason})`)
    .join(", ");

  return {
    queueCount: `Review queue: ${viewModel.queue.length} questions`,
    nextUp: `Next up: ${queueSummary || "No questions queued"}`,
    weakSkills: `Weak skills: ${viewModel.weakSkills.join(", ") || "None"}`,
    accuracy: `Overall accuracy: ${formatPercent(viewModel.analytics.overallAccuracy)}`,
    averageTime: `Average time: ${viewModel.analytics.averageTimeMs}ms`,
    skillBreakdown: viewModel.analytics.accuracyBySkill.map(
      (skill) =>
        `${skill.skillId}: ${formatPercent(skill.accuracy)} (${skill.averageTimeMs}ms avg)`,
    ),
  };
};
