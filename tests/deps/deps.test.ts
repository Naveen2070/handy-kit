import { describe, it, expect, beforeEach } from "vitest";
import { execa } from "execa";
import path from "path";
import fs from "fs-extra";

const CLI_PATH = path.join(__dirname, "../../dist/cli/index.js");

const DIOR_PROJECT_PATH = path.resolve(__dirname, "../../");

describe("deps CLI", () => {
  let projectDir: string;

  beforeEach(() => {
    projectDir = DIOR_PROJECT_PATH;
  });

  it("should show deps help", async () => {
    const result = await execa("node", [CLI_PATH, "deps", "help"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Dependency related commands");
    expect(result.stdout).toContain("Subcommands:");
  });

  it("should show deps size help", async () => {
    const result = await execa("node", [CLI_PATH, "deps", "size", "--help"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Show dependency sizes");
    expect(result.stdout).toContain("deps size [--verbose");
  });

  it("should run deps size without flags", async () => {
    const result = await execa("node", [CLI_PATH, "deps", "size"], {
      cwd: projectDir,
    });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toMatch(/Dependencies:/);
  });

  it("should run deps size with flags", async () => {
    const result = await execa(
      "node",
      [
        CLI_PATH,
        "deps",
        "size",
        "--verbose",
        "--tree",
        "--depth=1",
        "--concurrency=2",
      ],
      { cwd: projectDir }
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toMatch(/Dependencies:/);
    expect(result.stdout).toMatch(/Size:/);
  });

  it("should export results when --export flag is used", async () => {
    const exportPath = path.join(projectDir, "deps-output.json");

    const result = await execa("node", [
      CLI_PATH,
      "deps",
      "size",
      "--export",
      exportPath,
    ]);

    expect(result.exitCode).toBe(0);
    expect(await fs.pathExists(exportPath)).toBe(true);

    const json = await fs.readJson(exportPath);

    expect(json).toHaveProperty("dependencies");
    expect(json).toHaveProperty("devDependencies");

    // Clean up
    await fs.remove(exportPath);
  });
});
