import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});
Element.prototype.scrollIntoView = vi.fn();
