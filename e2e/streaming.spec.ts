import { test, expect } from "@playwright/test";

test("incremental stream retains stopped text, permits another turn, and respects reading position", async ({ page }) => {
  // A controllable browser ReadableStream exercises the real SDK parser and abort
  // behavior. No production code or provider response is replaced in the app.
  await page.addInitScript(() => {
    const originalFetch = window.fetch.bind(window);
    let controller: ReadableStreamDefaultController<Uint8Array>;
    let count = 0;
    const encoder = new TextEncoder();
    const emit = (chunk: object) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
    Object.assign(window, { testStream: {
      text: (delta: string) => emit({ type: "text-delta", id: "text", delta }),
      finish: () => {
        emit({ type: "text-end", id: "text" });
        emit({ type: "finish" });
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    } });
    window.fetch = async (input, init) => {
      if (!String(input).endsWith("/api/chat")) return originalFetch(input, init);
      const stream = new ReadableStream<Uint8Array>({ start(next) {
        controller = next;
        init?.signal?.addEventListener("abort", () => controller.error(new DOMException("Stopped", "AbortError")), { once: true });
        emit({ type: "start", messageId: `assistant-${++count}` });
        emit({ type: "text-start", id: "text" });
      } });
      return new Response(stream, { headers: { "content-type": "text/event-stream", "x-vercel-ai-ui-message-stream": "v1" } });
    };
  });
  const text = (delta: string) => page.evaluate((value) => {
    (window as unknown as { testStream: { text: (text: string) => void } }).testStream.text(value);
  }, delta);
  await page.goto("/discovery");
  const input = page.getByLabel("Describe your project");
  await input.fill("I need a website");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.getByText("Thinking about your project…")).toBeVisible();
  await text("A useful partial response.");
  await expect(page.getByRole("article", { name: "Assistant message" })).toContainText("A useful partial response.");
  await expect(page.getByText("Thinking about your project…")).toHaveCount(0);
  await page.getByRole("button", { name: "Stop generation" }).click();
  await expect(page.getByRole("button", { name: "Send message", exact: true })).toBeVisible();
  await expect(page.getByRole("article", { name: "Assistant message" })).toContainText("A useful partial response.");
  await input.fill("Please continue");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.getByText("Thinking about your project…")).toBeVisible();
  await text("More detail. ".repeat(300));
  const log = page.getByRole("log", { name: "Conversation" });
  await expect.poll(() => log.evaluate(el => el.scrollHeight - el.scrollTop - el.clientHeight)).toBeLessThan(70);
  await log.evaluate(el => { el.scrollTop = 0; el.dispatchEvent(new Event("scroll")); });
  await expect(page.getByRole("button", { name: "Jump to latest" })).toBeVisible();
  await text("Additional streamed text. ".repeat(100));
  await expect(log).toContainText("Additional streamed text.");
  expect(await log.evaluate(el => el.scrollTop)).toBe(0);
  await page.evaluate(() => (window as unknown as { testStream: { finish: () => void } }).testStream.finish());
  await expect(page.getByRole("button", { name: "Stop generation" })).toHaveCount(0);
  await page.getByRole("button", { name: "Jump to latest" }).click();
  await expect.poll(() => log.evaluate(el => el.scrollHeight - el.scrollTop - el.clientHeight)).toBeLessThan(70);
  await expect(page.getByRole("article", { name: "Your message" })).toHaveCount(2);
  await expect(page.getByRole("article", { name: "Assistant message" })).toHaveCount(2);
});
