import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    reporters: ["verbose"],
    coverage: {
      enabled: true,
      cleanOnRerun: true,
      provider: "v8",
      reporter: ["html", "json", "text"],
      reportOnFailure: true,
      reportsDirectory: "coverage",
    },
    environment: "node",
    ui: true,
    bail: 5,
    // watch: true,
  },
  cacheDir: "./node_modules/.vitest",
});
