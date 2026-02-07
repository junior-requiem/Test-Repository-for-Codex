import { UserProgress } from "./models";
import { createInitialProgress } from "./progressService";

let progress: UserProgress = createInitialProgress();

export const getProgress = () => progress;

export const setProgress = (updated: UserProgress) => {
  progress = updated;
};
