import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationPreferencesForm } from "@/components/notification-preferences-form";

const key = "leaddesk-notification-preferences";
const checkbox = () => screen.getByRole("checkbox", { name: "Email notifications" });
const digest = () => screen.getByRole("combobox", { name: "Digest frequency" });
const save = () => screen.getByRole("button", { name: "Save notification preferences" });

describe("Notification preferences", () => {
  it("persists only on Save, restores weekly on remount and clears stale success on edit", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<NotificationPreferencesForm />);
    expect(digest()).toBeDisabled();
    await user.click(checkbox());
    await user.selectOptions(digest(), "weekly");
    expect(localStorage.getItem(key)).toBeNull();
    await user.click(save());
    expect(JSON.parse(localStorage.getItem(key)!)).toEqual({ emailNotifications: true, digestFrequency: "weekly" });
    expect(screen.getByRole("status")).toHaveTextContent("saved");
    await user.click(checkbox());
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(digest()).toBeDisabled();
    expect(digest()).toHaveValue("weekly");
    unmount();
    render(<NotificationPreferencesForm />);
    expect(checkbox()).toBeChecked();
    expect(digest()).toHaveValue("weekly");
  });

  it("saves off without losing weekly and restores both values", async () => {
    localStorage.setItem(key, JSON.stringify({ emailNotifications: true, digestFrequency: "weekly" }));
    const user = userEvent.setup();
    const { unmount } = render(<NotificationPreferencesForm />);
    await user.click(checkbox());
    await user.click(save());
    unmount();
    render(<NotificationPreferencesForm />);
    expect(checkbox()).not.toBeChecked();
    expect(digest()).toBeDisabled();
    expect(digest()).toHaveValue("weekly");
  });

  it.each(["{", "null", "[]", '{}', '{"emailNotifications":"false","digestFrequency":"daily"}', '{"emailNotifications":true,"digestFrequency":"monthly"}', '{"emailNotifications":true,"digestFrequency":"daily","extra":1}'])
  ("falls back safely for malformed cache %s without overwriting it", (raw) => {
    localStorage.setItem(key, raw);
    render(<NotificationPreferencesForm />);
    expect(checkbox()).not.toBeChecked();
    expect(digest()).toHaveValue("daily");
    expect(localStorage.getItem(key)).toBe(raw);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("handles blocked reads and lets users retry saving", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new DOMException("Blocked", "SecurityError"); });
    render(<NotificationPreferencesForm />);
    expect(screen.getByRole("alert")).toHaveTextContent("could not be read");
    expect(checkbox()).not.toBeChecked();
    await userEvent.setup().click(save());
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("saved");
  });

  it("reports failed writes without false success, then succeeds on retry", async () => {
    const user = userEvent.setup();
    render(<NotificationPreferencesForm />);
    await user.click(save());
    const write = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("Full", "QuotaExceededError"); });
    await user.click(save());
    expect(screen.getByRole("alert")).toHaveTextContent("could not be saved");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    write.mockRestore();
    await user.click(save());
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("saved");
  });

  it("uses native keyboard controls and skips a disabled digest", async () => {
    const user = userEvent.setup();
    render(<NotificationPreferencesForm />);
    await user.tab();
    expect(checkbox()).toHaveFocus();
    await user.tab();
    expect(save()).toHaveFocus();
    await user.tab({ shift: true });
    await user.keyboard(" ");
    expect(checkbox()).toBeChecked();
    await user.tab();
    expect(digest()).toHaveFocus();
    await user.selectOptions(digest(), "weekly");
    await user.tab();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("status")).toHaveTextContent("saved");
  });
});
