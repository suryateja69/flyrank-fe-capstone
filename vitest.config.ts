import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    environment: "jsdom",
    reporters: ["default", "junit"],
    outputFile: { junit: "test-results/vitest-junit.xml" },
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "html"],
      thresholds: { statements: 80, branches: 70, functions: 75, lines: 80 },
      include: [
        "src/components/{message,tool-result,score-card,settings-form,playground,chat,state-button,button-demo}.tsx",
      ],
    },
  },
});
