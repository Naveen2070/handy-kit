import { describe, it, expect, beforeEach } from "vitest";
import { execa } from "execa";
import fs from "fs-extra";
import path from "path";
import * as tempy from "tempy";

const CLI_PATH = path.join(__dirname, "../../dist/cli/index.js");

describe("code unused CLI", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = tempy.temporaryDirectory();
  });

  it("should detect unused exports", async () => {
    const srcDir = path.join(tempDir, "src");
    await fs.ensureDir(srcDir);

    await fs.writeFile(
      path.join(srcDir, "foo.ts"),
      `export const unusedVar = 42;`
    );

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

  it("should not flag used exports as unused", async () => {
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

    await fs.writeFile(path.join(srcDir, "orphan.ts"), `export const x = 1;`);
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

  it("should not flag used files as unused", async () => {
    const srcDir = path.join(tempDir, "src");
    await fs.ensureDir(srcDir);

    await fs.writeFile(path.join(srcDir, "util.ts"), `export const x = 99;`);
    await fs.writeFile(
      path.join(srcDir, "index.ts"),
      `import { x } from "./util"; console.log(x);`
    );

    const result = await execa("node", [
      CLI_PATH,
      "code",
      "unused",
      "--path",
      srcDir,
      "--files",
    ]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("No unused files found");
  });

  it("should handle combined mode (--files --exports)", async () => {
    const srcDir = path.join(tempDir, "src");
    await fs.ensureDir(srcDir);

    await fs.writeFile(
      path.join(srcDir, "foo.ts"),
      `export const bar = 7; export const unused = 9;`
    );
    await fs.writeFile(
      path.join(srcDir, "index.ts"),
      `import { bar } from "./foo"; console.log(bar);`
    );

    const result = await execa("node", [
      CLI_PATH,
      "code",
      "unused",
      "--path",
      srcDir,
      "--files",
      "--exports",
    ]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Unused export: 'unused'");
    expect(result.stdout).not.toContain("bar");
  });

  it("should handle index re-exports", async () => {
    const srcDir = path.join(tempDir, "src");
    await fs.ensureDir(srcDir);

    await fs.writeFile(path.join(srcDir, "a.ts"), `export const a = 1;`);
    await fs.writeFile(path.join(srcDir, "b.ts"), `export * from "./a";`);
    await fs.writeFile(
      path.join(srcDir, "index.ts"),
      `import { a } from "./b"; console.log(a);`
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

  it("should handle circular imports without false positives", async () => {
    const srcDir = path.join(tempDir, "src");
    await fs.ensureDir(srcDir);

    await fs.writeFile(
      path.join(srcDir, "a.ts"),
      `import { b } from "./b"; export const a = 1; console.log(b);`
    );
    await fs.writeFile(
      path.join(srcDir, "b.ts"),
      `import { a } from "./a"; export const b = 2; console.log(a);`
    );
    await fs.writeFile(path.join(srcDir, "index.ts"), `import "./a";`);

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

  it("should handle empty project directory gracefully", async () => {
    const srcDir = path.join(tempDir, "empty");
    await fs.ensureDir(srcDir);

    const result = await execa("node", [
      CLI_PATH,
      "code",
      "unused",
      "--path",
      srcDir,
      "--files",
    ]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("No unused files found");
  });

  it("should show help message", async () => {
    const result = await execa("node", [CLI_PATH, "code", "unused", "--help"], {
      reject: false,
    });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Show unused exports and files");
  });
});
