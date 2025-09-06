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

  // ────────────────────────────────────────────
  // Help Commands
  // ────────────────────────────────────────────

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

  it("should show deps manage help", async () => {
    const result = await execa("node", [CLI_PATH, "deps", "manage", "--help"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Usage:");
    expect(result.stdout).toContain("deps manage");
  });

  // ────────────────────────────────────────────
  // deps size
  // ────────────────────────────────────────────

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

  // ────────────────────────────────────────────
  // deps manage
  // ────────────────────────────────────────────

  it("should run deps manage with --standard and --dry-run", async () => {
    const result = await execa(
      "node",
      [CLI_PATH, "deps", "manage", "--standard", "--dry-run"],
      { cwd: projectDir }
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toMatch(
      /Dry-run: The following packages would be updated|All dependencies are up to date/i
    );
  }, 20_000);

  it("should run deps manage with --upgrade and --dry-run (alias of --standard)", async () => {
    const result = await execa(
      "node",
      [CLI_PATH, "deps", "manage", "--upgrade", "--dry-run"],
      { cwd: projectDir }
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toMatch(
      /Dry-run: The following packages would be updated|All dependencies are up to date/i
    );
  }, 20_000);

  it("should run deps manage with --minor and --dry-run", async () => {
    const result = await execa(
      "node",
      [CLI_PATH, "deps", "manage", "--minor", "--dry-run"],
      { cwd: projectDir }
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toMatch(
      /Dry-run: The following packages would be upgraded \(minor\)|All dependencies are up to date/i
    );
  }, 20_000);

  it("should run deps manage with --major and --dry-run", async () => {
    const result = await execa(
      "node",
      [CLI_PATH, "deps", "manage", "--major", "--dry-run"],
      { cwd: projectDir }
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toMatch(
      /Dry-run: The following packages would be upgraded \(major\)|All dependencies are up to date/i
    );
  }, 20_000);

  it("should fallback to interactive mode if no upgrade flag is passed", async () => {
    const { stdout } = await execa("node", [CLI_PATH, "deps", "manage"], {
      cwd: projectDir,
      input: "4\n",
    });
    expect(stdout).toMatch(/Choose upgrade type:/i);
  });
});
