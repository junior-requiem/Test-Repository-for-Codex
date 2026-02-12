import { AuthenticatedRequest, withAuth } from "./auth";
import { buildReviewSummary, recordQuestionAttempt } from "./reviewService";

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

export const registerReviewRoutes = (router: Router) => {
  router.post(
    "/review/queue",
    withAuth(
      (
        req: AuthenticatedRequest<{
          availableQuestions: Array<{ questionId: string; skillId: string }>;
        }>,
        res,
      ) => {
        const { availableQuestions } = req.body;

        if (!Array.isArray(availableQuestions)) {
          res.status(400).json({ message: "availableQuestions must be provided" });
          return;
        }

        const summary = buildReviewSummary(req.auth.userId, availableQuestions);
        res.json(summary);
      },
    ),
  );

  router.post(
    "/review/attempt",
    withAuth(
      (
        req: AuthenticatedRequest<{
          questionId: string;
          skillId: string;
          correct: boolean;
          timeToCompleteMs: number;
        }>,
        res,
      ) => {
        const { questionId, skillId, correct, timeToCompleteMs } = req.body;

        if (!questionId || !skillId || typeof correct !== "boolean") {
          res.status(400).json({ message: "questionId, skillId, and correct must be provided" });
          return;
        }

        const updated = recordQuestionAttempt(req.auth.userId, {
          questionId,
          skillId,
          correct,
          timeToCompleteMs: Math.max(timeToCompleteMs ?? 0, 0),
        });

        res.json(updated);
      },
    ),
  );
};
