import { beforeEach, describe, expect, it, vi } from "vitest";

const { generateBlueprintMock } = vi.hoisted(() => ({
  generateBlueprintMock: vi.fn(),
}));
vi.mock("./blueprint", async () => {
  const actual =
    await vi.importActual<typeof import("./blueprint")>("./blueprint");
  return { ...actual, generateBlueprint: generateBlueprintMock };
});

import express from "express";
import { registerPublicApi } from "./publicApi";
import { ENV } from "./_core/env";

function makeResponse() {
  const state: {
    status: number;
    body?: unknown;
    headers: Record<string, string>;
  } = {
    status: 200,
    headers: {},
  };
  return {
    state,
    setHeader(name: string, value: string) {
      state.headers[name] = value;
      return this;
    },
    status(code: number) {
      state.status = code;
      return this;
    },
    json(body: unknown) {
      state.body = body;
      return this;
    },
  };
}

function makeRequest(body: unknown, authorization?: string) {
  return {
    body,
    header(name: string) {
      return name.toLowerCase() === "authorization" ? authorization : undefined;
    },
  };
}

describe("public blueprint API", () => {
  beforeEach(() => {
    ENV.publicApiKeys = ["test-secret"];
    ENV.publicApiRateLimit = 30;
    generateBlueprintMock.mockResolvedValue({
      title: "Test blueprint",
      generated: true,
    });
  });

  it("rejects missing or invalid Bearer credentials", async () => {
    const app = express();
    registerPublicApi(app);
    const route = app._router.stack.find(
      (layer: any) => layer.route?.path === "/api/v1/blueprints"
    ).route.stack[0].handle;
    const response = makeResponse();

    await route(
      makeRequest({
        brief: "A sufficiently detailed product brief for testing.",
      }),
      response
    );

    expect(response.state.status).toBe(401);
    expect(response.state.body).toMatchObject({ error: "unauthorized" });
  });

  it("validates the brief and returns a versioned blueprint envelope", async () => {
    const app = express();
    registerPublicApi(app);
    const route = app._router.stack.find(
      (layer: any) => layer.route?.path === "/api/v1/blueprints"
    ).route.stack[0].handle;
    const response = makeResponse();

    await route(
      makeRequest(
        { brief: "A sufficiently detailed product brief for testing." },
        "Bearer test-secret"
      ),
      response
    );

    expect(response.state.status).toBe(200);
    expect(response.state.body).toEqual({
      data: { title: "Test blueprint", generated: true },
      meta: { apiVersion: "v1", advisory: true },
    });
    expect(generateBlueprintMock).toHaveBeenCalledWith(
      "A sufficiently detailed product brief for testing."
    );
  });

  it("returns 429 when one key exceeds its configured minute limit", async () => {
    ENV.publicApiKeys = ["rate-limit-key"];
    ENV.publicApiRateLimit = 1;
    const app = express();
    registerPublicApi(app);
    const route = app._router.stack.find(
      (layer: any) => layer.route?.path === "/api/v1/blueprints"
    ).route.stack[0].handle;
    const request = makeRequest(
      { brief: "A sufficiently detailed product brief for testing." },
      "Bearer rate-limit-key"
    );

    await route(request, makeResponse());
    const response = makeResponse();
    await route(request, response);

    expect(response.state.status).toBe(429);
    expect(response.state.body).toMatchObject({ error: "rate_limited" });
  });
});
