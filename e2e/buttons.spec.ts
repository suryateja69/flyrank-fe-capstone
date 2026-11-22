import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("button lifecycle is stable, interruptible, and keyboard accessible", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/playground/buttons");
  const button = page.locator(".state-button");
  const before = await button.boundingBox();
  // Real keyboard traversal, without forcing focus into the button.
  for (let count = 0; count < 30; count++) {
    if (await button.evaluate(el => el === document.activeElement)) break;
    await page.keyboard.press("Tab");
  }
  await expect(button).toBeFocused();
  await expect.poll(() => button.evaluate(el => getComputedStyle(el, "::after").opacity)).toBe("1");
  await page.keyboard.press("Enter");
  await expect(button).toHaveAttribute("data-phase", "loading");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Space");
  await expect(page.getByText("Attempts started:")).toContainText("1");
  await expect(button).toHaveAttribute("data-phase", "success");
  const after = await button.boundingBox();
  expect(after?.width).toBe(before?.width);
  expect(after?.height).toBe(before?.height);
  await page.screenshot({ path: `test-results/FE-AA1/${test.info().project.name}-success.png`, fullPage: true });
  await expect(button).toHaveAttribute("data-phase", "idle");
  await page.getByLabel("Force failure").check();
  await button.click();
  await button.hover();
  await expect(button).toHaveAttribute("data-phase", "error");
  await expect(page.getByRole("status")).toContainText("Simulated save failed");
  await page.screenshot({ path: `test-results/FE-AA1/${test.info().project.name}-error.png`, fullPage: true });
  await page.getByLabel("Force success").check();
  await button.click();
  await expect(button).toHaveAttribute("data-phase", "success");
  await page.getByLabel("Disable button").check();
  await expect(button).toBeDisabled();
  await expect(button).toHaveAttribute("data-phase", "disabled");
  expect(errors).toEqual([]);
});

test("hover/press motion and reduced motion preserve accessible feedback", async ({ page }) => {
  await page.goto("/playground/buttons");
  const button = page.locator(".state-button");
  if (test.info().project.name === "chromium") {
    await button.hover();
    await expect.poll(() => button.evaluate(el => getComputedStyle(el).transform)).not.toBe("none");
  }
  await expect(button).toHaveCSS("transition-property", "transform");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(button).toHaveCSS("transform", "none");
  await button.click();
  await expect(button).toHaveAttribute("data-phase", "loading");
  await expect(page.locator(".state-button__spinner")).toHaveCSS("animation-name", "none");
  await expect(button).toHaveAccessibleName("Saving demo draft");
  await expect(button).toHaveAttribute("data-phase", "success");
  await expect(page.getByRole("status")).toContainText("Simulated save completed");
  const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(result.violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
