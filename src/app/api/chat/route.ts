import { google } from "@ai-sdk/google";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  validateUIMessages,
} from "ai";
import type { LeadMessage } from "@/lib/tools";
import { leadTools as tools } from "@/lib/tools";
import { MODEL, SYSTEM_PROMPT } from "@/lib/ai-config";
import { takeRateLimit } from "@/lib/rate-limit";

export const maxDuration = 30;

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json(
      { error: "This request must come from the application." },
      { status: 403 },
    );
  }
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "anonymous";
  if (!takeRateLimit("global") || !takeRateLimit(ip)) {
    return Response.json(
      { error: "Too many requests. Wait a minute and try again." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }
  const raw = await request.text();
  if (raw.length > 32_000)
    return Response.json(
      { error: "Conversation is too long. Start a new conversation." },
      { status: 413 },
    );
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json(
      {
        error:
          "AI service is awaiting server configuration. Your message has been kept. Please try again later.",
      },
      { status: 503 },
    );
  }
  let messages: LeadMessage[];
  try {
    const body: unknown = JSON.parse(raw);
    if (
      !body ||
      typeof body !== "object" ||
      !("messages" in body) ||
      !Array.isArray(body.messages) ||
      body.messages.length > 20
    ) {
      return Response.json(
        { error: "Send a conversation of at most 20 messages." },
        { status: 400 },
      );
    }
    messages = await validateUIMessages<LeadMessage>({
      messages: body.messages,
      tools,
    });
    if (
      messages.at(-1)?.role !== "user" ||
      messages.some((message) => message.role === "system")
    ) {
      return Response.json(
        { error: "A visitor message is required." },
        { status: 400 },
      );
    }
  } catch {
    return Response.json(
      { error: "We could not process that conversation. Please try a shorter message." },
      { status: 400 },
    );
  }
  try {
    const result = streamText({
      model: google(MODEL),
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages, {
        ignoreIncompleteToolCalls: true,
      }),
      tools,
      stopWhen: stepCountIs(3),
      maxOutputTokens: 800,
      abortSignal: AbortSignal.any([
        request.signal,
        AbortSignal.timeout(25_000),
      ]),
      onError: () => console.error("chat_generation_failed"),
    });
    return result.toUIMessageStreamResponse({
      onError: () =>
        "The AI response was interrupted. Your conversation is saved in this session. Retry the last message.",
    });
  } catch {
    return Response.json(
      {
        error:
          "The AI service is temporarily unavailable. Please retry shortly.",
      },
      { status: 503 },
    );
  }
}
