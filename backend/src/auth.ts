import { createHmac, createPublicKey, timingSafeEqual, verify as verifySignature } from "node:crypto";

interface JwtHeader {
  alg?: string;
  typ?: string;
  kid?: string;
}

interface JwtPayload {
  sub?: string;
  exp?: number;
  nbf?: number;
  iat?: number;
  [key: string]: unknown;
}

export interface Request<TBody = unknown> {
  body: TBody;
  headers?: Record<string, string | string[] | undefined>;
  auth?: AuthContext;
}

export interface Response<TBody = unknown> {
  json: (body: TBody) => void;
  status: (code: number) => Response<TBody>;
}

export interface AuthContext {
  userId: string;
  token: string;
  claims: JwtPayload;
}

export interface AuthenticatedRequest<TBody = unknown> extends Request<TBody> {
  auth: AuthContext;
}

type AuthErrorCode = "missing_token" | "expired_token" | "invalid_token";

class AuthError extends Error {
  constructor(public code: AuthErrorCode, message: string) {
    super(message);
  }
}

const textDecoder = new TextDecoder();

const base64UrlDecode = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + "=".repeat(padLength);
  return Buffer.from(padded, "base64");
};

const parseJson = <T>(value: string): T => JSON.parse(value) as T;

const parseToken = (token: string) => {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new AuthError("invalid_token", "Malformed JWT");
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;

  let header: JwtHeader;
  let payload: JwtPayload;
  try {
    header = parseJson<JwtHeader>(textDecoder.decode(base64UrlDecode(encodedHeader)));
    payload = parseJson<JwtPayload>(textDecoder.decode(base64UrlDecode(encodedPayload)));
  } catch {
    throw new AuthError("invalid_token", "Malformed JWT payload");
  }

  return {
    header,
    payload,
    signature: base64UrlDecode(encodedSignature),
    signedData: `${encodedHeader}.${encodedPayload}`,
  };
};

const getSupabaseJwksUrl = () => {
  const explicit = process.env.SUPABASE_JWKS_URL;
  if (explicit) {
    return explicit;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    return null;
  }

  const cleaned = supabaseUrl.replace(/\/$/, "");
  return `${cleaned}/auth/v1/.well-known/jwks.json`;
};

interface JwkKey {
  kid?: string;
  kty?: string;
  n?: string;
  e?: string;
  alg?: string;
  use?: string;
  [key: string]: unknown;
}

let cachedJwks: { expiresAt: number; keys: Array<JwkKey> } | null = null;

const getJwks = async () => {
  const now = Date.now();
  if (cachedJwks && cachedJwks.expiresAt > now) {
    return cachedJwks.keys;
  }

  const jwksUrl = getSupabaseJwksUrl();
  if (!jwksUrl) {
    throw new AuthError("invalid_token", "JWKS endpoint is not configured");
  }

  const response = await fetch(jwksUrl);
  if (!response.ok) {
    throw new AuthError("invalid_token", "Failed to fetch JWKS");
  }

  const body = (await response.json()) as { keys?: Array<JwkKey> };
  const keys = body.keys ?? [];
  cachedJwks = {
    keys,
    expiresAt: now + 5 * 60 * 1000,
  };
  return keys;
};

const verifyHs256 = (signedData: string, signature: Buffer) => {
  const secret = process.env.SUPABASE_JWT_SECRET ?? process.env.JWT_SECRET;
  if (!secret) {
    throw new AuthError("invalid_token", "Supabase JWT secret is not configured");
  }

  const expected = createHmac("sha256", secret).update(signedData).digest();
  if (expected.length !== signature.length || !timingSafeEqual(expected, signature)) {
    throw new AuthError("invalid_token", "Token signature is invalid");
  }
};

const verifyRs256 = async (signedData: string, signature: Buffer, kid?: string) => {
  const keys = await getJwks();
  const candidate = keys.find((key) => !kid || key.kid === kid);
  if (!candidate) {
    throw new AuthError("invalid_token", "Signing key was not found");
  }

  const publicKey = createPublicKey({ key: candidate, format: "jwk" });
  const valid = verifySignature("RSA-SHA256", Buffer.from(signedData), publicKey, signature);
  if (!valid) {
    throw new AuthError("invalid_token", "Token signature is invalid");
  }
};

const assertTokenTimingClaims = (payload: JwtPayload, nowEpoch = Math.floor(Date.now() / 1000)) => {
  if (typeof payload.exp === "number" && payload.exp <= nowEpoch) {
    throw new AuthError("expired_token", "Token has expired");
  }

  if (typeof payload.nbf === "number" && payload.nbf > nowEpoch) {
    throw new AuthError("invalid_token", "Token is not valid yet");
  }
};

const getBearerToken = (headers?: Record<string, string | string[] | undefined>) => {
  if (!headers) {
    throw new AuthError("missing_token", "Missing Authorization header");
  }

  const authHeader = headers.authorization ?? headers.Authorization;
  const raw = Array.isArray(authHeader) ? authHeader[0] : authHeader;
  if (!raw) {
    throw new AuthError("missing_token", "Missing Authorization header");
  }

  const match = raw.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    throw new AuthError("invalid_token", "Authorization header must use Bearer scheme");
  }

  return match[1];
};

const validateJwt = async (token: string) => {
  const parsed = parseToken(token);
  const { header, payload, signature, signedData } = parsed;

  if (!header.alg) {
    throw new AuthError("invalid_token", "JWT algorithm is missing");
  }

  if (header.alg === "HS256") {
    verifyHs256(signedData, signature);
  } else if (header.alg === "RS256") {
    await verifyRs256(signedData, signature, header.kid);
  } else {
    throw new AuthError("invalid_token", `Unsupported JWT algorithm: ${header.alg}`);
  }

  assertTokenTimingClaims(payload);

  if (typeof payload.sub !== "string" || payload.sub.length === 0) {
    throw new AuthError("invalid_token", "Token subject is missing");
  }

  return {
    userId: payload.sub,
    token,
    claims: payload,
  } satisfies AuthContext;
};

const sendAuthError = (res: Response, error: unknown) => {
  if (error instanceof AuthError) {
    const messageByCode: Record<AuthErrorCode, string> = {
      missing_token: "Authentication token is required",
      invalid_token: "Authentication token is invalid",
      expired_token: "Authentication token has expired",
    };

    res.status(401).json({
      error: error.code,
      message: messageByCode[error.code],
    });
    return;
  }

  res.status(401).json({
    error: "invalid_token",
    message: "Authentication token is invalid",
  });
};

export const withAuth = <TBody>(
  handler: (req: AuthenticatedRequest<TBody>, res: Response) => void | Promise<void>,
) => {
  return async (req: Request<TBody>, res: Response) => {
    try {
      const token = getBearerToken(req.headers);
      req.auth = await validateJwt(token);
      await handler(req as AuthenticatedRequest<TBody>, res);
    } catch (error) {
      sendAuthError(res, error);
    }
  };
};
