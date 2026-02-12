import { AuthenticatedRequest, withAuth } from "./auth";
import { applyLessonCompletion, getXpToNextLevel } from "./progressService";
import { getProgress, setProgress } from "./progressStore";

export interface Request<TBody = unknown> {
  body: TBody;
  headers?: Record<string, string | string[] | undefined>;
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
  router.get(
    "/progress",
    withAuth((_req: AuthenticatedRequest, res) => {
      const progress = getProgress(_req.auth.userId);
      res.json({
        progress,
        xpToNextLevel: getXpToNextLevel(progress.xp),
      });
    }),
  );

  router.post(
    "/progress/lesson-complete",
    withAuth(
      (
        req: AuthenticatedRequest<{
          xpEarned: number;
          heartsChange?: number;
          badgesEarned?: string[];
        }>,
        res,
      ) => {
        const { xpEarned, heartsChange, badgesEarned } = req.body;

        if (typeof xpEarned !== "number") {
          res.status(400).json({ message: "xpEarned must be provided" });
          return;
        }

        const currentProgress = getProgress(req.auth.userId);
        const { updatedProgress, levelUp } = applyLessonCompletion(currentProgress, {
          xpEarned,
          heartsChange,
          badgesEarned,
        });

        setProgress(req.auth.userId, updatedProgress);
        res.json({
          progress: updatedProgress,
          xpToNextLevel: getXpToNextLevel(updatedProgress.xp),
          levelUp,
        });
      },
    ),
  );
};
