import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("primary discovery flow renders a typed score and retries a failed response", async ({
  page,
}) => {
  let attempts = 0;
  await page.route("**/api/chat", async (route) => {
    attempts++;
    if (attempts === 2) {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ error: "Temporary failure" }),
      });
      return;
    }
    const chunks = [
      { type: "start", messageId: `assistant-${attempts}` },
      { type: "text-start", id: "text-1" },
      {
        type: "text-delta",
        id: "text-1",
        delta: "Thanks. Here is the project qualification.",
      },
      { type: "text-end", id: "text-1" },
      {
        type: "tool-input-start",
        toolCallId: "call-1",
        toolName: "qualifyLead",
      },
      {
        type: "tool-input-available",
        toolCallId: "call-1",
        toolName: "qualifyLead",
        input: {
          company: "Example Studio",
          project: "A new website for our studio.",
          budget: "5k-15k",
          timeline: "this-quarter",
          decisionMaker: true,
        },
      },
      {
        type: "tool-output-available",
        toolCallId: "call-1",
        output: {
          company: "Example Studio",
          project: "A new website for our studio.",
          budget: "5k-15k",
          timeline: "this-quarter",
          decisionMaker: true,
          score: 80,
          category: "Priority",
          reasons: [
            "Budget contributes 30 points.",
            "Timeline contributes 20 points.",
          ],
          nextAction: "Offer a discovery call with the agency.",
        },
      },
      { type: "finish" },
    ];
    await route.fulfill({
      status: 200,
      headers: {
        "content-type": "text/event-stream",
        "x-vercel-ai-ui-message-stream": "v1",
      },
      body:
        chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join("") +
        "data: [DONE]\n\n",
    });
  });
  await page.goto("/");
  await page.screenshot({
    path: "test-results/screenshots/overview.png",
    fullPage: true,
  });
  await page.getByRole("link", { name: "Start project discovery" }).click();
  await page
    .getByLabel("Describe your project")
    .fill(
      "We are Example Studio. We need a website. Budget is $10k and timing is this quarter. I make the decision.",
    );
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "Qualification for Example Studio" }),
  ).toBeVisible();
  await page
    .getByLabel("Describe your project")
    .fill("Can you explain the next step?");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(
    page.getByRole("alert", { name: "Conversation error" }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/screenshots/recoverable-error.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Retry last response" }).click();
  await expect(
    page.getByRole("alert", { name: "Conversation error" }),
  ).toHaveCount(0);
  await expect(page.getByRole("article", { name: "Your message" })).toHaveCount(
    2,
  );
});
test("key pages have no detectable axe WCAG A/AA violations at phone and desktop widths", async ({
  page,
}) => {
  for (const width of [375, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      "/",
      "/discovery",
      "/settings",
      "/about",
      "/health",
      "/playground",
      "/playground/tools",
    ]) {
      await page.goto(path);
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(result.violations, `${path} at ${width}px`).toEqual([]);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  }
});


test("health page displays its real same-origin API response", async ({ page }) => {
  const responsePromise = page.waitForResponse((response) =>
    response.url().endsWith("/api/health") && response.request().method() === "GET",
  );
  await page.goto("/health");
  const response = await responsePromise;
  expect(response.ok()).toBe(true);
  const health = await response.json();
  await expect(page.getByRole("status")).toContainText(`Fetched at ${health.timestamp}`);
  await expect(page.getByRole("status")).toContainText(`Application API · ${health.status}`);
});
