import { it, expect, vi, beforeEach, afterEach } from "vitest";
const sdk = vi.hoisted(() => ({ streamText: vi.fn(), takeRateLimit: vi.fn(() => true) }));
vi.mock("ai", async (original) => ({ ...await original<typeof import("ai")>(), streamText: sdk.streamText }));
vi.mock("@ai-sdk/google", () => ({ google: () => ({}) }));
vi.mock("@/lib/rate-limit", () => ({ takeRateLimit: sdk.takeRateLimit }));
import { POST } from "@/app/api/chat/route";
const request = (body = JSON.stringify({ messages: [{ id: "1", role: "user", parts: [{ type: "text", text: "A business website" }] }] })) => new Request("http://localhost/api/chat", { method: "POST", body });
beforeEach(() => {
  vi.stubEnv("GOOGLE_GENERATIVE_AI_API_KEY", "not-a-real-key-unit-test-only");
  sdk.takeRateLimit.mockReturnValue(true);
  sdk.streamText.mockReset();
});
afterEach(() => vi.unstubAllEnvs());
it("sabotages server generation with a thrown error and returns a safe 503", async () => {
  sdk.streamText.mockImplementation(() => { throw new Error("private-provider-details"); });
  const response = await POST(request());
  expect(response.status).toBe(503);
  expect(await response.text()).not.toContain("private-provider-details");
});
it("rejects malformed request JSON before provider execution", async () => {
  const response = await POST(request("{invalid"));
  expect(response.status).toBe(400);
  expect(sdk.streamText).not.toHaveBeenCalled();
});
it("returns a rate-limit hint without invoking the provider", async () => {
  sdk.takeRateLimit.mockReturnValue(false);
  const response = await POST(request());
  expect(response.status).toBe(429);
  expect(response.headers.get("retry-after")).toBe("60");
  expect(sdk.streamText).not.toHaveBeenCalled();
});

it.each(["   ", "x".repeat(2001)])("rejects blank or over-limit visitor input before generation", async (text) => {
  sdk.streamText.mockReturnValue({ toUIMessageStreamResponse: () => new Response("mocked stream") });
  const response = await POST(request(JSON.stringify({ messages: [{ id: "limit", role: "user", parts: [{ type: "text", text }] }] })));
  expect(response.status).toBe(400);
  expect(sdk.streamText).not.toHaveBeenCalled();
});
it("accepts the documented 2000-character boundary with a mocked provider", async () => {
  sdk.streamText.mockReturnValue({ toUIMessageStreamResponse: () => new Response("mocked stream") });
  const response = await POST(request(JSON.stringify({ messages: [{ id: "limit", role: "user", parts: [{ type: "text", text: "x".repeat(2000) }] }] })));
  expect(response.status).toBe(200);
  expect(sdk.streamText).toHaveBeenCalledOnce();
});
