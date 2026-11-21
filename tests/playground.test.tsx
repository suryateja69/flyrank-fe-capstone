import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { HandDialog, HandTabs, HandDisclosure } from "../playground/handmade";

it("isolates background, wraps both ways, and restores prior inert state and focus", async () => {
  const user = userEvent.setup();
  const preserved = document.createElement("aside");
  preserved.setAttribute("inert", "");
  document.body.append(preserved);
  const { container, unmount } = render(<HandDialog />);
  await user.tab();
  const trigger = screen.getByRole("button", { name: "Open custom dialog" });
  await user.keyboard("{Enter}");
  expect(container).toHaveAttribute("inert");
  const input = screen.getByLabelText("Workspace name");
  expect(input).toHaveFocus();
  await user.tab({ shift: true });
  expect(screen.getByRole("button", { name: "Done" })).toHaveFocus();
  await user.tab();
  expect(input).toHaveFocus();
  fireEvent.focusIn(trigger);
  expect(input).toHaveFocus();
  await user.keyboard("{Escape}");
  expect(trigger).toHaveFocus();
  expect(container).not.toHaveAttribute("inert");
  expect(preserved).toHaveAttribute("inert");
  unmount();
  preserved.remove();
});

it("links multiple dialog instances to unique input labels", async () => {
  const user = userEvent.setup();
  render(<><HandDialog /><HandDialog /></>);
  const triggers = screen.getAllByRole("button", { name: "Open custom dialog" });
  await user.click(triggers[1]);
  expect(screen.getByLabelText("Workspace name")).toHaveFocus();
  await user.keyboard("{Escape}");
  expect(triggers[1]).toHaveFocus();
});

it("wraps arrows, maintains one tab stop, and lets Tab enter the selected panel", async () => {
  const user = userEvent.setup();
  render(<HandTabs />);
  await user.tab();
  await user.keyboard("{ArrowLeft}");
  expect(screen.getByRole("tab", { name: "Privacy" })).toHaveFocus();
  await user.keyboard("{ArrowRight}{End}{Home}");
  const selected = screen.getByRole("tab", { selected: true });
  expect(selected).toHaveAccessibleName("Overview");
  expect(screen.getAllByRole("tab").filter((tab) => tab.tabIndex === 0)).toHaveLength(1);
  await user.tab();
  expect(screen.getByRole("tabpanel")).toHaveFocus();
  expect(selected.getAttribute("aria-controls")).toBe(screen.getByRole("tabpanel").id);
});

it("discloses the linked content with Enter and Space without moving focus", async () => {
  const user = userEvent.setup();
  render(<HandDisclosure />);
  await user.tab();
  const button = screen.getByRole("button");
  const content = document.getElementById(button.getAttribute("aria-controls")!);
  expect(content).not.toBeVisible();
  await user.keyboard("{Enter}");
  expect(content).toBeVisible();
  expect(button).toHaveAttribute("aria-expanded", "true");
  await user.keyboard(" ");
  expect(content).not.toBeVisible();
  expect(button).toHaveFocus();
});
