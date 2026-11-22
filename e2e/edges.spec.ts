import { test, expect, type Page } from "@playwright/test";

type Mode = "ok" | "offline" | "midstream" | "rate" | "empty" | "slow" | "malformed";
declare global {
  interface Window {
    edgeTest: { mode: Mode; requests: number; disconnect: () => void };
  }
}
// Deliberate sabotage exists only in the browser test, never in shipped routes.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const realFetch = window.fetch.bind(window);
    let active: ReadableStreamDefaultController<Uint8Array> | undefined;
    const encoder = new TextEncoder();
    window.edgeTest = { mode: "ok", requests: 0, disconnect: () => active?.error(new TypeError("Network connection lost")) };
    window.fetch = async (input, init) => {
      if (!String(input).endsWith("/api/chat")) return realFetch(input, init);
      const id = ++window.edgeTest.requests;
      const mode = window.edgeTest.mode;
      if (mode === "offline") throw new TypeError("Failed to fetch");
      if (mode === "rate") return new Response("<h1>private upstream details</h1>", { status: 429 });
      const lead = { company: "Example Studio", project: "An accessible repair booking website", budget: "5k-15k", timeline: "this-quarter", decisionMaker: true };
      const stream = new ReadableStream<Uint8Array>({ start(controller) {
        active = controller;
        const emit = (chunk: object) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
        init?.signal?.addEventListener("abort", () => { try { controller.error(new DOMException("Stopped", "AbortError")); } catch { /* already closed */ } }, { once: true });
        emit({ type: "start", messageId: `reply-${id}` });
        if (mode === "slow") return;
        if (mode === "midstream") {
          emit({ type: "text-start", id: "text" });
          emit({ type: "text-delta", id: "text", delta: "A useful partial response before the connection drops." });
          return;
        }
        if (mode !== "empty") {
          emit({ type: "text-start", id: "text" });
          emit({ type: "text-delta", id: "text", delta: "Here is your project qualification." });
          emit({ type: "text-end", id: "text" });
          emit({ type: "tool-input-available", toolCallId: `score-${id}`, toolName: "qualifyLead", input: lead });
          emit({ type: "tool-output-available", toolCallId: `score-${id}`, output: mode === "malformed" ? { score: "invalid" } : { ...lead, score: 80, category: "Priority", reasons: ["Budget contributes 30 points.", "Timeline contributes 20 points.", "Confirmed authority adds 20 points.", "Project need adds 10 points."], nextAction: "Offer a discovery call with the agency." } });
        }
        emit({ type: "finish", finishReason: "stop" });
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } });
      return new Response(stream, { headers: { "content-type": "text/event-stream", "x-vercel-ai-ui-message-stream": "v1" } });
    };
  });
});
const mode = (page: Page, value: Mode) => page.evaluate(value => { window.edgeTest.mode = value; }, value);
async function send(page: Page, text = "A repair booking website for our business") {
  await page.getByLabel("Describe your project", { exact: true }).fill(text);
  await page.getByRole("button", { name: "Send message", exact: true }).click();
}
const error = (page: Page) => page.getByRole("alert", { name: "Conversation error" });

test("first run, whitespace, phone composer, and successful typed score have no console errors", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("pageerror", value => consoleErrors.push(value.message));
  page.on("console", value => { if (value.type() === "error") consoleErrors.push(value.text()); });
  await page.goto("/discovery");
  await expect(page.getByRole("button", { name: "Send message", exact: true })).toBeDisabled();
  await page.getByLabel("Describe your project").fill("   ");
  await expect(page.getByRole("button", { name: "Send message", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "I’m exploring a new website", exact: true }).click();
  await expect(page.getByLabel("Describe your project")).not.toHaveValue("");
  await send(page);
  await expect(page.getByRole("region", { name: "Qualification for Example Studio" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Send message", exact: true })).toBeVisible();
  await page.getByLabel("Describe your project").focus();
  const font = await page.getByLabel("Describe your project").evaluate(el => parseFloat(getComputedStyle(el).fontSize));
  if (test.info().project.name === "mobile-webkit") expect(font).toBeGreaterThanOrEqual(16);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(consoleErrors).toEqual([]);
  await page.screenshot({ path: `test-results/FE08/${test.info().project.name}-happy-path.png`, fullPage: true });
});

test("network fails before send and retry recovers without duplicating the visitor message", async ({ page }) => {
  await page.goto("/discovery");
  await mode(page, "offline");
  await send(page);
  await expect(error(page)).toContainText("Check your internet connection");
  await page.screenshot({ path: `test-results/FE08/${test.info().project.name}-network-error.png`, fullPage: true });
  await mode(page, "ok");
  await page.getByRole("button", { name: "Retry last response" }).click();
  await expect(page.getByRole("region", { name: "Qualification for Example Studio" })).toBeVisible();
  await expect(error(page)).toHaveCount(0);
  await expect(page.getByRole("article", { name: "Your message" })).toHaveCount(1);
});

test("connection dies mid-stream; partial text survives and double retry repeats only the last response", async ({ page }) => {
  await page.goto("/discovery");
  await send(page, "First project description");
  await expect(page.getByRole("region", { name: "Qualification for Example Studio" })).toBeVisible();
  await mode(page, "midstream");
  await send(page, "Please explain the next step");
  await expect(page.getByText("A useful partial response before the connection drops.", { exact: true })).toBeVisible();
  await page.evaluate(() => window.edgeTest.disconnect());
  await expect(error(page)).toBeVisible();
  await expect(page.getByText("A useful partial response before the connection drops.", { exact: true })).toBeVisible();
  await page.screenshot({ path: `test-results/FE08/${test.info().project.name}-midstream-error.png`, fullPage: true });
  await mode(page, "slow");
  await page.getByRole("button", { name: "Retry last response" }).evaluate((button) => {
    (button as HTMLButtonElement).click();
    (button as HTMLButtonElement).click();
  });
  await expect(page.getByRole("button", { name: "Stop generation" })).toBeVisible();
  expect(await page.evaluate(() => window.edgeTest.requests)).toBe(3);
  await page.getByRole("button", { name: "Stop generation" }).click();
  await mode(page, "ok");
  await send(page, "Continue after stopping");
  await expect(page.getByRole("region", { name: "Qualification for Example Studio" })).toHaveCount(2);
  await expect(page.getByRole("article", { name: "Your message" })).toHaveCount(3);
  await expect(error(page)).toHaveCount(0);
});

test("rate limit hides raw server bodies and can be retried after the limit clears", async ({ page }) => {
  await page.goto("/discovery");
  await mode(page, "rate");
  await send(page);
  await expect(error(page)).toContainText("Wait a minute");
  await expect(error(page)).not.toContainText("private upstream");
  await page.screenshot({ path: `test-results/FE08/${test.info().project.name}-rate-limit.png`, fullPage: true });
  await mode(page, "ok");
  await page.getByRole("button", { name: "Retry last response" }).click();
  await expect(page.getByRole("region", { name: "Qualification for Example Studio" })).toBeVisible();
});

test("empty response offers retry and malformed tool output is contained", async ({ page }) => {
  await page.goto("/discovery");
  await mode(page, "empty");
  await send(page);
  await expect(error(page)).toContainText("no usable response");
  await mode(page, "malformed");
  await page.getByRole("button", { name: "Retry last response" }).click();
  await expect(page.getByRole("alert")).toContainText("qualification returned incomplete data");
  await expect(page.getByRole("button", { name: "Send message", exact: true })).toBeVisible();
});

test("slow response keeps a stop control and explains the delay", async ({ page }) => {
  await page.goto("/discovery");
  await mode(page, "slow");
  await send(page);
  await expect(page.locator(".reply-skeleton")).toBeVisible();
  await expect(page.getByText(/This is taking longer than usual/)).toBeVisible({ timeout: 12_000 });
  await page.getByRole("button", { name: "Stop generation" }).click();
  await expect(page.getByText(/This is taking longer than usual/)).toHaveCount(0);
  await expect(error(page)).toHaveCount(0);
});
