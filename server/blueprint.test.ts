import { beforeEach, describe, expect, it, vi } from "vitest";

const { invokeLLMMock, listLLMModelsMock } = vi.hoisted(() => ({
  invokeLLMMock: vi.fn(),
  listLLMModelsMock: vi.fn(),
}));

vi.mock("./_core/llm", () => ({
  invokeLLM: invokeLLMMock,
  listLLMModels: listLLMModelsMock,
}));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const caller = () => appRouter.createCaller({
  user: undefined,
  req: {} as TrpcContext["req"],
  res: {} as TrpcContext["res"],
});

const validBlueprint = {
  title: "Signalboard architecture blueprint",
  summary: "A durable event-led core with a fast read model.",
  confidence: 88,
  architectureStyle: "Event-led modular monolith",
  assumptions: ["Events can be retried.", "Reads should remain available."],
  components: [
    { name: "Gateway", type: "Ingress", description: "Auth and rate limits", health: "strong" },
    { name: "Core", type: "Compute", description: "Owns domain state", health: "strong" },
    { name: "Relay", type: "Messaging", description: "Durable event delivery", health: "watch" },
    { name: "Store", type: "Data", description: "Source of truth", health: "strong" },
  ],
  risks: [
    { title: "Duplicate events", detail: "Use idempotency keys.", severity: "high" },
    { title: "Lag", detail: "Measure freshness.", severity: "medium" },
  ],
  nextMove: "Write the event contract before selecting infrastructure.",
};

describe("blueprint.generate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listLLMModelsMock.mockResolvedValue({ data: [] });
  });

  it("returns a usable seeded blueprint when the AI provider is unavailable", async () => {
    invokeLLMMock.mockRejectedValue(new Error("provider unavailable"));

    const result = await caller().blueprint.generate({ brief: "Build a reliable billing API for a small team." });

    expect(result.generated).toBe(false);
    expect(result.components.length).toBeGreaterThanOrEqual(4);
    expect(result.risks[0]?.title).toBe("Webhook duplication");
  });

  it("parses the structured blueprint returned by the AI provider", async () => {
    listLLMModelsMock.mockResolvedValue({ data: [{ id: "claude-sonnet-4-6" }] });
    invokeLLMMock.mockResolvedValue({ choices: [{ message: { content: JSON.stringify(validBlueprint) } }] });

    const result = await caller().blueprint.generate({ brief: "Build a collaborative incident timeline for on-call teams." });

    expect(result.generated).toBe(true);
    expect(result.title).toBe(validBlueprint.title);
    expect(result.confidence).toBe(88);
    expect(invokeLLMMock).toHaveBeenCalledOnce();
  });
});
