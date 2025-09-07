import { describe, it, expect, beforeEach } from "vitest";
import { execa } from "execa";
import fs from "fs-extra";
import path from "path";
import * as tempy from "tempy";

const CLI_PATH = path.join(__dirname, "../../dist/cli/index.js");

describe("git CLI", () => {
  let repoDir: string;

  beforeEach(async () => {
    repoDir = tempy.temporaryDirectory();

    await execa("git", ["init"], { cwd: repoDir });

    // First commit by Alice
    await fs.writeFile(path.join(repoDir, "README.md"), "# Test Repo");
    await execa("git", ["add", "."], { cwd: repoDir });
    await execa(
      "git",
      ["commit", "-m", "Initial commit", "--author=Alice <alice@example.com>"],
      {
        cwd: repoDir,
        env: {
          GIT_COMMITTER_NAME: "Alice",
          GIT_COMMITTER_EMAIL: "alice@example.com",
        },
      }
    );

    // Second commit by Bob
    await fs.writeFile(path.join(repoDir, "file.txt"), "Hello");
    await execa("git", ["add", "."], { cwd: repoDir });
    await execa(
      "git",
      ["commit", "-m", "Second commit", "--author=Bob <bob@example.com>"],
      {
        cwd: repoDir,
        env: {
          GIT_COMMITTER_NAME: "Bob",
          GIT_COMMITTER_EMAIL: "bob@example.com",
        },
      }
    );
  });

  it("should show git help", async () => {
    const result = await execa("node", [CLI_PATH, "git", "help"], {
      cwd: repoDir,
    });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Git utilities");
  });

  it("should show error when no time filters are passed to standup", async () => {
    const result = await execa("node", [CLI_PATH, "git", "standup"], {
      cwd: repoDir,
      reject: false,
    });
    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("❌");
  });

  it("should show standup with --days filter", async () => {
    const result = await execa(
      "node",
      [CLI_PATH, "git", "standup", "--days", "7"],
      { cwd: repoDir }
    );
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("📅");
    expect(result.stdout).toMatch(/- \[.+\] .+ \(Alice|Bob\)/);
  });

  it("should export standup report to custom path", async () => {
    const outputPath = path.join(repoDir, "standup.md");
    const result = await execa(
      "node",
      [CLI_PATH, "git", "standup", "--days", "7", "--export", outputPath],
      { cwd: repoDir }
    );
    expect(result.exitCode).toBe(0);
    const content = await fs.readFile(outputPath, "utf-8");
    expect(content).toContain("Git Standup Report");
  });

  it("should filter standup by author (case-insensitive)", async () => {
    const result = await execa(
      "node",
      [CLI_PATH, "git", "standup", "--days", "7", "--author", "alice"],
      { cwd: repoDir }
    );
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("(Alice)");
    expect(result.stdout).not.toContain("(Bob)");
  });

  it("should return no results when branch doesn't match", async () => {
    const result = await execa(
      "node",
      [CLI_PATH, "git", "standup", "--days", "7", "--branch", "nonexistent"],
      {
        cwd: repoDir,
        reject: false,
      }
    );
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain(
      "❌ Not a git repository or unable to fetch logs."
    );
  });

  it("should show stats for authors since date", async () => {
    const result = await execa(
      "node",
      [CLI_PATH, "git", "stats", "--since", "2022-01-01"],
      { cwd: repoDir }
    );
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("GIT CONTRIBUTION REPORT");
    expect(result.stdout).toContain("👤 Alice");
    expect(result.stdout).toContain("👤 Bob");
  });

  it("should export stats to JSON", async () => {
    await execa(
      "node",
      [CLI_PATH, "git", "stats", "--since", "2022-01-01", "--export", "json"],
      { cwd: repoDir }
    );
    const files = await fs.readdir(path.join(repoDir, "exported-reports"));
    const jsonFile = files.find((f) => f.endsWith(".json"));
    const content = await fs.readJSON(
      path.join(repoDir, "exported-reports", jsonFile!)
    );
    expect(content).toHaveProperty("contributors");
    expect(content).toHaveProperty("stats");
  });

  it("should gracefully handle unknown export format", async () => {
    const result = await execa(
      "node",
      [CLI_PATH, "git", "stats", "--since", "2022-01-01", "--export", "zip"],
      { cwd: repoDir }
    );
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("GIT CONTRIBUTION REPORT");
  });

  it("should display visual chart in stats output", async () => {
    const result = await execa(
      "node",
      [CLI_PATH, "git", "stats", "--since", "2022-01-01", "--metric", "added"],
      { cwd: repoDir }
    );
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("=== Contribution Chart ===");
  });

  it("should handle git repo with no commits", async () => {
    const emptyDir = tempy.temporaryDirectory();
    await execa("git", ["init"], { cwd: emptyDir });

    const result = await execa(
      "node",
      [CLI_PATH, "git", "stats", "--since", "2020-01-01"],
      {
        cwd: emptyDir,
        reject: false,
      }
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain(
      "❌ Not a git repository or unable to fetch logs."
    );
  });

  it("should show error outside a git repo", async () => {
    const nonGitDir = tempy.temporaryDirectory();

    const result = await execa(
      "node",
      [CLI_PATH, "git", "standup", "--days", "1"],
      {
        cwd: nonGitDir,
        reject: false,
      }
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("❌ Not a git repository");
  });

  it("should handle negative numbers in date flags", async () => {
    const result = await execa(
      "node",
      [CLI_PATH, "git", "standup", "--days", "-3"],
      { cwd: repoDir, reject: false }
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("❌");
  });
});
