import { buildDefaultProgress, buildReviewSummary, recordQuestionAttempt } from "./reviewService";
import { addAttempt, getAllQuestionProgress, getAttempts, getQuestionProgress, setQuestionProgress } from "./reviewStore";

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

export const registerReviewRoutes = (router: Router) => {
  router.post("/review/queue", async (req, res) => {
    const userId = getUserId(req as Request<{ userId?: string }>);
    const { availableQuestions } = req.body as {
      userId?: string;
      availableQuestions: Array<{ questionId: string; skillId: string }>;
    };

    if (!userId) {
      res.status(401).json({ message: "userId is required" });
      return;
    }

    if (!Array.isArray(availableQuestions)) {
      res.status(400).json({ message: "availableQuestions must be provided" });
      return;
    }

    const attempts = await getAttempts(userId);
    const storedProgress = await getAllQuestionProgress(
      userId,
      availableQuestions.map((question) => question.questionId),
    );

    const summary = buildReviewSummary(availableQuestions, attempts, storedProgress);
    res.json(summary);
  });

  router.post("/review/attempt", async (req, res) => {
    const userId = getUserId(req as Request<{ userId?: string }>);
    const { questionId, skillId, correct, timeToCompleteMs } = req.body as {
      userId?: string;
      questionId: string;
      skillId: string;
      correct: boolean;
      timeToCompleteMs: number;
    };

    if (!userId) {
      res.status(401).json({ message: "userId is required" });
      return;
    }

    if (!questionId || !skillId || typeof correct !== "boolean") {
      res.status(400).json({ message: "questionId, skillId, and correct must be provided" });
      return;
    }

    const existing = (await getQuestionProgress(userId, questionId)) ?? buildDefaultProgress(questionId, skillId);
    const { attempt, updatedProgress } = recordQuestionAttempt(existing, {
      questionId,
      skillId,
      correct,
      timeToCompleteMs: Math.max(timeToCompleteMs ?? 0, 0),
    });

    await addAttempt(userId, attempt);
    await setQuestionProgress(userId, updatedProgress);

    res.json(updatedProgress);
  });
};
