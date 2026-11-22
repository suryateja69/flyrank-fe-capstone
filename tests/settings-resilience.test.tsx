import React from "react";
import { expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { SettingsForm } from "@/components/settings-form";

it.each(["{broken json", JSON.stringify({ name: {}, email: "bad" })])("ignores a corrupt preferences cache and keeps the form usable", (value) => {
  localStorage.setItem("leaddesk-preferences", value);
  render(<SettingsForm />);
  expect(screen.getByRole("textbox", { name: "Workspace name" })).toHaveValue("");
  expect(screen.getByRole("textbox", { name: "Contact email" })).toHaveValue("");
  expect(screen.getByRole("button", { name: "Save preferences" })).toBeEnabled();
});
it("preserves entered values and offers a useful error if device storage is blocked", () => {
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("Quota exceeded", "QuotaExceededError"); });
  render(<SettingsForm />);
  fireEvent.change(screen.getByRole("textbox", { name: "Workspace name" }), { target: { value: "Studio" } });
  fireEvent.change(screen.getByRole("textbox", { name: "Contact email" }), { target: { value: "demo@example.com" } });
  fireEvent.click(screen.getByRole("button", { name: "Save preferences" }));
  expect(screen.getByRole("alert")).toHaveTextContent("could not save the settings");
  expect(screen.queryByRole("status")).toBeNull();
  expect(screen.getByRole("textbox", { name: "Workspace name" })).toHaveValue("Studio");
  expect(screen.getByRole("textbox", { name: "Contact email" })).toHaveValue("demo@example.com");
});
