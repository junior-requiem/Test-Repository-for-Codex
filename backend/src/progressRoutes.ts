import { applyLessonCompletion, getXpToNextLevel } from "./progressService";
import { getProgress, setProgress } from "./progressStore";

export interface Request<TBody = unknown> {
  body: TBody;
}

export interface Response<TBody = unknown> {
  json: (body: TBody) => void;
  status: (code: number) => Response<TBody>;
}

export interface Router {
  get: (path: string, handler: (req: Request, res: Response) => void) => void;
  post: (path: string, handler: (req: Request, res: Response) => void) => void;
}

export const registerProgressRoutes = (router: Router) => {
  router.get("/progress", (_req, res) => {
    const progress = getProgress();
    res.json({
      progress,
      xpToNextLevel: getXpToNextLevel(progress.xp),
    });
  });

  router.post("/progress/lesson-complete", (req, res) => {
    const { xpEarned, heartsChange, badgesEarned } = req.body as {
      xpEarned: number;
      heartsChange?: number;
      badgesEarned?: string[];
    };

    if (typeof xpEarned !== "number") {
      res.status(400).json({ message: "xpEarned must be provided" });
      return;
    }

    const { updatedProgress, levelUp } = applyLessonCompletion(getProgress(), {
      xpEarned,
      heartsChange,
      badgesEarned,
    });

    setProgress(updatedProgress);
    res.json({
      progress: updatedProgress,
      xpToNextLevel: getXpToNextLevel(updatedProgress.xp),
      levelUp,
    });
  });
};
