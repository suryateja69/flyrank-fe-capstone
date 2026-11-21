import { test, expect } from "@playwright/test";

test("practice widgets work through keyboard alone", async ({ page }) => {
  await page.goto("/playground");
  const trigger = page.getByRole("button", { name: "Open custom dialog" });
  // Reach the trigger with real Tab navigation, without a pointer or focus injection.
  for (let count = 0; count < 30; count++) {
    if (await trigger.evaluate((node) => node === document.activeElement)) break;
    await page.keyboard.press("Tab");
  }
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Enter");
  const input = page.getByLabel("Workspace name", { exact: true });
  await expect(input).toBeFocused();
  await expect(page.locator("body > div[inert]").first()).toBeAttached();
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("button", { name: "Done", exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(input).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("tab", { name: "Overview", exact: true })).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("tab", { name: "Privacy", exact: true })).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("End");
  await expect(page.getByRole("tab", { name: "Privacy", exact: true })).toBeFocused();
  await page.keyboard.press("Home");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("tabpanel", { name: "Overview", exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  const disclosure = page.getByRole("button", { name: "How is a lead scored?" });
  await expect(disclosure).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(disclosure).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Space");
  await expect(disclosure).toHaveAttribute("aria-expanded", "false");
});
