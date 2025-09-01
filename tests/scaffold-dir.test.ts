import { describe, it, expect, beforeEach } from "vitest";
import { execa } from "execa";
import fs from "fs-extra";
import path from "path";
import * as tempy from "tempy";

// Path to your CLI binary (adjust if different)
const CLI_PATH = path.join(__dirname, "../dist/cli/index.js");

describe("scaffold dir CLI", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = tempy.temporaryDirectory(); // fresh dir for each test
  });

  it("should create default scaffold structure", async () => {
    const result = await execa("node", [
      CLI_PATH,
      "scaffold",
      "dir",
      "--entry",
      tempDir,
      "--template",
      "react-default",
      "--non-interactive",
      "--force",
    ]);

    expect(result.exitCode).toBe(0);
    expect(await fs.pathExists(path.join(tempDir, "components"))).toBe(true);
    expect(await fs.pathExists(path.join(tempDir, "assets"))).toBe(true);
    expect(await fs.pathExists(path.join(tempDir, "utils"))).toBe(true);
    expect(await fs.pathExists(path.join(tempDir, "pages"))).toBe(true);
    expect(await fs.pathExists(path.join(tempDir, "hooks"))).toBe(true);
  });

  it("should error on invalid template name", async () => {
    const result = await execa(
      "node",
      [
        CLI_PATH,
        "scaffold",
        "dir",
        "--entry",
        tempDir,
        "--template",
        "unknown-template",
        "--non-interactive",
        "--force",
      ],
      { reject: false }
    );

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toContain("Template not found");
  });

  it("should create structure from custom template file", async () => {
    const customTemplatePath = path.join(tempDir, "custom-template.json");
    const customTemplate = {
      src: {
        components: {
          files: {
            Button: { type: "js", content: "console.log('Button');" },
          },
        },
        files: {
          index: { type: "js", content: "console.log('Hello');" },
        },
      },
    };
    await fs.writeJSON(customTemplatePath, customTemplate);

    const result = await execa("node", [
      CLI_PATH,
      "scaffold",
      "dir",
      "--entry",
      tempDir,
      "--schema",
      customTemplatePath,
      "--non-interactive",
      "--force",
    ]);

    const buttonFile = path.join(tempDir, "src/components/Button.js");
    const indexFile = path.join(tempDir, "src/index.js");

    expect(await fs.pathExists(buttonFile)).toBe(true);
    expect(await fs.readFile(buttonFile, "utf-8")).toContain("Button");
    expect(await fs.readFile(indexFile, "utf-8")).toContain("Hello");
  });

  it("should show help message", async () => {
    const result = await execa(
      "node",
      [CLI_PATH, "scaffold", "dir", "--help"],
      { reject: false }
    );

    expect(result.stdout).toContain("Create a directory structure");
  });
});
