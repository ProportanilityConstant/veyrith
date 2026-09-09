import crypto from "node:crypto";
import type { Express, Request, Response } from "express";
import { getApiUsageSummary, recordApiUsage } from "./db";
import { ENV } from "./_core/env";
import { blueprintInputSchema, generateBlueprint } from "./blueprint";

const requestWindows = new Map<string, { startedAt: number; count: number }>();
const windowMs = 60_000;

function unauthorized(res: Response) {
  return res.status(401).json({
    error: "unauthorized",
    message: "A valid Bearer token is required.",
  });
}

function tokenFingerprint(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex").slice(0, 16);
}

function getToken(req: Request) {
  const header = req.header("authorization") ?? "";
  const [scheme, token, extra] = header.split(" ");
  if (extra || scheme?.toLowerCase() !== "bearer" || !token) return undefined;
  return token;
}

function hasValidToken(token: string | undefined) {
  if (!token || ENV.publicApiKeys.length === 0) return false;
  const received = Buffer.from(token);
  return ENV.publicApiKeys.some(expectedValue => {
    const expected = Buffer.from(expectedValue);
    return (
      expected.length === received.length &&
      crypto.timingSafeEqual(expected, received)
    );
  });
}

function consumeRateLimit(fingerprint: string) {
  const now = Date.now();
  const current = requestWindows.get(fingerprint);
  if (!current || now - current.startedAt >= windowMs) {
    requestWindows.set(fingerprint, { startedAt: now, count: 1 });
    return { allowed: true, retryAfter: 60 };
  }
  current.count += 1;
  const allowed = current.count <= ENV.publicApiRateLimit;
  return {
    allowed,
    retryAfter: Math.max(
      1,
      Math.ceil((windowMs - (now - current.startedAt)) / 1000)
    ),
  };
}

function rateLimited(res: Response, retryAfter: number) {
  res.setHeader("Retry-After", String(retryAfter));
  return res.status(429).json({
    error: "rate_limited",
    message: "Too many requests. Try again after the Retry-After interval.",
  });
}

async function logUsage(
  endpoint: string,
  statusCode: number,
  latencyMs: number,
  generated: boolean,
  keyFingerprint: string
) {
  try {
    await recordApiUsage({
      endpoint,
      statusCode,
      latencyMs,
      generated: generated ? "yes" : "no",
      keyFingerprint,
    });
  } catch (error) {
    console.warn("[Public API] Usage record failed:", error);
  }
}

export function registerPublicApi(app: Express) {
  app.post("/api/v1/blueprints", async (req, res) => {
    const startedAt = Date.now();
    const token = getToken(req);
    if (!hasValidToken(token)) return unauthorized(res);
    const fingerprint = tokenFingerprint(token!);
    const limit = consumeRateLimit(fingerprint);
    if (!limit.allowed) {
      await logUsage(
        "/api/v1/blueprints",
        429,
        Date.now() - startedAt,
        false,
        fingerprint
      );
      return rateLimited(res, limit.retryAfter);
    }

    const parsed = blueprintInputSchema.safeParse(req.body);
    if (!parsed.success) {
      await logUsage(
        "/api/v1/blueprints",
        400,
        Date.now() - startedAt,
        false,
        fingerprint
      );
      return res.status(400).json({
        error: "invalid_request",
        message: "brief must be between 20 and 5000 characters.",
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const blueprint = await generateBlueprint(parsed.data.brief);
    await logUsage(
      "/api/v1/blueprints",
      200,
      Date.now() - startedAt,
      blueprint.generated,
      fingerprint
    );
    return res
      .status(200)
      .json({ data: blueprint, meta: { apiVersion: "v1", advisory: true } });
  });

  app.get("/api/v1/usage", async (req, res) => {
    const token = getToken(req);
    if (!hasValidToken(token)) return unauthorized(res);
    const summary = await getApiUsageSummary(
      new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
    return res
      .status(200)
      .json({ data: summary, meta: { apiVersion: "v1", window: "24h" } });
  });
}
