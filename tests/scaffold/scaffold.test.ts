import { describe, it, expect, beforeEach } from "vitest";
import { execa } from "execa";
import fs from "fs-extra";
import path from "path";
import * as tempy from "tempy";

const CLI_PATH = path.join(__dirname, "../../dist/cli/index.js");

describe("scaffold dir", () => {
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

  // New tests start here

  it("should skip existing files without --force and overwrite with --force", async () => {
    const template = {
      files: {
        hello: { type: "txt", content: "original" },
      },
    };
    const customPath = path.join(tempDir, "template.json");
    await fs.writeJSON(customPath, template);

    // First run (create)
    await execa("node", [
      CLI_PATH,
      "scaffold",
      "dir",
      "--entry",
      tempDir,
      "--schema",
      customPath,
      "--non-interactive",
    ]);

    // Modify the file manually
    const filePath = path.join(tempDir, "hello.txt");
    await fs.writeFile(filePath, "changed");

    // Second run without --force (should NOT overwrite)
    await execa("node", [
      CLI_PATH,
      "scaffold",
      "dir",
      "--entry",
      tempDir,
      "--schema",
      customPath,
      "--non-interactive",
    ]);
    expect(await fs.readFile(filePath, "utf-8")).toBe("changed");

    // Third run with --force (should overwrite)
    await execa("node", [
      CLI_PATH,
      "scaffold",
      "dir",
      "--entry",
      tempDir,
      "--schema",
      customPath,
      "--non-interactive",
      "--force",
    ]);
    expect(await fs.readFile(filePath, "utf-8")).toBe("original");
  }, 10_000);

  it("should create nested folder and files correctly", async () => {
    const nestedTemplate = {
      src: {
        components: {
          files: {
            Header: { type: "tsx", content: "<header>Header</header>" },
          },
        },
        utils: {
          files: {
            helpers: { type: "ts", content: "// helper functions" },
          },
        },
      },
    };
    const customPath = path.join(tempDir, "nested.json");
    await fs.writeJSON(customPath, nestedTemplate);

    await execa("node", [
      CLI_PATH,
      "scaffold",
      "dir",
      "--entry",
      tempDir,
      "--schema",
      customPath,
      "--non-interactive",
      "--force",
    ]);

    expect(
      await fs.pathExists(path.join(tempDir, "src/components/Header.tsx"))
    ).toBe(true);
    expect(
      await fs.readFile(
        path.join(tempDir, "src/components/Header.tsx"),
        "utf-8"
      )
    ).toBe("<header>Header</header>");

    expect(
      await fs.pathExists(path.join(tempDir, "src/utils/helpers.ts"))
    ).toBe(true);
    expect(
      await fs.readFile(path.join(tempDir, "src/utils/helpers.ts"), "utf-8")
    ).toBe("// helper functions");
  });

  it("should create empty files from 'paths'", async () => {
    const pathsTemplate = {
      paths: ["README.md", "src/empty.ts"],
    };
    const customPath = path.join(tempDir, "paths.json");
    await fs.writeJSON(customPath, pathsTemplate);

    await execa("node", [
      CLI_PATH,
      "scaffold",
      "dir",
      "--entry",
      tempDir,
      "--schema",
      customPath,
      "--non-interactive",
      "--force",
    ]);

    const readmePath = path.join(tempDir, "README.md");
    const emptyTsPath = path.join(tempDir, "src/empty.ts");

    expect(await fs.pathExists(readmePath)).toBe(true);
    expect((await fs.stat(readmePath)).size).toBe(0);

    expect(await fs.pathExists(emptyTsPath)).toBe(true);
    expect((await fs.stat(emptyTsPath)).size).toBe(0);
  });

  it("should fail gracefully on invalid JSON in custom template", async () => {
    const brokenPath = path.join(tempDir, "broken.json");
    await fs.writeFile(brokenPath, "{ this is not valid JSON }", "utf-8");

    const result = await execa(
      "node",
      [
        CLI_PATH,
        "scaffold",
        "dir",
        "--entry",
        tempDir,
        "--schema",
        brokenPath,
        "--non-interactive",
      ],
      { reject: false }
    );

    expect(result.stderr).toContain("Error reading custom template");
  });

  it("should error when missing --entry in non-interactive mode", async () => {
    const result = await execa(
      "node",
      [
        CLI_PATH,
        "scaffold",
        "dir",
        "--template",
        "react-default",
        "--non-interactive",
        "--force",
      ],
      { reject: false }
    );
    expect(result.stderr).toContain(
      "Entry folder is required in non-interactive mode"
    );
  });

  it("should error when using both interactive and non-interactive flags", async () => {
    const result = await execa(
      "node",
      [
        CLI_PATH,
        "scaffold",
        "dir",
        "--interactive",
        "--non-interactive",
        "--force",
      ],
      { reject: false }
    );
    expect(result.stderr).toContain(
      "Cannot use interactive mode in non-interactive mode"
    );
  });
});
