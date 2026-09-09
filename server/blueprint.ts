import { invokeLLM, listLLMModels } from "./_core/llm";
import { z } from "zod";

export const blueprintInputSchema = z.object({
  brief: z.string().min(20).max(5000),
});

export const blueprintSchema = z.object({
  title: z.string(),
  summary: z.string(),
  confidence: z.number().min(0).max(100),
  architectureStyle: z.string(),
  assumptions: z.array(z.string()).min(2).max(5),
  components: z
    .array(
      z.object({
        name: z.string(),
        type: z.string(),
        description: z.string(),
        health: z.enum(["strong", "watch", "risk"]),
      })
    )
    .min(4)
    .max(8),
  risks: z
    .array(
      z.object({
        title: z.string(),
        detail: z.string(),
        severity: z.enum(["low", "medium", "high"]),
      })
    )
    .min(2)
    .max(4),
  nextMove: z.string(),
});

export type Blueprint = z.infer<typeof blueprintSchema>;

const fallbackBlueprint: Blueprint = {
  title: "PulsePay reliability blueprint",
  summary:
    "A resilient event-driven core with a calm read path: accept payments once, fan out safely, and keep customer-facing queries fast even when providers wobble.",
  confidence: 82,
  architectureStyle: "Event-led modular monolith",
  assumptions: [
    "Payment provider webhooks can arrive more than once.",
    "Checkout reads must stay available during downstream incidents.",
    "The first release can defer multi-region writes.",
  ],
  components: [
    {
      name: "Edge gateway",
      type: "Ingress",
      description: "Auth, rate limits, idempotency keys",
      health: "strong",
    },
    {
      name: "Checkout core",
      type: "Compute",
      description: "Owns the payment state machine",
      health: "strong",
    },
    {
      name: "Event relay",
      type: "Messaging",
      description: "Durable outbox with replayable events",
      health: "watch",
    },
    {
      name: "Ledger store",
      type: "Data",
      description: "Append-only balance and audit history",
      health: "strong",
    },
    {
      name: "Provider adapter",
      type: "Integration",
      description: "Stripe-like provider boundary",
      health: "risk",
    },
    {
      name: "Read model",
      type: "Query",
      description: "Fast customer-facing checkout views",
      health: "watch",
    },
  ],
  risks: [
    {
      title: "Webhook duplication",
      detail: "Persist provider event IDs before applying side effects.",
      severity: "high",
    },
    {
      title: "Relay lag",
      detail: "Expose freshness and replay controls before launch.",
      severity: "medium",
    },
    {
      title: "Provider coupling",
      detail: "Keep provider-specific types behind one adapter.",
      severity: "low",
    },
  ],
  nextMove:
    "Lock the payment state machine and write the idempotency contract before choosing infrastructure.",
};

function messageText(content: unknown) {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map(part =>
        typeof part === "object" && part && "text" in part
          ? String((part as { text?: unknown }).text ?? "")
          : ""
      )
      .join("");
  }
  return "";
}

const jsonSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    summary: { type: "string" },
    confidence: { type: "number" },
    architectureStyle: { type: "string" },
    assumptions: { type: "array", items: { type: "string" } },
    components: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          type: { type: "string" },
          description: { type: "string" },
          health: { type: "string", enum: ["strong", "watch", "risk"] },
        },
        required: ["name", "type", "description", "health"],
        additionalProperties: false,
      },
    },
    risks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          detail: { type: "string" },
          severity: { type: "string", enum: ["low", "medium", "high"] },
        },
        required: ["title", "detail", "severity"],
        additionalProperties: false,
      },
    },
    nextMove: { type: "string" },
  },
  required: [
    "title",
    "summary",
    "confidence",
    "architectureStyle",
    "assumptions",
    "components",
    "risks",
    "nextMove",
  ],
  additionalProperties: false,
};

export async function generateBlueprint(
  brief: string
): Promise<Blueprint & { generated: boolean }> {
  try {
    const { data } = await listLLMModels();
    const preferred =
      data.find(model => model.id === "claude-sonnet-4-6")?.id ??
      data.find(model => model.id === "gpt-5-mini")?.id;
    const response = await invokeLLM({
      model: preferred,
      messages: [
        {
          role: "system",
          content:
            "You are Veyrith, a principal software architect who thinks in failure modes, contracts, and deliberate tradeoffs. Generate an honest, practical first-pass architecture blueprint from the user's product brief. Prefer one coherent architecture over a shopping list. Make assumptions explicit. Output only JSON that matches the requested schema.",
        },
        { role: "user", content: `Product brief:\n${brief}` },
      ],
      thinking: preferred?.startsWith("claude-")
        ? { type: "enabled", budget_tokens: 1536 }
        : undefined,
      reasoning: preferred?.startsWith("gpt-") ? { effort: "low" } : undefined,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "veyrith_blueprint",
          strict: true,
          schema: jsonSchema,
        },
      },
    });
    const raw = messageText(response.choices[0]?.message?.content);
    const parsed = blueprintSchema.parse(JSON.parse(raw));
    return { ...parsed, generated: true };
  } catch (error) {
    console.warn(
      "[Blueprint] AI generation fell back to the seeded blueprint:",
      error
    );
    return { ...fallbackBlueprint, generated: false };
  }
}
