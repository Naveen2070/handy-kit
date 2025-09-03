import { describe, it, expect, beforeEach } from "vitest";
import { execa } from "execa";
import fs from "fs-extra";
import path from "path";
import * as tempy from "tempy";

const CLI_PATH = path.join(__dirname, "../dist/cli/index.js");

describe("code unused CLI", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = tempy.temporaryDirectory(); // fresh dir for each test
  });

  it("should detect unused exports", async () => {
    const srcDir = path.join(tempDir, "src");
    await fs.ensureDir(srcDir);

    // file with unused export
    await fs.writeFile(
      path.join(srcDir, "foo.ts"),
      `export const unusedVar = 42;`
    );

    // entry file that does not import foo.ts
    await fs.writeFile(path.join(srcDir, "index.ts"), `console.log("hello");`);

    const result = await execa("node", [
      CLI_PATH,
      "code",
      "unused",
      "--path",
      srcDir,
      "--exports",
    ]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Unused export: 'unusedVar'");
  });

  it("should not flag used exports", async () => {
    const srcDir = path.join(tempDir, "src");
    await fs.ensureDir(srcDir);

    await fs.writeFile(
      path.join(srcDir, "foo.ts"),
      `export const usedVar = 123;`
    );
    await fs.writeFile(
      path.join(srcDir, "index.ts"),
      `import { usedVar } from "./foo"; console.log(usedVar);`
    );

    const result = await execa("node", [
      CLI_PATH,
      "code",
      "unused",
      "--path",
      srcDir,
      "--exports",
    ]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("No unused exports found");
  });

  it("should detect unused files", async () => {
    const srcDir = path.join(tempDir, "src");
    await fs.ensureDir(srcDir);

    // unused file
    await fs.writeFile(path.join(srcDir, "orphan.ts"), `export const x = 1;`);

    // entry file
    await fs.writeFile(path.join(srcDir, "index.ts"), `console.log("entry");`);

    const result = await execa("node", [
      CLI_PATH,
      "code",
      "unused",
      "--path",
      srcDir,
      "--files",
    ]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Unused Files Detected");
    expect(result.stdout).toContain("orphan.ts");
  });

  it("should show help message", async () => {
    const result = await execa("node", [CLI_PATH, "code", "unused", "--help"], {
      reject: false,
    });

    expect(result.stdout).toContain("Show unused code");
    expect(result.exitCode).toBe(0);
  });
});
