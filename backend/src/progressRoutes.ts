import { applyLessonCompletion, getXpToNextLevel } from "./progressService";
import { getProgress, setProgress } from "./progressStore";

export interface Request<TBody = unknown> {
  body: TBody;
  userId?: string;
}

export interface Response<TBody = unknown> {
  json: (body: TBody) => void;
  status: (code: number) => Response<TBody>;
}

export interface Router {
  get: (path: string, handler: (req: Request, res: Response) => void | Promise<void>) => void;
  post: (path: string, handler: (req: Request, res: Response) => void | Promise<void>) => void;
}

const getUserId = (req: Request<{ userId?: string }>): string | undefined => req.userId ?? req.body?.userId;

export const registerProgressRoutes = (router: Router) => {
  router.get("/progress", async (req, res) => {
    const userId = getUserId(req);

    if (!userId) {
      res.status(401).json({ message: "userId is required" });
      return;
    }

    const progress = await getProgress(userId);
    res.json({
      progress,
      xpToNextLevel: getXpToNextLevel(progress.xp),
    });
  });

  router.post("/progress/lesson-complete", async (req, res) => {
    const { xpEarned, heartsChange, badgesEarned } = req.body as {
      userId?: string;
      xpEarned: number;
      heartsChange?: number;
      badgesEarned?: string[];
    };
    const userId = getUserId(req as Request<{ userId?: string }>);

    if (!userId) {
      res.status(401).json({ message: "userId is required" });
      return;
    }

    if (typeof xpEarned !== "number") {
      res.status(400).json({ message: "xpEarned must be provided" });
      return;
    }

    const { updatedProgress, levelUp } = applyLessonCompletion(await getProgress(userId), {
      xpEarned,
      heartsChange,
      badgesEarned,
    });

    await setProgress(userId, updatedProgress);
    res.json({
      progress: updatedProgress,
      xpToNextLevel: getXpToNextLevel(updatedProgress.xp),
      levelUp,
    });
  });
};
