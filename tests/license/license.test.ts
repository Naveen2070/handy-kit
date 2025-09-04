import { describe, it, expect, beforeEach } from "vitest";
import { execa } from "execa";
import fs from "fs-extra";
import path from "path";
import * as tempy from "tempy";

const CLI_PATH = path.join(__dirname, "../../dist/cli/index.js");

describe("license CLI", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = tempy.temporaryDirectory();
  });

  it("should show license help", async () => {
    const result = await execa("node", [CLI_PATH, "license", "help"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Manage open-source licenses");
    expect(result.stdout).toContain("Subcommands:");
  });

  it("should show license-gen help", async () => {
    const result = await execa("node", [CLI_PATH, "license", "gen", "--help"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Generate an open-source license");
    expect(result.stdout).toContain("Supported licenses:");
  });

  it("should error when required args are missing", async () => {
    const result = await execa("node", [CLI_PATH, "license", "gen"], {
      reject: false,
    });

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain(
      "❌ Missing required arguments for 'license gen'"
    );
  });

  it("should error on unsupported license", async () => {
    const result = await execa(
      "node",
      [CLI_PATH, "license", "gen", "unknown", "--author", "Alice"],
      { reject: false }
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("❌ License type 'unknown' not supported");
  });

  it("should generate a license file with force overwrite", async () => {
    const outputPath = path.join(tempDir, "LICENSE");
    const result = await execa("node", [
      CLI_PATH,
      "license",
      "gen",
      "MIT",
      "--author",
      "Alice",
      "--output",
      outputPath,
      "--force",
    ]);

    const content = await fs.readFile(outputPath, "utf-8");

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("✅ License file MIT created successfully");
    expect(content).toContain("MIT License");
    expect(content).toContain("Alice");
  });

  it("should prompt when file exists and allow cancel (simulated input)", async () => {
    const outputPath = path.join(tempDir, "LICENSE");
    await fs.writeFile(outputPath, "Existing content");

    const child = execa(
      "node",
      [
        CLI_PATH,
        "license",
        "gen",
        "MIT",
        "--author",
        "Bob",
        "--output",
        outputPath,
      ],
      {
        stdin: "pipe",
      }
    );

    // Simulate user typing 'c' and pressing enter
    setTimeout(() => {
      if (child.stdin) {
        child.stdin.write("c\n");
        child.stdin.end();
      }
    }, 200);

    const result = await child;

    const content = await fs.readFile(outputPath, "utf-8");

    // Dynamically match the full file path
    expect(result.stdout).toContain(`⚠️ File '${outputPath}' already exists.`);
    expect(result.stdout).toContain("❌ Cancelled.");
    expect(content).toBe("Existing content");
  }, 10000);

  it("should generate credits file from dependencies", async () => {
    const pkgJson = {
      name: "test-app",
      version: "1.0.0",
      dependencies: {
        lodash: "^4.17.21",
      },
    };

    await fs.writeJSON(path.join(tempDir, "package.json"), pkgJson);
    await fs.ensureDir(path.join(tempDir, "node_modules/lodash"));
    await fs.writeJSON(path.join(tempDir, "node_modules/lodash/package.json"), {
      name: "lodash",
      version: "4.17.21",
      license: "MIT",
      homepage: "https://lodash.com",
    });

    const result = await execa(
      "node",
      [CLI_PATH, "license", "credits", "--output", "CREDITS.md"],
      { cwd: tempDir }
    );

    const creditsPath = path.join(tempDir, "CREDITS.md");
    const content = await fs.readFile(creditsPath, "utf-8");

    expect(result.exitCode).toBe(0);
    expect(content).toContain("## License: MIT");
    expect(content).toContain("**lodash** v4.17.21");
    expect(content).toContain("[homepage](https://lodash.com)");
  });

  it("should show help for license credits", async () => {
    const result = await execa("node", [
      CLI_PATH,
      "license",
      "credits",
      "--help",
    ]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Generate a credits file");
  });
});
