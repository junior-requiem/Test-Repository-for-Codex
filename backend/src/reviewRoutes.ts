import { buildReviewSummary, recordQuestionAttempt } from "./reviewService";

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

export const registerReviewRoutes = (router: Router) => {
  router.post("/review/queue", (req, res) => {
    const { availableQuestions } = req.body as {
      availableQuestions: Array<{ questionId: string; skillId: string }>;
    };

    if (!Array.isArray(availableQuestions)) {
      res.status(400).json({ message: "availableQuestions must be provided" });
      return;
    }

    const summary = buildReviewSummary(availableQuestions);
    res.json(summary);
  });

  router.post("/review/attempt", (req, res) => {
    const { questionId, skillId, correct, timeToCompleteMs } = req.body as {
      questionId: string;
      skillId: string;
      correct: boolean;
      timeToCompleteMs: number;
    };

    if (!questionId || !skillId || typeof correct !== "boolean") {
      res.status(400).json({ message: "questionId, skillId, and correct must be provided" });
      return;
    }

    const updated = recordQuestionAttempt({
      questionId,
      skillId,
      correct,
      timeToCompleteMs: Math.max(timeToCompleteMs ?? 0, 0),
    });

    res.json(updated);
  });
};
