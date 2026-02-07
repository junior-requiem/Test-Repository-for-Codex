import { buildProgressViewModel, ProgressState } from "./progressState";

const renderHearts = (hearts: number) => "❤️".repeat(hearts).padEnd(5, "♡");

export const renderProgressSummary = (state: ProgressState) => {
  const viewModel = buildProgressViewModel(state);
  const xpBar = `[${"█".repeat(Math.round(viewModel.xpPercent / 10)).padEnd(10, "░")}]`;
  const levelUpMessage = viewModel.levelUpEvent ? "🎉 Level up!" : "";

  return {
    streak: `Streak: ${viewModel.streakCount} days`,
    hearts: `Hearts: ${renderHearts(viewModel.hearts)}`,
    xp: `XP: ${viewModel.xp} (${viewModel.xpToNextLevel} to next level)`,
    level: `Level: ${viewModel.level}`,
    xpBar: `XP Bar: ${xpBar} ${viewModel.xpPercent}%`,
    levelUpMessage,
  };
};
